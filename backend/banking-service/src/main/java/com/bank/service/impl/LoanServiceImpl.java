package com.bank.service.impl;

import com.bank.dto.*;
import com.bank.entity.*;
import com.bank.exception.*;
import com.bank.repository.*;
import com.bank.service.LoanService;
import com.bank.util.ReferenceGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import com.bank.entity.KycStatus;

@Service
@RequiredArgsConstructor
public class LoanServiceImpl implements LoanService {

    private final CustomerRepository customerRepository;
    private final LoanRepository loanRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final LoanEmiRepository loanEmiRepository;
    private final LoanPaymentRepository loanPaymentRepository;
    private final KycRepository kycRepository;


    //==================================================
    // Apply Loan
    //==================================================

    @Override
    @Transactional
    public LoanResponse apply(LoanApplicationRequest request) {
        customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new CustomerNotFoundException( "Customer not found: "
                        + request.getCustomerId()
                ));
        if (request.getPrincipalAmount() == null
                || request.getPrincipalAmount().signum() <= 0)
        {
            throw new InvalidLoanStateException( "Principal amount must be greater than zero" );
        }
        if (request.getTenureMonths() == null || request.getTenureMonths() <= 0)
        {
            throw new InvalidLoanStateException( "Loan tenure must be greater than zero" );
        }
        BigDecimal interestRate = BigDecimal.valueOf(10.00)
                .setScale(2, RoundingMode.HALF_UP);

        Loan loan = Loan.builder()
                .customerId(request.getCustomerId())
                .loanType(request.getLoanType())
                .principalAmount(
                        request.getPrincipalAmount()
                            .setScale(4, RoundingMode.HALF_UP)
                )
                /* Temporary:
                 * interest rate is still coming from the request.
                 *
                 * In the next production step, this should be calculated
                 * by the bank based on loan type/customer/credit profile.
                 */
                .interestRate(interestRate)
                .tenureMonths(request.getTenureMonths())
                .status(LoanStatus.APPLIED)
                .build();

        Loan saved = loanRepository.save(loan);

