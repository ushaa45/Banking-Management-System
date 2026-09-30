package com.bank.entity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "recurring_deposit")
@Data
@NoArgsConstructor @AllArgsConstructor @Builder
public class RecurringDeposit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rd_id")
    private Long rdId;

    @Column(name = "account_id", nullable = false)
    private Long accountId;

    @Column(name = "monthly_installment", nullable = false, precision = 19, scale = 4)
    private BigDecimal monthlyInstallment;

    @Column(name = "interest_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(name = "tenure_months", nullable = false)
    private Integer tenureMonths;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "maturity_date", nullable = false)
    private LocalDate maturityDate;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "ACTIVE";
}
