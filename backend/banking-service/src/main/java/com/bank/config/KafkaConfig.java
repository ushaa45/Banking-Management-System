package com.bank.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.TopicBuilder;

/**
 * Registers the Kafka topics from section 11 of the requirement doc.
 *
 * Guarded with @Profile("!dev") so a plain `mvn spring-boot:run` (dev
 * profile, H2 database, no external services) doesn't spend ~15-30s at
 * startup retrying a connection to a Kafka broker that isn't running.
 * Run with `-Dspring-boot.run.profiles=oracle` (or `docker compose up`,
 * which brings up Kafka) once you actually need these topics.
 */
@Configuration
@Profile("!dev")
@EnableKafka
public class KafkaConfig {

    // Event topics as described in the requirement doc (section 11).
    // Consumers for these (Audit / Notification / Reporting services)
    // are the next module to build out.

    @Bean
    public NewTopic accountCreatedTopic() {
        return TopicBuilder.name("ACCOUNT_CREATED").partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic transactionCompletedTopic() {
        return TopicBuilder.name("TRANSACTION_COMPLETED").partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic transactionFailedTopic() {
        return TopicBuilder.name("TRANSACTION_FAILED").partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic moneyTransferredTopic() {
        return TopicBuilder.name("MONEY_TRANSFERRED").partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic loanApprovedTopic() {
        return TopicBuilder.name("LOAN_APPROVED").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic kycCompletedTopic() {
        return TopicBuilder.name("KYC_COMPLETED").partitions(1).replicas(1).build();
    }
}
