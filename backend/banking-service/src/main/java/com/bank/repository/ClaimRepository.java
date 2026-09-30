package com.bank.repository;
import com.bank.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
public interface ClaimRepository extends JpaRepository<Claim, Long>{
    List<Claim> findByPolicyId(Long policyId);
    List<Claim> findByCustomerId(Long customerId);
}
