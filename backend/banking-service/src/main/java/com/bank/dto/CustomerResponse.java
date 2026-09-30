package com.bank.dto;

import com.bank.entity.KycStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class CustomerResponse {
    private Long customerId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;

    private KycStatus kycStatus;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
