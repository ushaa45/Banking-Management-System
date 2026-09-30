package com.bank.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public final class LoanNumberGenerator {

    private LoanNumberGenerator() {

    }

    public static String generate(){
        String date = LocalDate.now()
                .toString()
                .replace("-", "");

        String random = UUID.randomUUID()
                .toString()
                .replace("_","")
                .substring(0, 8)
                .toUpperCase();
        return "LN" + date +random;
    }
}