        return toResponse(saved);
    }

    // ============================================================
    // KYC VERIFICATION
    // ============================================================

    @Override
    @Transactional
    public LoanResponse verifyKyc(Long loanId) {
        Loan loan = requireStatus(loanId, "APPLIED");
        Kyc kyc = kycRepository
                .findByCustomerCustomerId(loan.getCustomerId())
                .orElseThrow(()
                        -> new InvalidLoanStateException(
                        "Customer KYC has not been submitted"
                ));
        if (kyc.getStatus() != KycStatus.VERIFIED) {

            throw new InvalidLoanStateException(
                    "Customer KYC is not VERIFIED yet. Current status: "
                            + kyc.getStatus() );
        }
        loan.setStatus(LoanStatus.KYC_VERIFIED);
        return toResponse(loanRepository.save(loan));
    }

    // ============================================================
    // CREDIT EVALUATION
    // ============================================================

    @Override
    @Transactional
    public LoanResponse evaluateCredit(Long loanId) {
        Loan loan = requireStatus( loanId, "KYC_VERIFIED" );
        /*
         * Production credit evaluation will eventually check:
         *
         * - Credit score
         * - Existing loans
         * - Monthly income
         * - Debt-to-income ratio
         * - Existing EMI obligations
         * - Employment/business information
         * - Repayment history
         */
        loan.setStatus(LoanStatus.CREDIT_EVALUATED);
        return toResponse(loanRepository.save(loan));
    }

    // ============================================================
    // APPROVE
    // ============================================================

    @Override
    @Transactional
    public LoanResponse approve(Long loanId) {
        Loan loan = requireStatus(
                loanId,
                "CREDIT_EVALUATED"
        );

        loan.setStatus(LoanStatus.APPROVED);

        return toResponse(loanRepository.save(loan));
    }

    // ============================================================
    // SANCTION
    // ============================================================

    @Override
    @Transactional
    public LoanResponse sanction(Long loanId) {

        Loan loan = requireStatus(
                loanId,
                "APPROVED"
        );

        loan.setStatus(LoanStatus.SANCTIONED);

        return toResponse(loanRepository.save(loan));
    }

    // ============================================================
    // DISBURSE
    // ============================================================

    @Override
    @Transactional
    public LoanResponse disburse( Long loanId, DisburseLoanRequest request ) {
        /*
         * Lock the loan row.
         *
         * This prevents two simultaneous requests from both seeing
         * SANCTIONED and disbursing the same loan.
         */

        Loan loan = loanRepository
                .findByIdForUpdate(loanId)
                .orElseThrow(() ->
                        new LoanNotFoundException(
                                "Loan not found: " + loanId
                        ));

        if (!"SANCTIONED".equals(loan.getStatus())) {

            throw new InvalidLoanStateException(
                    "Loan " + loanId
                            + " must be SANCTIONED but is "
                            + loan.getStatus()
            );
        }

        /*
         * Lock destination account.
         */

        Account account = accountRepository
                .findByAccountNumberForUpdate( request.getToAccountNumber() )
                .orElseThrow(() ->
                        new AccountNotFoundException(
                                "Account not found: "
                                        + request.getToAccountNumber()
                        ));

        /*
         * IMPORTANT: * Loan can only be disbursed into an account owned
         * by the same customer.
         */
        if (!loan.getCustomerId().equals(account.getCustomerId())) {
            throw new InvalidLoanStateException(
                    "Disbursement account does not belong "
                            + "to the loan customer"
            );
        }

        if (!"ACTIVE".equals(account.getStatus())) {
            throw new AccountNotActiveException(
                    "Account "
                            + account.getAccountNumber()
                            + " is "
                            + account.getStatus() );
        }

        BigDecimal amount = loan.getPrincipalAmount()
                .setScale(4, RoundingMode.HALF_UP);
        BigDecimal before = account.getBalance();
        BigDecimal after = before.add(amount);

        /*
         * Credit customer's account.
         */
        account.setBalance(after);
        accountRepository.save(account);
        /*
         * Create banking transaction.
         */
        Transaction transaction = transactionRepository.save(
                Transaction.builder()
                        .transactionReference(
                                ReferenceGenerator.generateTransactionReference()
                        )
                        .transactionType(
                                "LOAN_DISBURSEMENT"
                        )
                        .toAccountNumber(
                                account.getAccountNumber()
                        )
                        .amount(amount)
                        .transactionStatus("SUCCESS")
                        .remarks( "Loan #"
                                + loan.getLoanId()
                                + " disbursement" )
                        .build()
        );

        /*
         * Create immutable ledger record.
         */

        ledgerEntryRepository.save(
                LedgerEntry.builder()
                        .transactionId(
                                transaction.getTransactionId()
                        )
                        .accountId(
                                account.getAccountId()
                        )
                        .entryType("CREDIT")
                        .amount(amount)
                        .balanceBefore(before)
                        .balanceAfter(after)
                        .build()
        );

        /*
         * Mark loan ACTIVE after successful disbursement.
         */

        loan.setStatus(LoanStatus.APPROVED);
        loan.setDisbursedAt(LocalDateTime.now());
        Loan savedLoan = loanRepository.save(loan);

        /*
         * Generate EMI schedule only after the loan has
         * successfully reached ACTIVE.
         */

        generateEmiSchedule(savedLoan);
        return toResponse(savedLoan);
    }

    // ============================================================
    // REJECT
    // ============================================================

    @Override
    @Transactional
    public LoanResponse reject(Long loanId) {
        Loan loan = loanRepository.findByIdForUpdate(loanId)
                .orElseThrow(()
                        -> new LoanNotFoundException( "Loan not found: " +
                        loanId
                ));
        if ("ACTIVE".equals(loan.getStatus())
                || "CLOSED".equals(loan.getStatus())
                || "DISBURSED".equals(loan.getStatus())) {
            throw new InvalidLoanStateException(
                    "Cannot reject loan in status: "
                            + loan.getStatus()
            );
        }

        loan.setStatus(LoanStatus.REJECTED);
        return toResponse(
                loanRepository.save(loan)
        );
    }

    // ============================================================
    // GET LOAN
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public LoanResponse getById(Long loanId) {
        Loan loan =
                loanRepository.findById(loanId)
                        .orElseThrow(() ->
                                new LoanNotFoundException(
                                        "Loan not found: " + loanId
                                ));
        return toResponse(loan);
    }

    // ============================================================
    // GET CUSTOMER LOANS
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<LoanResponse> getByCustomer(Long customerId) {
        return loanRepository
                .findByCustomerId(customerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ============================================================
    // GET EMI SCHEDULE
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<EmiResponse> getEmis(Long loanId) {
        /*
         * Make sure loan exists.
         */
        loanRepository.findById(loanId)
                .orElseThrow(() ->
                        new LoanNotFoundException( "Loan not found: " + loanId
                        ));
        return loanEmiRepository
                .findByLoanIdOrderByDueDateAsc(loanId)
                .stream()
                .map(e -> EmiResponse.builder()
                        .emiId(e.getEmiId())
                        .loanId(e.getLoanId())
                        .dueDate(e.getDueDate())
                        .emiAmount(e.getEmiAmount())
                        .status(e.getStatus())
                        .build()
                )
                .toList();
    }

    // ============================================================
    // PAY EMI
    // ============================================================

    @Override
    @Transactional
    public void payEmi( Long emiId, PayEmiRequest request ) {
        /*
         * Lock EMI.
         *
         * This prevents two simultaneous payment requests
         * from paying the same EMI incorrectly.
         */
        LoanEmi emi = loanEmiRepository.findByIdForUpdate(emiId)
                .orElseThrow(() ->
                        new LoanNotFoundException( "EMI not found: " + emiId
                        ));
        if ("PAID".equals(emi.getStatus())) {
            throw new InvalidLoanStateException(
                    "EMI " + emiId + " is already fully paid"
            );
        }
        /*
         * Find the loan.
         */

        Loan loan =
                loanRepository.findById(emi.getLoanId())
                        .orElseThrow(() ->
                                new LoanNotFoundException(
                                        "Loan not found: "
                                                + emi.getLoanId()
                                ));
        if (!"ACTIVE".equals(loan.getStatus())) {
            throw new InvalidLoanStateException(
                    "EMI payment is allowed only for ACTIVE loans"
            );
        }

        /*
         * Lock customer's account.
         */
        Account account =
                accountRepository
                        .findByAccountNumberForUpdate(
                                request.getAccountNumber()
                        )
                        .orElseThrow(() ->
                                new AccountNotFoundException(
                                        "Account not found: "
                                                + request.getAccountNumber()
                                ));
        /*
         * Security check:
         * payment account must belong to the loan customer.
         */

        if (!loan.getCustomerId().equals(account.getCustomerId())) {
            throw new InvalidLoanStateException(
                    "Payment account does not belong "
                            + "to the loan customer"
            );
        }

        if (!"ACTIVE".equals(account.getStatus())) {

            throw new AccountNotActiveException(
                    "Account "
                            + account.getAccountNumber()
                            + " is "
                            + account.getStatus()
            );
        }

        BigDecimal emiAmount =
                emi.getEmiAmount()
                        .setScale(2, RoundingMode.HALF_UP);

        /*
         * Calculate how much has already been paid.
         */

        BigDecimal alreadyPaid =
                loanPaymentRepository
                        .sumPaidAmountByEmiId(emiId)
                        .setScale(2, RoundingMode.HALF_UP);
        BigDecimal remaining = emiAmount.subtract(alreadyPaid);

        if (remaining.signum() <= 0) {
            emi.setStatus("PAID");
            loanEmiRepository.save(emi);

            throw new InvalidLoanStateException(
                    "EMI " + emiId + " is already fully paid" );
        }
        BigDecimal payment = request.getPaidAmount()
                .setScale(2, RoundingMode.HALF_UP);

        /*
         * Do not allow overpayment.
         */
        if (payment.compareTo(remaining) > 0) {
            throw new InvalidLoanStateException(
                    "Payment amount "
                            + payment
                            + " exceeds remaining EMI amount "
                            + remaining
            );
        }

        /*
         * Check account balance.
         */
        BigDecimal balance = account.getBalance()
                .setScale(4, RoundingMode.HALF_UP);

        if (balance.compareTo(payment) < 0) {
            throw new InvalidLoanStateException(
                    "Insufficient account balance"
            );
        }

        /*
         * Debit account.
         */
        BigDecimal newBalance = balance.subtract(payment);
        account.setBalance(newBalance);
        accountRepository.save(account);

        /*
         * Create transaction.
         */
        Transaction transaction = transactionRepository.save(
                Transaction.builder()
                        .transactionReference(
                                ReferenceGenerator
                                        .generateTransactionReference()
                        )
                        .transactionType(
                                "LOAN_EMI_PAYMENT" )
                        .fromAccountNumber(
                                account.getAccountNumber()
                        )
                        .amount(payment)
                        .transactionStatus("SUCCESS")
                        .remarks( "Loan EMI payment #" + emiId )
                        .build()
        );

        /*
         * Create ledger entry.
         */
        ledgerEntryRepository.save( LedgerEntry.builder()
                .transactionId( transaction.getTransactionId()
                )
                .accountId(
                        account.getAccountId()
                )
                .entryType("DEBIT")
                .amount(payment)
                .balanceBefore(balance)
                .balanceAfter(newBalance)
                .build()
        );
        /*
         * Store loan payment.
         */
        loanPaymentRepository.save( LoanPayment.builder()
                .emiId(emiId)
                .transactionId(
                        transaction.getTransactionId()
                )
                .paidAmount(payment)
                .build() );
        /*
         * Calculate total paid after this payment.
         */
        BigDecimal totalPaid = alreadyPaid.add(payment);

        /*
         * Update EMI status.
         */
        if (totalPaid.compareTo(emiAmount) >= 0) {
            emi.setStatus("PAID");
        } else {
            emi.setStatus("PARTIALLY_PAID");
        }
        loanEmiRepository.save(emi);
    }

    // ============================================================
    // EMI SCHEDULE GENERATION
    // ============================================================

    private void generateEmiSchedule(Loan loan) {
        BigDecimal principal = loan.getPrincipalAmount()
                .setScale(10, RoundingMode.HALF_UP);
        BigDecimal annualRate = loan.getInterestRate()
                .divide( BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP );
        BigDecimal monthlyRate = annualRate.divide( BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP );
        int months = loan.getTenureMonths();
        BigDecimal emiAmount;

        /*
         * Zero-interest loan.
         */ if (monthlyRate.signum() == 0) {
            emiAmount = principal.divide(
                    BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP );
        } else {
            /*
             * EMI formula:
             *
             * EMI = P × r × (1+r)^n
             * ----------------
             * (1+r)^n - 1
             */
            double rate = monthlyRate.doubleValue();
            double p = principal.doubleValue();
            double power = Math.pow( 1 + rate, months );
            double emi = p * rate * power / (power - 1);
            emiAmount = BigDecimal.valueOf(emi)
                    .setScale( 2, RoundingMode.HALF_UP );
        }

        LocalDate firstDueDate = LocalDate.now().plusMonths(1);
        for (int i = 0; i < months; i++) {
            loanEmiRepository.save( LoanEmi.builder()
                    .loanId(loan.getLoanId())
                    .dueDate( firstDueDate.plusMonths(i)
                    )
                    .emiAmount(emiAmount)
                    .status("DUE")
                    .build()
            );
        }
    }

    // ============================================================
    // STATE VALIDATION
    // ============================================================

    private Loan requireStatus( Long loanId, String expectedStatus ) {
        Loan loan = loanRepository.findByIdForUpdate(loanId)
                .orElseThrow(() ->
                        new LoanNotFoundException(
                                "Loan not found: " + loanId
                        ));
        if (!expectedStatus.equals(loan.getStatus())) {

            throw new InvalidLoanStateException(
                    "Loan "
                            + loanId
                            + " must be "
                            + expectedStatus
                            + " but is "
                            + loan.getStatus()
            );
        }
        return loan;
    }

    private LoanResponse toResponse(Loan l) {
        return LoanResponse.builder()
                .loanId(l.getLoanId())
                .customerId(l.getCustomerId())
                .loanType(l.getLoanType())
                .principalAmount(l.getPrincipalAmount())
                .interestRate(l.getInterestRate())
                .tenureMonths(l.getTenureMonths())
                .status(l.getStatus())
                .appliedAt(l.getAppliedAt())
                .disbursedAt(l.getDisbursedAt())
                .build();
    }
}
