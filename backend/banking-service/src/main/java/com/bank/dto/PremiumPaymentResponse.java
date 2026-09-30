package com.bank.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class PremiumPaymentResponse {
    private Long paymentId;
    private Long policyId;
    private LocalDate dueDate;
    private BigDecimal amount;
    private String status;
    private String failureReason;
    private Long transactionId;
    private LocalDateTime processedAt;
}