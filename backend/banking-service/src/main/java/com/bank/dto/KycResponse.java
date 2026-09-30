package com.bank.dto;

import com.bank.entity.KycStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class KycResponse {

    private Long kycId;

    private Long customerId;

    private String documentType;

    private String documentNumber;

    private KycStatus status;

    private String rejectionReason;

    private LocalDateTime submittedAt;

    private LocalDateTime verifiedAt;

    private String verifiedBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}