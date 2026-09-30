package com.bank.service.impl;

import com.bank.dto.*;
import com.bank.entity.*;
import com.bank.exception.*;
import com.bank.repository.*;
import com.bank.service.PolicyService;
import com.bank.util.PolicyNumberGenerator;
import com.bank.util.ReferenceGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * NOTE on premium collection: issuing a policy here just creates the
 * record - it does NOT debit the first premium from
 * premiumAccountNumber, and there's no automation collecting
 * subsequent premiums either. Same gap as RecurringDepositService:
 * needs a scheduler (e.g. @Scheduled or a Kafka-driven job) to debit
 * the linked account on each premium due date, mark the policy LAPSED
 * on missed payments, etc. Reasonable to add once the core workflow
 * here is confirmed working.
 */
@Service
@RequiredArgsConstructor
public class PolicyServiceImpl implements PolicyService {

    private final LoanRepository loanRepository;
    private final PolicyRepository policyRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final PolicyPremiumPaymentRepository policyPremiumPaymentRepository;
    private final TransactionRepository transactionRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final LoanPaymentRepository loanPaymentRepository;
    private final KycRepository kycRepository;

 @Override
    @Transactional
    public PolicyResponse issue(IssuePolicyRequest request) {
        customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found: " + request.getCustomerId()));

        accountRepository.findByAccountNumber(request.getPremiumAccountNumber())
                .orElseThrow(() -> new AccountNotFoundException(
                        "Premium account not found: " + request.getPremiumAccountNumber()));

        String policyNumber;
        do {
            policyNumber = PolicyNumberGenerator.generate();
        } while (policyRepository.existsByPolicyNumber(policyNumber));

        LocalDate start = LocalDate.now();
        Policy policy = Policy.builder()
                .policyNumber(policyNumber)
                .customerId(request.getCustomerId())
                .policyType(request.getPolicyType())
                .productName(request.getProductName())
                .sumAssured(request.getSumAssured())
                .premiumAmount(request.getPremiumAmount())
                .premiumFrequency(request.getPremiumFrequency())
                .premiumAccountNumber(request.getPremiumAccountNumber())
                .nomineeName(request.getNomineeName())
                .nomineeRelationship(request.getNomineeRelationship())
                .startDate(start)
                .endDate(start.plusYears(request.getPolicyTermYears()))
                .nextPremiumDueDate(com.bank.util.PremiumScheduleUtil.advance(start, request.getPremiumFrequency()))
                .missedPremiumCount(0)
                .status("ACTIVE")
                .build();

        return toResponse(policyRepository.save(policy));
    }

    @Override
    public PolicyResponse getById(Long policyId) {
        return toResponse(policyRepository.findById(policyId)
                .orElseThrow(() -> new PolicyNotFoundException("Policy not found: " + policyId)));
    }

    @Override
    public List<PolicyResponse> getByCustomer(Long customerId) {
        return policyRepository.findByCustomerId(customerId).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public PolicyResponse cancel(Long policyId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new PolicyNotFoundException("Policy not found: " + policyId));
        policy.setStatus("CANCELLED");
        return toResponse(policyRepository.save(policy));
    }

    @Override
    public List<PremiumPaymentResponse> getPremiumHistory(Long policyId) {
        return policyPremiumPaymentRepository.findByPolicyIdOrderByProcessedAtDesc(policyId).stream()
                .map(p -> PremiumPaymentResponse.builder()
                        .paymentId(p.getPaymentId())
                        .policyId(p.getPolicyId())
                        .dueDate(p.getDueDate())
                        .amount(p.getAmount())
                        .status(p.getStatus())
                        .failureReason(p.getFailureReason())
                        .transactionId(p.getTransactionId())
                        .processedAt(p.getProcessedAt())
                        .build())
                .toList();
    }

    private PolicyResponse toResponse(Policy p) {
        return PolicyResponse.builder()
                .policyId(p.getPolicyId())
                .policyNumber(p.getPolicyNumber())
                .customerId(p.getCustomerId())
                .policyType(p.getPolicyType())
                .productName(p.getProductName())
                .sumAssured(p.getSumAssured())
                .premiumAmount(p.getPremiumAmount())
                .premiumFrequency(p.getPremiumFrequency())
                .premiumAccountNumber(p.getPremiumAccountNumber())
                .nomineeName(p.getNomineeName())
                .nomineeRelationship(p.getNomineeRelationship())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .status(p.getStatus())
                .issuedAt(p.getIssuedAt())
                .build();
    }
}