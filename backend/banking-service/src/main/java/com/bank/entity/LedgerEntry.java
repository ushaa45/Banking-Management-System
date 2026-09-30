package com.bank.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "LEDGER_ENTRY")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LedgerEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LEDGER_ID")
    private Long ledgerId;

    @Column(name = "TRANSACTION_ID", nullable = false)
    private Long transactionId;

    @Column(name = "ACCOUNT_ID", nullable = false)
    private Long accountId;

    @Column(name = "ENTRY_TYPE", nullable = false, length = 10)
    private String entryType; // DEBIT or CREDIT

    @Column(name = "AMOUNT", nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "BALANCE_BEFORE", precision = 19, scale = 4)
    private BigDecimal balanceBefore;

    @Column(name = "BALANCE_AFTER", precision = 19, scale = 4)
    private BigDecimal balanceAfter;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
