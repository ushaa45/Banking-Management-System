package com.bank.repository;

import com.bank.entity.Loan;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByCustomerId(Long customerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query(""" 
            select l from Loan l where l.loanId = :loanId 
            """)
    java.util.Optional<Loan> findByIdForUpdate(
            @Param("loanId") Long loanId
    );
}
