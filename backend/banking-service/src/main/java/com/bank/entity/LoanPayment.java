package com.bank.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "loan_payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanPayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;

    @Column(name = "emi_id", nullable = false)
    private Long emiId;

    @Column(name = "transaction_id")
    private Long transactionId;

    @Column(name = "paid_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal paidAmount;

    @Column(name = "paid_at", nullable = false)
    private LocalDateTime paidAt;

    @PrePersist
    protected void onCreate() {
        if (this.paidAt == null) {
            paidAt = LocalDateTime.now();
        }
    }

}
