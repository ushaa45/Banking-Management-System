package com.bank.exception;

public class InvalidClaimStateException extends RuntimeException{

    public InvalidClaimStateException(String message) {
        super(message);
    }
}
