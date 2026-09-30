package com.bank.entity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "claim")
@Data
@NoArgsConstructor @AllArgsConstructor @Builder
public class Claim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "claim_id")
    private Long claimId;

    @Column(name = "claim_reference", nullable = false, unique = true, length = 40)
    private String claimReference;

    @Column(name = "policy_id", nullable = false)
    private Long policyId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "claim_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal claimAmount;

    @Column(name = "approved_amount", precision = 19, scale = 4)
    private BigDecimal approvedAmount;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "FILED"; // FILED, UNDER_REVIEW, APPROVED, REJECTED, SETTLED

    @Column(name = "filed_at")
    private LocalDateTime filedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "settled_at")
    private LocalDateTime settledAt;

    @PrePersist
    protected void onCreate() {
        filedAt = LocalDateTime.now();
    }
}
