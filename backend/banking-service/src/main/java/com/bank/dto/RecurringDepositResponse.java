package com.bank.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class RecurringDepositResponse {
    private Long rdId;
    private Long accountId;
    private BigDecimal monthlyInstallment;
    private BigDecimal interestRate;
    private Integer tenureMonths;
    private LocalDate startDate;
    private LocalDate maturityDate;
    private String status;
}
