package com.bank.service.impl;

import com.bank.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Runs daily and collects any premiums that are due. Each policy is
 * processed in its own transaction via PremiumCollectionProcessor.
 *
 * For on-demand testing without waiting for the cron trigger, call
 * POST /api/admin/jobs/collect-premiums (see AdminJobController),
 * which invokes runNow() directly.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PremiumCollectionScheduler {

    private final PolicyRepository policyRepository;
    private final PremiumCollectionProcessor premiumCollectionProcessor;

    /** Runs once daily at 2 AM server time. */
    @Scheduled(cron = "0 0 2 * * *")
    public void collectDuePremiums() {
        runNow();
    }

    /** Triggerable on demand (e.g. from an admin endpoint). Returns count processed. */
    public int runNow() {
        List<Long> duePolicyIds = policyRepository
                .findByStatusAndNextPremiumDueDateLessThanEqual("ACTIVE", LocalDate.now())
                .stream()
                .map(p -> p.getPolicyId())
                .toList();

        log.info("Premium collection run: {} polic{} due",
                duePolicyIds.size(), duePolicyIds.size() == 1 ? "y" : "ies");

        for (Long policyId : duePolicyIds) {
            try {
                premiumCollectionProcessor.processDuePremium(policyId);
            } catch (Exception e) {
                log.error("Unexpected error collecting premium for policy {}", policyId, e);
            }
        }

        return duePolicyIds.size();
    }
}