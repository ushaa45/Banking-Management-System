package com.bank.service.impl;

import com.bank.dto.RegisterUserRequest;
import com.bank.dto.UserResponse;
import com.bank.entity.AppUser;
import com.bank.entity.Role;
import com.bank.exception.DuplicateResourceException;
import com.bank.repository.AppUserRepository;
import com.bank.repository.RoleRepository;
import com.bank.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse register(RegisterUserRequest request) {

        if (appUserRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already taken: " + request.getUsername());
        }

        Set<Role> roles = request.getRoles().stream()
                .map(roleName -> roleRepository.findByRoleName(roleName)
                        .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName)))
                .collect(Collectors.toSet());
        AppUser user = AppUser.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .customerId(request.getCustomerId())
                .employeeCode(request.getEmployeeCode())
                .status("ACTIVE")
                .roles(roles)
                .build();
        AppUser saved = appUserRepository.save(user);

        return UserResponse.builder()
                .userId(saved.getUserId())
                .username(saved.getUsername())
                .status(saved.getStatus())
                .roles(saved.getRoles().stream().map(Role::getRoleName).collect(Collectors.toSet()))
                .build();

    }

}
