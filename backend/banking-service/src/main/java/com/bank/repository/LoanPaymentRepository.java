package com.bank.repository;

import com.bank.entity.LoanPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface LoanPaymentRepository  extends JpaRepository<LoanPayment, Long> {

    @Query("""
            select coalesce(sum(p.paidAmount), 0) 
            from LoanPayment p where p.emiId = :emiId 
            """)
    BigDecimal sumPaidAmountByEmiId(
            @Param("emiId") Long emiId
    );
}
