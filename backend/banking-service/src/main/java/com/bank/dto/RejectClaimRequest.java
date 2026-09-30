package com.bank.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectClaimRequest {
    @NotBlank
    private String rejectionReason;
}