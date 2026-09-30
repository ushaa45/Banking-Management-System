package com.bank.repository;

import com.bank.entity.RecurringDeposit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecurringDepositRepository extends JpaRepository<RecurringDeposit, Long> {
    List<RecurringDeposit> findByAccountId(Long accountId);
}
