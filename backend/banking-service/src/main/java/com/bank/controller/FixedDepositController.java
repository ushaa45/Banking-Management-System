package com.bank.controller;

import com.bank.dto.FixedDepositResponse;
import com.bank.dto.OpenFixedDepositRequest;
import com.bank.service.FixedDepositService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fixed-deposits")
@RequiredArgsConstructor
public class FixedDepositController {

    private final FixedDepositService fixedDepositService;

    @PostMapping
    public ResponseEntity<FixedDepositResponse> open(@Valid @RequestBody OpenFixedDepositRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fixedDepositService.open(request));
    }

    @GetMapping("/{fdId}")
    public ResponseEntity<FixedDepositResponse> getById(@PathVariable Long fdId) {
        return ResponseEntity.ok(fixedDepositService.getById(fdId));
    }

    @GetMapping("/account/{accountNumber}")
    public ResponseEntity<List<FixedDepositResponse>> getByAccount(@PathVariable String accountNumber) {
        return ResponseEntity.ok(fixedDepositService.getByAccount(accountNumber));
    }

    @PostMapping("/{fdId}/close")
    public ResponseEntity<FixedDepositResponse> close(@PathVariable Long fdId) {
        return ResponseEntity.ok(fixedDepositService.closePrematurely(fdId));
    }
}
