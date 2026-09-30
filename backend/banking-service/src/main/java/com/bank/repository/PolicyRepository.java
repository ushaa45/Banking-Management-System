package com.bank.repository;
import com.bank.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
public interface PolicyRepository extends JpaRepository<Policy, Long>{

    List<Policy> findByCustomerId(Long customerId);
    boolean existsByPolicyNumber(String policyNumber);
    Optional<Policy> findByPolicyNumber(String policyNumber);
    List<Policy> findByStatusAndNextPremiumDueDateLessThanEqual(String status, LocalDate date);
}
