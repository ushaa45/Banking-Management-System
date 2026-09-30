package com.bank.service;

import com.bank.dto.IssuePolicyRequest;
import com.bank.dto.PolicyResponse;
import com.bank.dto.PremiumPaymentResponse;

import java.util.List;

public interface PolicyService {
    PolicyResponse issue(IssuePolicyRequest request);
    PolicyResponse getById(Long policyId);
    List<PolicyResponse> getByCustomer(Long customerId);
    PolicyResponse cancel(Long policyId);
    List<PremiumPaymentResponse> getPremiumHistory(Long policyId);
}