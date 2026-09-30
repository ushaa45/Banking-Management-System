package com.bank.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public final class ReferenceGenerator {

    private static final DateTimeFormatter FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private ReferenceGenerator() {
    }

    /** e.g. TXN-20260912103020-A1B2C3D4 */
    public static String generateTransactionReference() {
        return generate("TXN");
    }

    public static String generateClaimReference() {
        return generate("CLM");
    }

    private static String generate(String prefix) {
        String ts = LocalDateTime.now().format(FORMAT);
        String suffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return prefix + "-" + ts + "-" + suffix;
    }
}
