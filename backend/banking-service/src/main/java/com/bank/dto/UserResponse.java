package com.bank.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class UserResponse {

    private Long userId;
    private String username;
    private String status;
    private Set<String> roles;
}
