package com.bank.controller;

import com.bank.service.impl.PremiumCollectionScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/jobs")
@RequiredArgsConstructor
public class AdminJobController {

    private final PremiumCollectionScheduler premiumCollectionScheduler;

    /**
     * Manually triggers the premium collection job instead of waiting for
     * its daily 2 AM cron run - useful for testing/demoing the flow.
     */
    @PostMapping("/collect-premiums")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','BANK_ADMIN')")
    public ResponseEntity<Map<String, Object>> collectPremiums() {
        int processed = premiumCollectionScheduler.runNow();
        return ResponseEntity.ok(Map.of("policiesProcessed", processed));
    }
}