package com.bank.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class EmiResponse {
    private Long emiId;
    private Long loanId;
    private LocalDate dueDate;
    private BigDecimal emiAmount;
    private String status;
}
