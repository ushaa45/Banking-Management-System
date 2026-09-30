package com.bank.dto;

import com.bank.entity.LoanStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class LoanResponse {
    private Long loanId;
    private Long customerId;
    private String loanType;
    private BigDecimal principalAmount;
    private BigDecimal interestRate;
    private Integer tenureMonths;
    private LoanStatus status;
    private LocalDateTime appliedAt;
    private LocalDateTime disbursedAt;
}
