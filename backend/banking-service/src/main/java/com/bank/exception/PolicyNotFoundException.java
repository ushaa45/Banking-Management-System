package com.bank.exception;

public class PolicyNotFoundException extends RuntimeException{

    public PolicyNotFoundException(String message) {
        super(message);
    }
}
