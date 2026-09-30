package com.bank.dto;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class FixedDepositResponse {
    private Long fdId;
    private Long accountId;
    private BigDecimal principalAmount;
    private BigDecimal interestRate;
    private Integer tenureMonths;
    private LocalDate startDate;
    private LocalDate maturityDate;
    private BigDecimal projectedMaturityAmount;
    private String status;
}
