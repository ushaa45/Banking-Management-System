package com.bank.service;

import com.bank.dto.*;

import java.util.List;

public interface ClaimService {
    ClaimResponse file(FileClaimRequest request);
    ClaimResponse review(Long claimId);
    ClaimResponse approve(Long claimId, ApproveClaimRequest request);
    ClaimResponse reject(Long claimId, RejectClaimRequest request);
    ClaimResponse settle(Long claimId, SettleClaimRequest request);
    ClaimResponse getById(Long claimId);
    List<ClaimResponse> getByPolicy(Long policyId);
    List<ClaimResponse> getByCustomer(Long customerId);
}