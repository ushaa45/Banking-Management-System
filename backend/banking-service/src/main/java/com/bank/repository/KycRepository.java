package com.bank.repository;

import com.bank.entity.Kyc;
import com.bank.entity.KycStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface KycRepository extends JpaRepository<Kyc, Long> {

    Optional<Kyc> findByCustomerCustomerId(Long customerId);

    List<Kyc> findByStatus(KycStatus status);
}