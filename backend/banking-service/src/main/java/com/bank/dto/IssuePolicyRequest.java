package com.bank.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class IssuePolicyRequest {

    @NotNull
    private Long customerId;

    @NotBlank
    private String policyType; // LIFE, HEALTH, GENERAL

    @NotBlank
    private String productName;

    @NotNull
    @DecimalMin(value = "1000")
    private BigDecimal sumAssured;

    @NotNull
    @DecimalMin(value = "1")
    private BigDecimal premiumAmount;

    @NotBlank
    private String premiumFrequency; // MONTHLY, QUARTERLY, ANNUALLY

    @NotBlank
    private String premiumAccountNumber;

    private String nomineeName;
    private String nomineeRelationship;

    @NotNull
    @Min(1)
    private Integer policyTermYears;
}