package com.bank.controller;

import com.bank.dto.*;
import com.bank.service.ClaimService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;

    @PostMapping("/file")
    public ResponseEntity<ClaimResponse> file(@Valid @RequestBody FileClaimRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(claimService.file(request));
    }

    @PostMapping("/{claimId}/review")
    @PreAuthorize("hasAnyRole('BANK_EMPLOYEE','BRANCH_MANAGER','BANK_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ClaimResponse> review(@PathVariable Long claimId) {
        return ResponseEntity.ok(claimService.review(claimId));
    }

    @PostMapping("/{claimId}/approve")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER','BANK_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ClaimResponse> approve(@PathVariable Long claimId,
                                                 @Valid @RequestBody ApproveClaimRequest request) {
        return ResponseEntity.ok(claimService.approve(claimId, request));
    }

    @PostMapping("/{claimId}/reject")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER','BANK_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ClaimResponse> reject(@PathVariable Long claimId,
                                                @Valid @RequestBody RejectClaimRequest request) {
        return ResponseEntity.ok(claimService.reject(claimId, request));
    }

    @PostMapping("/{claimId}/settle")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER','BANK_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ClaimResponse> settle(@PathVariable Long claimId,
                                                @Valid @RequestBody SettleClaimRequest request) {
        return ResponseEntity.ok(claimService.settle(claimId, request));
    }

    @GetMapping("/{claimId}")
    public ResponseEntity<ClaimResponse> getById(@PathVariable Long claimId) {
        return ResponseEntity.ok(claimService.getById(claimId));
    }

    @GetMapping("/policy/{policyId}")
    public ResponseEntity<List<ClaimResponse>> getByPolicy(@PathVariable Long policyId) {
        return ResponseEntity.ok(claimService.getByPolicy(policyId));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ClaimResponse>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(claimService.getByCustomer(customerId));
    }
}