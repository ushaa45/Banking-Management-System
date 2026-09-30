package com.bank.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DisburseLoanRequest {

    @NotBlank
    private String toAccountNumber;
}
