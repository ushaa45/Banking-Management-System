package com.bank.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LoanApplicationRequest {

    @NotNull
    private Long customerId;

    @NotBlank
    private String loanType; // PERSONAL, HOME, EDUCATION, VEHICLE, BUSINESS

    @NotNull
    @DecimalMin(value = "1000.00",
            message = "Principal must be at least 1000"
    )
    private BigDecimal principalAmount;

//    @NotNull
//    @DecimalMin(value = "0.01", message = "Interest rate must be positive")
//    private BigDecimal interestRate;

    @NotNull
    @Min(
            value = 1,
            message = "Tenure must be at least 1 month"
    )
    private Integer tenureMonths;


}
