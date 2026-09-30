package com.bank.controller;

import com.bank.dto.*;
import com.bank.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @PostMapping("/apply")
    public ResponseEntity<LoanResponse> apply(@Valid @RequestBody LoanApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(loanService.apply(request));
    }

    @PostMapping("/{loanId}/kyc-verify")
    @PreAuthorize("hasAnyRole('BANK_EMPLOYEE','BRANCH_MANAGER','BANK_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<LoanResponse> verifyKyc(@PathVariable Long loanId) {
        return ResponseEntity.ok(loanService.verifyKyc(loanId));
    }

    @PostMapping("/{loanId}/credit-evaluate")
    @PreAuthorize("hasAnyRole('BANK_EMPLOYEE','BRANCH_MANAGER','BANK_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<LoanResponse> evaluateCredit(@PathVariable Long loanId) {
        return ResponseEntity.ok(loanService.evaluateCredit(loanId));
    }

    @PostMapping("/{loanId}/approve")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER','BANK_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<LoanResponse> approve(@PathVariable Long loanId) {
        return ResponseEntity.ok(loanService.approve(loanId));
    }

    @PostMapping("/{loanId}/sanction")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER','BANK_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<LoanResponse> sanction(@PathVariable Long loanId) {
        return ResponseEntity.ok(loanService.sanction(loanId));
    }

    @PostMapping("/{loanId}/disburse")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER','BANK_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<LoanResponse> disburse(@PathVariable Long loanId,
                                                 @Valid @RequestBody DisburseLoanRequest request) {
        return ResponseEntity.ok(loanService.disburse(loanId, request));
    }

    @PostMapping("/{loanId}/reject")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER','BANK_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<LoanResponse> reject(@PathVariable Long loanId) {
        return ResponseEntity.ok(loanService.reject(loanId));
    }

    @GetMapping("/{loanId}")
    public ResponseEntity<LoanResponse> getById(@PathVariable Long loanId) {
        return ResponseEntity.ok(loanService.getById(loanId));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<LoanResponse>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(loanService.getByCustomer(customerId));
    }

    @GetMapping("/{loanId}/emis")
    public ResponseEntity<List<EmiResponse>> getEmis(@PathVariable Long loanId) {
        return ResponseEntity.ok(loanService.getEmis(loanId));
    }

    @PostMapping("/emis/{emiId}/pay")
    @PreAuthorize("hasAnyRole('TELLER','BANK_EMPLOYEE','BRANCH_MANAGER','BANK_ADMIN','SUPER_ADMIN','CUSTOMER')")
    public ResponseEntity<Void> payEmi(@PathVariable Long emiId, @Valid @RequestBody PayEmiRequest request) {
        loanService.payEmi(emiId, request);
        return ResponseEntity.noContent().build();
    }

}
