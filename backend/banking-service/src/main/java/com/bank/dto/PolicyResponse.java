package com.bank.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class PolicyResponse {
    private Long policyId;
    private String policyNumber;
    private Long customerId;
    private String policyType;
    private String productName;
    private BigDecimal sumAssured;
    private BigDecimal premiumAmount;
    private String premiumFrequency;
    private String premiumAccountNumber;
    private String nomineeName;
    private String nomineeRelationship;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private LocalDateTime issuedAt;
    private java.time.LocalDate nextPremiumDueDate;
    private Integer missedPremiumCount;
}