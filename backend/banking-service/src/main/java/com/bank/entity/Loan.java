package com.bank.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "loan",
		indexes = { @Index(name = "idx_loan_customer", columnList = "customer_id"),
				@Index(name = "idx_loan_status", columnList = "status"),
				@Index(name = "idx_loan_customer_status", columnList = "customer_id,status")
		}
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor 
@Builder
public class Loan {
	 	@Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    @Column(name = "loan_id")
	    private Long loanId;

		@Column(
				name = "loan_number",
				nullable = false,
				unique = true,
				length = 30 )
		private String loanNumber;

	    @Column(name = "customer_id", nullable = false)
	    private Long customerId;

	    @Column(name = "loan_type", nullable = false, length = 30)
	    private String loanType; // PERSONAL, HOME, EDUCATION, VEHICLE, BUSINESS

	    @Column(name = "principal_amount",
				nullable = false,
				precision = 19,
				scale = 4)
	    private BigDecimal principalAmount;

	    @Column(name = "interest_rate",
				nullable = false,
				precision = 5,
				scale = 2)
	    private BigDecimal interestRate; // annual %, e.g. 9.50

	    @Column(name = "tenure_months", nullable = false)
	    private Integer tenureMonths;

		@Enumerated(EnumType.STRING)
	    @Column(name = "status", nullable = false, length = 30)
	    @Builder.Default
	    private LoanStatus status = LoanStatus.APPLIED;
	    // APPLIED, KYC_VERIFIED, CREDIT_EVALUATED, APPROVED, SANCTIONED,
	    // DISBURSED, CLOSED, REJECTED

		@Column( name = "outstanding_principal",
				precision = 19, scale = 4 )
		private BigDecimal outstandingPrincipal;

		@Column( name = "total_interest",
				precision = 19, scale = 4 )
		private BigDecimal totalInterest;
		@Column( name = "total_payable", precision = 19, scale = 4 )
		private BigDecimal totalPayable;

	    @Column(name = "applied_at")
	    private LocalDateTime appliedAt;

		@Column(name = "approved_at")
		private LocalDateTime approvedAt;

		@Column(name = "sanctioned_at")
		private LocalDateTime sanctionedAt;

	    @Column(name = "disbursed_at")
	    private LocalDateTime disbursedAt;

		@Column(name = "closed_at")
		private LocalDateTime closedAt;

		@Column(name = "rejection_reason", length = 500)
		private String rejectionReason;

	    @PrePersist
	    protected void onCreate() {

			if (appliedAt == null) {
				appliedAt = LocalDateTime.now();
			}
			if (outstandingPrincipal == null) {
				outstandingPrincipal = BigDecimal.ZERO;
			}
	    }
}
