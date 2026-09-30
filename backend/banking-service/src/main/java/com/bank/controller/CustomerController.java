package com.bank.controller;

import com.bank.dto.CustomerRequest;
import com.bank.dto.CustomerResponse;
import com.bank.dto.KycRequest;
import com.bank.dto.KycResponse;
import com.bank.service.CustomerService;
import com.bank.service.KycService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final KycService kycService;

    @PostMapping
    @PreAuthorize("hasAnyRole('BANK_EMPLOYEE','BRANCH_MANAGER','BANK_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<CustomerResponse> register(@Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.register(request));
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<CustomerResponse> getById(@PathVariable Long customerId) {
        return ResponseEntity.ok(customerService.getById(customerId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('BANK_EMPLOYEE','BRANCH_MANAGER','BANK_ADMIN','SUPER_ADMIN','AUDITOR')")
    public ResponseEntity<List<CustomerResponse>> getAll() {
        return ResponseEntity.ok(customerService.getAll());
    }

    @PutMapping("/{customerId}")
    public ResponseEntity<CustomerResponse> update(@PathVariable Long customerId,
                                                    @Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(customerService.update(customerId, request));
    }

    // =========================================================
    // KYC
    // =========================================================
    /*
     * Customer submits KYC for review.
     */
    @PostMapping("/{customerId}/kyc/submit")
    public ResponseEntity<KycResponse> submitKyc(
            @PathVariable Long customerId,
            @Valid @RequestBody KycRequest request)
    {
        return ResponseEntity.status(HttpStatus.CREATED)
                        .body(kycService.submit(customerId, request));
    }

    /*
    * Bank employee/admin verifies KYC.
    */
    @PostMapping("/{customerId}/kyc/verify")
    @PreAuthorize("hasAnyRole('BANK_EMPLOYEE','BRANCH_MANAGER','BANK_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<KycResponse> verifyKyc(
            @PathVariable Long customerId )
    {
        return ResponseEntity.ok(
                kycService.verify(customerId)
        );
    }

    /* * Bank employee/admin rejects KYC. */
    @PostMapping("/{customerId}/kyc/reject")
    @PreAuthorize("hasAnyRole('BANK_EMPLOYEE','BRANCH_MANAGER','BANK_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<KycResponse> rejectKyc(
            @PathVariable Long customerId,
            @RequestParam String reason )
    {
        return ResponseEntity.ok(
                kycService.reject(customerId, reason)
        );
    }

    @GetMapping("/{customerId}/kyc")
    public ResponseEntity<KycResponse> getKyc(@PathVariable Long customerId) {
        return ResponseEntity.ok(kycService.getByCustomer(customerId));
    }
}
