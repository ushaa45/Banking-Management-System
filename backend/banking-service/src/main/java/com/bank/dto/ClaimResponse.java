package com.bank.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ClaimResponse {
    private Long claimId;
    private String claimReference;
    private Long policyId;
    private Long customerId;
    private BigDecimal claimAmount;
    private BigDecimal approvedAmount;
    private String reason;
    private String rejectionReason;
    private String status;
    private LocalDateTime filedAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime settledAt;
}