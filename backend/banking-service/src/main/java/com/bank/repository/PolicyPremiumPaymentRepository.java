package com.bank.repository;

import com.bank.entity.PolicyPremiumPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PolicyPremiumPaymentRepository extends JpaRepository<PolicyPremiumPayment, Long> {
    List<PolicyPremiumPayment> findByPolicyIdOrderByProcessedAtDesc(Long policyId);
}