package com.bank.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
@Data
public class PayEmiRequest {

    @NotBlank
    private String accountNumber;

    @NotNull
    @DecimalMin(value = "0.01",
            message = "Payment amount must be greater than zero"
    )
    private BigDecimal paidAmount;
}
