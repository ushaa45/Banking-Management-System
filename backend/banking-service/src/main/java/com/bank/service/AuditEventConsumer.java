package com.bank.service;
import com.bank.entity.AuditLog;
import com.bank.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;


@Component
@Profile("!dev")
@RequiredArgsConstructor
@Slf4j
public class AuditEventConsumer {

    private final AuditLogRepository auditLogRepository;

    @KafkaListener(topics = "ACCOUNT_CREATED", groupId = "audit-service")
    public void onAccountCreated(String payload) {
        persist("ACCOUNT_CREATED", "ACCOUNT", payload);
    }

    @KafkaListener(topics = "TRANSACTION_COMPLETED", groupId = "audit-service")
    public void onTransactionCompleted(String payload) {
        persist("TRANSACTION_COMPLETED", "TRANSACTION", payload);
    }

    @KafkaListener(topics = "MONEY_TRANSFERRED", groupId = "audit-service")
    public void onMoneyTransferred(String payload) {
        persist("MONEY_TRANSFERRED", "TRANSACTION", payload);
    }

    private void persist(String action, String entityType, String payload) {
        auditLogRepository.save(AuditLog.builder()
                .action(action)
                .entityType(entityType)
                .newValue(payload)
                .build());
        log.debug("Audit log written for {} on {}", action, entityType);
    }
}
