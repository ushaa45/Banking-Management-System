package com.bank.controller;

import com.bank.dto.AccountRequest;
import com.bank.dto.AccountResponse;
import com.bank.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping("/accounts")
    @PreAuthorize("hasAnyRole('BANK_EMPLOYEE','BRANCH_MANAGER','BANK_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<AccountResponse> openAccount(@Valid @RequestBody AccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.openAccount(request));
    }

    @GetMapping("/accounts/{accountNumber}")
    public ResponseEntity<AccountResponse> getByAccountNumber(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.getByAccountNumber(accountNumber));
    }

    @GetMapping("/customers/{customerId}/accounts")
    public ResponseEntity<List<AccountResponse>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(accountService.getByCustomerId(customerId));
    }

    @PostMapping("/accounts/{accountNumber}/freeze")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER','BANK_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<AccountResponse> freeze(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.freeze(accountNumber));
    }

    @PostMapping("/accounts/{accountNumber}/close")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER','BANK_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<AccountResponse> close(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.close(accountNumber));
    }
}
