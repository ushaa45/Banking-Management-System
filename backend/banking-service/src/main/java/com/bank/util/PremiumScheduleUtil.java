package com.bank.util;

import java.time.LocalDate;

public final class PremiumScheduleUtil {

    private PremiumScheduleUtil() {
    }

    public static LocalDate advance(LocalDate from, String frequency) {
        return switch (frequency) {
            case "MONTHLY" -> from.plusMonths(1);
            case "QUARTERLY" -> from.plusMonths(3);
            case "ANNUALLY" -> from.plusYears(1);
            default -> from.plusMonths(1);
        };
    }
}