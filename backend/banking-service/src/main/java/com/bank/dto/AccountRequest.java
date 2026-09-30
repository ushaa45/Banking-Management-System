package com.bank.dto;

import com.bank.entity.Currency;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AccountRequest {

    @NotNull
    private Long customerId;

    @NotBlank
    private String accountType; // SAVINGS, CURRENT, SALARY, FD, RD

    @DecimalMin(value = "0.0", message = "Opening balance cannot be negative")
    private BigDecimal openingBalance = BigDecimal.ZERO;

    private Currency currency;
}
