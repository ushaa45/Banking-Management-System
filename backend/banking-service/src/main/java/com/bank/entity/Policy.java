package com.bank.entity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "policy")
@Data
@NoArgsConstructor @AllArgsConstructor @Builder
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "policy_id")
    private Long policyId;

    @Column(name = "policy_number", nullable = false, unique = true, length = 30)
    private String policyNumber;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "policy_type", nullable = false, length = 20)
    private String policyType; // LIFE, HEALTH, GENERAL

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Column(name = "sum_assured", nullable = false, precision = 19, scale = 4)
    private BigDecimal sumAssured;

    @Column(name = "premium_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal premiumAmount;

    @Column(name = "premium_frequency", nullable = false, length = 20)
    private String premiumFrequency; // MONTHLY, QUARTERLY, ANNUALLY

    @Column(name = "premium_account_number", nullable = false, length = 20)
    private String premiumAccountNumber;

    @Column(name = "nominee_name", length = 200)
    private String nomineeName;

    @Column(name = "nominee_relationship", length = 50)
    private String nomineeRelationship;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, LAPSED, MATURED, CANCELLED, EXPIRED

    @Column(name = "issued_at")
    private LocalDateTime issuedAt;

    @PrePersist
    protected void onCreate() {

        issuedAt = LocalDateTime.now();
    }
    @Column(name = "next_premium_due_date")
    private LocalDate nextPremiumDueDate;

    @Column(name = "missed_premium_count")
    @Builder.Default
    private Integer missedPremiumCount = 0;

}
