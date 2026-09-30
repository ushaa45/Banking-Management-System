package com.bank.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "TRANSACTION")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TRANSACTION_ID")
    private Long transactionId;

    @Column(name = "TRANSACTION_REFERENCE", nullable = false, unique = true, length = 40)
    private String transactionReference;

    @Column(name = "TRANSACTION_TYPE", nullable = false, length = 30)
    private String transactionType; // DEPOSIT, WITHDRAWAL, TRANSFER, NEFT, RTGS, IMPS, UPI

    @Column(name = "FROM_ACCOUNT_NUMBER", length = 20)
    private String fromAccountNumber;

    @Column(name = "TO_ACCOUNT_NUMBER", length = 20)
    private String toAccountNumber;

    @Column(name = "AMOUNT", nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "TRANSACTION_STATUS", length = 20)
    @Builder.Default
    private String transactionStatus = "PENDING"; // PENDING, SUCCESS, FAILED, REVERSED

    @Column(name = "REMARKS", length = 255)
    private String remarks;

    @Column(name = "TRANSACTION_DATE")
    private LocalDateTime transactionDate;

    @PrePersist
    protected void onCreate() {
        transactionDate = LocalDateTime.now();
    }
}
