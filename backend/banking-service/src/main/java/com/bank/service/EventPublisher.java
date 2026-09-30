package com.bank.service;

public interface EventPublisher {
    void publish(
            String eventType,
            String key,
            Object payload
    );
}
