package com.bank.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class KycRequest {

    @NotBlank
    private String documentType;

    @NotBlank
    private String documentNumber;
}