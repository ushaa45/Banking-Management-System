package com.bank.dto;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OpenRecurringDepositRequest {

    @NotBlank
    private String accountNumber;

    @NotNull
    @DecimalMin(value = "100")
    private BigDecimal monthlyInstallment;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal interestRate;

    @NotNull
    @Min(1)
    private Integer tenureMonths;
}
