package com.bank.exception;

public class InvalidLoanStateException extends RuntimeException{
    public InvalidLoanStateException(String message) {
        super(message);
    }
}
