package com.bank.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "policy_premium_payment")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PolicyPremiumPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;

    @Column(name = "policy_id", nullable = false)
    private Long policyId;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // SUCCESS, FAILED

    @Column(name = "failure_reason", length = 255)
    private String failureReason;

    @Column(name = "transaction_id")
    private Long transactionId; // links to Transaction when SUCCESS

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @PrePersist
    protected void onCreate() {
        processedAt = LocalDateTime.now();
    }
}