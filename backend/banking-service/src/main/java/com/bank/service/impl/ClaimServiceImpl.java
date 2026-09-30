package com.bank.service.impl;

import com.bank.dto.*;
import com.bank.entity.*;
import com.bank.exception.*;
import com.bank.repository.*;
import com.bank.service.ClaimService;
import com.bank.util.ReferenceGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Claim workflow: FILED -> UNDER_REVIEW -> APPROVED -> SETTLED, or
 * REJECTED at the review stage. Settlement credits the target account
 * directly (Transaction + LedgerEntry pair, transaction_type
 * "CLAIM_SETTLEMENT") - same pattern LoanServiceImpl uses for
 * disbursement.
 */
@Service
@RequiredArgsConstructor
public class ClaimServiceImpl implements ClaimService {

    private final ClaimRepository claimRepository;
    private final PolicyRepository policyRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LedgerEntryRepository ledgerEntryRepository;

    @Override
    @Transactional
    public ClaimResponse file(FileClaimRequest request) {
        Policy policy = policyRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new PolicyNotFoundException("Policy not found: " + request.getPolicyId()));

        if (!"ACTIVE".equals(policy.getStatus())) {
            throw new PolicyNotActiveException("Policy " + policy.getPolicyNumber() + " is " + policy.getStatus());
        }

        Claim claim = Claim.builder()
                .claimReference(ReferenceGenerator.generateClaimReference())
                .policyId(policy.getPolicyId())
                .customerId(policy.getCustomerId())
                .claimAmount(request.getClaimAmount())
                .reason(request.getReason())
                .status("FILED")
                .build();

        return toResponse(claimRepository.save(claim));
    }

    @Override
    @Transactional
    public ClaimResponse review(Long claimId) {
        Claim claim = requireStatus(claimId, "FILED");
        claim.setStatus("UNDER_REVIEW");
        claim.setReviewedAt(LocalDateTime.now());
        return toResponse(claimRepository.save(claim));
    }

    @Override
    @Transactional
    public ClaimResponse approve(Long claimId, ApproveClaimRequest request) {
        Claim claim = requireStatus(claimId, "UNDER_REVIEW");
        claim.setApprovedAmount(request.getApprovedAmount() != null ? request.getApprovedAmount() : claim.getClaimAmount());
        claim.setStatus("APPROVED");
        return toResponse(claimRepository.save(claim));
    }

    @Override
    @Transactional
    public ClaimResponse reject(Long claimId, RejectClaimRequest request) {
        Claim claim = requireStatus(claimId, "UNDER_REVIEW");
        claim.setRejectionReason(request.getRejectionReason());
        claim.setStatus("REJECTED");
        return toResponse(claimRepository.save(claim));
    }

    @Override
    @Transactional
    public ClaimResponse settle(Long claimId, SettleClaimRequest request) {
        Claim claim = requireStatus(claimId, "APPROVED");

        Account account = accountRepository.findByAccountNumberForUpdate(request.getToAccountNumber())
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + request.getToAccountNumber()));
        if (!"ACTIVE".equals(account.getStatus())) {
            throw new AccountNotActiveException("Account " + account.getAccountNumber() + " is " + account.getStatus());
        }

        BigDecimal before = account.getBalance();
        BigDecimal after = before.add(claim.getApprovedAmount());
        account.setBalance(after);
        accountRepository.save(account);

        Transaction txn = transactionRepository.save(Transaction.builder()
                .transactionReference(ReferenceGenerator.generateTransactionReference())
                .transactionType("CLAIM_SETTLEMENT")
                .toAccountNumber(account.getAccountNumber())
                .amount(claim.getApprovedAmount())
                .transactionStatus("SUCCESS")
                .remarks("Claim " + claim.getClaimReference() + " settlement")
                .build());

        ledgerEntryRepository.save(LedgerEntry.builder()
                .transactionId(txn.getTransactionId())
                .accountId(account.getAccountId())
                .entryType("CREDIT")
                .amount(claim.getApprovedAmount())
                .balanceBefore(before)
                .balanceAfter(after)
                .build());

        claim.setStatus("SETTLED");
        claim.setSettledAt(LocalDateTime.now());
        return toResponse(claimRepository.save(claim));
    }

    @Override
    public ClaimResponse getById(Long claimId) {
        return toResponse(claimRepository.findById(claimId)
                .orElseThrow(() -> new ClaimNotFoundException("Claim not found: " + claimId)));
    }

    @Override
    public List<ClaimResponse> getByPolicy(Long policyId) {
        return claimRepository.findByPolicyId(policyId).stream().map(this::toResponse).toList();
    }

    @Override
    public List<ClaimResponse> getByCustomer(Long customerId) {
        return claimRepository.findByCustomerId(customerId).stream().map(this::toResponse).toList();
    }

    private Claim requireStatus(Long claimId, String expectedStatus) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ClaimNotFoundException("Claim not found: " + claimId));
        if (!expectedStatus.equals(claim.getStatus())) {
            throw new InvalidClaimStateException(
                    "Claim " + claimId + " must be " + expectedStatus + " but is " + claim.getStatus());
        }
        return claim;
    }

    private ClaimResponse toResponse(Claim c) {
        return ClaimResponse.builder()
                .claimId(c.getClaimId())
                .claimReference(c.getClaimReference())
                .policyId(c.getPolicyId())
                .customerId(c.getCustomerId())
                .claimAmount(c.getClaimAmount())
                .approvedAmount(c.getApprovedAmount())
                .reason(c.getReason())
                .rejectionReason(c.getRejectionReason())
                .status(c.getStatus())
                .filedAt(c.getFiledAt())
                .reviewedAt(c.getReviewedAt())
                .settledAt(c.getSettledAt())
                .build();
    }
}