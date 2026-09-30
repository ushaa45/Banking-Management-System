package com.bank.dto;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OpenFixedDepositRequest {

    @NotBlank
    private String accountNumber; // funding account, debited for the principal

    @NotNull
    @DecimalMin(value = "500")
    private BigDecimal principalAmount;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal interestRate;

    @NotNull
    @Min(1)
    private Integer tenureMonths;
}
