package com.bank.exception;

public class PolicyNotActiveException extends RuntimeException{

    public PolicyNotActiveException(String message) {
        super(message);
    }
}
