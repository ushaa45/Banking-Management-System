package com.bank.exception;

public class ClaimNotFoundException extends RuntimeException{

    public ClaimNotFoundException(String message) {
        super(message);
    }
}
