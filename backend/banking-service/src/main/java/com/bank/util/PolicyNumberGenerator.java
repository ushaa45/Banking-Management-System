package com.bank.util;

import java.security.SecureRandom;

public final class PolicyNumberGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();

    private PolicyNumberGenerator(){
    }

    public static String generate() {
        StringBuilder sb = new StringBuilder("POL");
        for (int i = 0; i < 9; i++) {
            sb.append(RANDOM.nextInt(10));
        }
        return sb.toString();
    }
}
