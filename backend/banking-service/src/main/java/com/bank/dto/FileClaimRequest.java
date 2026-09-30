package com.bank.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class FileClaimRequest {

    @NotNull
    private Long policyId;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal claimAmount;

    private String reason;
}