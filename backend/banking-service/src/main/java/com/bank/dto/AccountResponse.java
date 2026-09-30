package com.bank.dto;

import com.bank.entity.Currency;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class AccountResponse {
    private Long accountId;
    private String accountNumber;
    private Long customerId;
    private String accountType;
    private BigDecimal balance;
    private Currency currency;
    private String status;
    private LocalDateTime createdAt;
}
