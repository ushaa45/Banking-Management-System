package com.bank.controller;

import com.bank.dto.OpenRecurringDepositRequest;
import com.bank.dto.RecurringDepositResponse;
import com.bank.service.RecurringDepositService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring-deposits")
@RequiredArgsConstructor
public class RecurringDepositController {

    private final RecurringDepositService recurringDepositService;

    @PostMapping
    public ResponseEntity<RecurringDepositResponse> open(@Valid @RequestBody OpenRecurringDepositRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recurringDepositService.open(request));
    }

    @GetMapping("/{rdId}")
    public ResponseEntity<RecurringDepositResponse> getById(@PathVariable Long rdId) {
        return ResponseEntity.ok(recurringDepositService.getById(rdId));
    }

    @GetMapping("/account/{accountNumber}")
    public ResponseEntity<List<RecurringDepositResponse>> getByAccount(@PathVariable String accountNumber) {
        return ResponseEntity.ok(recurringDepositService.getByAccount(accountNumber));
    }

    @PostMapping("/{rdId}/close")
    public ResponseEntity<RecurringDepositResponse> close(@PathVariable Long rdId) {
        return ResponseEntity.ok(recurringDepositService.close(rdId));
    }
}
