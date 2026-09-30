package com.bank.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

/**
 * The single implementation of EventPublisher. Guarded by
 * app.events.kafka-enabled (set false in the dev profile) so that in
 * local dev - with no broker running - this short-circuits before ever
 * touching KafkaTemplate, rather than attempting a connection and
 * retrying/failing on every account open, deposit, withdrawal, or
 * transfer.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaEventPublisher implements EventPublisher {

    @Value("${app.events.kafka-enabled:true}")
    private boolean kafkaEnabled;

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void publish(String eventType, String key, Object payload) {
        log.warn(">>> DIAGNOSTIC: publish() called for topic={}, kafkaEnabled={}", eventType, kafkaEnabled);
        if (!kafkaEnabled) {
            log.debug("Kafka publishing disabled (app.events.kafka-enabled=false) - skipped event for topic {}", eventType);
            return;
        }

        try {
            String json = objectMapper.writeValueAsString(payload);
            kafkaTemplate.send(eventType, key, json).whenComplete((result, ex) -> {
                if (ex != null) {
                    log.warn("Failed to publish event to topic {}: {}", eventType, ex.getMessage());
                }
            });
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize event for topic {}", eventType, e);
        }
    }
}