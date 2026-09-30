package com.bank.service.impl;

import com.bank.entity.Account;
import com.bank.entity.LedgerEntry;
import com.bank.entity.Policy;
import com.bank.entity.PolicyPremiumPayment;
import com.bank.entity.Transaction;
import com.bank.repository.AccountRepository;
import com.bank.repository.LedgerEntryRepository;
import com.bank.repository.PolicyPremiumPaymentRepository;
import com.bank.repository.PolicyRepository;
import com.bank.repository.TransactionRepository;
import com.bank.util.PremiumScheduleUtil;
import com.bank.util.ReferenceGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

/**
 * Processes premium collection for ONE policy inside its own
 * transaction, so a failure for one policy (insufficient balance,
 * closed account, etc) doesn't roll back the other policies collected
 * in the same scheduled run. Deliberately a separate bean from
 * PremiumCollectionScheduler - a @Transactional method only gets
 * transaction demarcation when called through the Spring proxy, i.e.
 * from a *different* bean, not via self-invocation within one class.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PremiumCollectionProcessor {

    /** After this many consecutive failed attempts, the policy lapses. */
    @Value("${policy.premium.max-missed-attempts:3}")
    private int maxMissedAttempts;

    private final PolicyRepository policyRepository;
    private final PolicyPremiumPaymentRepository policyPremiumPaymentRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LedgerEntryRepository ledgerEntryRepository;

    @Transactional
    public void processDuePremium(Long policyId) {
        Policy policy = policyRepository.findById(policyId).orElse(null);
        if (policy == null || !"ACTIVE".equals(policy.getStatus())) {
            return; // already handled or changed status by the time this ran
        }

        LocalDate dueDate = policy.getNextPremiumDueDate();
        Optional<Account> accountOpt =
                accountRepository.findByAccountNumberForUpdate(policy.getPremiumAccountNumber());

        if (accountOpt.isEmpty() || !"ACTIVE".equals(accountOpt.get().getStatus())) {
            recordFailureAndMaybeLapse(policy, dueDate, "Premium account unavailable or inactive");
            return;
        }

        Account account = accountOpt.get();
        if (account.getBalance().compareTo(policy.getPremiumAmount()) < 0) {
            recordFailureAndMaybeLapse(policy, dueDate, "Insufficient balance in premium account");
            return;
        }

        BigDecimal before = account.getBalance();
        BigDecimal after = before.subtract(policy.getPremiumAmount());
        account.setBalance(after);
        accountRepository.save(account);

        Transaction txn = transactionRepository.save(Transaction.builder()
                .transactionReference(ReferenceGenerator.generateTransactionReference())
                .transactionType("PREMIUM_COLLECTION")
                .fromAccountNumber(account.getAccountNumber())
                .amount(policy.getPremiumAmount())
                .transactionStatus("SUCCESS")
                .remarks("Premium for policy " + policy.getPolicyNumber())
                .build());

        ledgerEntryRepository.save(LedgerEntry.builder()
                .transactionId(txn.getTransactionId())
                .accountId(account.getAccountId())
                .entryType("DEBIT")
                .amount(policy.getPremiumAmount())
                .balanceBefore(before)
                .balanceAfter(after)
                .build());

        policyPremiumPaymentRepository.save(PolicyPremiumPayment.builder()
                .policyId(policy.getPolicyId())
                .dueDate(dueDate)
                .amount(policy.getPremiumAmount())
                .status("SUCCESS")
                .transactionId(txn.getTransactionId())
                .build());

        policy.setMissedPremiumCount(0);
        // Advance from the SCHEDULED due date, not "today" - keeps the
        // cadence fixed (e.g. always the 15th) instead of drifting to
        // whatever day collection happened to succeed.
        policy.setNextPremiumDueDate(PremiumScheduleUtil.advance(dueDate, policy.getPremiumFrequency()));
        policyRepository.save(policy);

        log.info("Collected premium for policy {} ({}), next due {}",
                policy.getPolicyNumber(), policy.getPremiumAmount(), policy.getNextPremiumDueDate());
    }

    private void recordFailureAndMaybeLapse(Policy policy, LocalDate dueDate, String reason) {
        policyPremiumPaymentRepository.save(PolicyPremiumPayment.builder()
                .policyId(policy.getPolicyId())
                .dueDate(dueDate)
                .amount(policy.getPremiumAmount())
                .status("FAILED")
                .failureReason(reason)
                .build());

        int missed = policy.getMissedPremiumCount() == null ? 1 : policy.getMissedPremiumCount() + 1;
        policy.setMissedPremiumCount(missed);

        if (missed >= maxMissedAttempts) {
            policy.setStatus("LAPSED");
            log.warn("Policy {} LAPSED after {} missed premium attempts", policy.getPolicyNumber(), missed);
        } else {
            // nextPremiumDueDate is intentionally left unchanged on
            // failure, so the same due date keeps getting retried on
            // every subsequent daily run until it succeeds or the
            // policy lapses.
            log.info("Premium collection failed for policy {} ({}/{} missed): {}",
                    policy.getPolicyNumber(), missed, maxMissedAttempts, reason);
        }

        policyRepository.save(policy);
    }
}