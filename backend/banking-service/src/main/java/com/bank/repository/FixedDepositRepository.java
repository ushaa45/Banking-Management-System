package com.bank.repository;

import com.bank.entity.FixedDeposit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FixedDepositRepository extends JpaRepository<FixedDeposit, Long> {
    List<FixedDeposit> findByAccountId(Long accountId);

}
