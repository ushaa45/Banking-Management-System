package com.bank.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "loan_emi",
		indexes = {
		@Index(name = "idx_emi_loan",
				columnList = "loan_id"),
				@Index(name = "idx_emi_status", columnList = "status"),
				@Index(name = "idx_emi_due_date", columnList = "due_date")
		}
)
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoanEmi {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "emi_id")
	private Long emiId;
	
	@Column(name = "loan_id", nullable = false)
	private Long loanId;

	@Column(name = "emi_number", nullable = false)
	private Integer emiNumber;

	@Column(name = "due_date", nullable = false)
	private LocalDate dueDate;
	
	@Column(name = "emi_amount", nullable = false, precision = 19, scale = 4)
	private BigDecimal emiAmount;

	@Column( name = "principal_component",
			nullable = false,
			precision = 19, scale = 4 )
	private BigDecimal principalComponent;

	@Column( name = "interest_component",
			nullable = false,
			precision = 19, scale = 4 )
	private BigDecimal interestComponent;

	@Column( name = "paid_amount",
			nullable = false,
			precision = 19, scale = 4 )
	@Builder.Default
	private BigDecimal paidAmount = BigDecimal.ZERO;
	
	@Column(name = "status", length = 20)
	@Builder.Default
	private String status="DUE";
}
