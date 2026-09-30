package com.bank.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SettleClaimRequest {
    @NotBlank
    private String toAccountNumber;
}