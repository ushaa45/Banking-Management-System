package com.bank.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class TransactionResponse {
    private Long transactionId;
    private String transactionReference;
    private String transactionType;
    private String fromAccountNumber;
    private String toAccountNumber;
    private BigDecimal amount;
    private String transactionStatus;
    private String remarks;
    private LocalDateTime transactionDate;
}
