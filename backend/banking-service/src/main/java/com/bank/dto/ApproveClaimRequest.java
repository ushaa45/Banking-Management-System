package com.bank.dto;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ApproveClaimRequest {
    /** Optional - defaults to the full claimed amount if omitted. */
    @DecimalMin(value = "0.01")
    private BigDecimal approvedAmount;
}