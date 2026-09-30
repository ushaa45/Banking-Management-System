package com.bank.service;

import com.bank.dto.RegisterUserRequest;
import com.bank.dto.UserResponse;

public interface UserService {
    UserResponse register(RegisterUserRequest request);
}
