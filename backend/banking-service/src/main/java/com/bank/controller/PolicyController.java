package com.bank.controller;

import com.bank.dto.IssuePolicyRequest;
import com.bank.dto.PolicyResponse;
import com.bank.dto.PremiumPaymentResponse;
import com.bank.service.PolicyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;

    @PostMapping
    @PreAuthorize("hasAnyRole('BANK_EMPLOYEE','BRANCH_MANAGER','BANK_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<PolicyResponse> issue(@Valid @RequestBody IssuePolicyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(policyService.issue(request));
    }

    @GetMapping("/{policyId}")
    public ResponseEntity<PolicyResponse> getById(@PathVariable Long policyId) {
        return ResponseEntity.ok(policyService.getById(policyId));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<PolicyResponse>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(policyService.getByCustomer(customerId));
    }

    @PostMapping("/{policyId}/cancel")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER','BANK_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<PolicyResponse> cancel(@PathVariable Long policyId) {
        return ResponseEntity.ok(policyService.cancel(policyId));
    }

    @GetMapping("/{policyId}/premium-history")
    public ResponseEntity<List<PremiumPaymentResponse>> getPremiumHistory(@PathVariable Long policyId) {
        return ResponseEntity.ok(policyService.getPremiumHistory(policyId));
    }
}