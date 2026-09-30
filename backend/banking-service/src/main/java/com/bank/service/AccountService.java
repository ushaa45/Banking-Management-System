package com.bank.service;

import com.bank.dto.AccountRequest;
import com.bank.dto.AccountResponse;

import java.util.List;

public interface AccountService {
    AccountResponse openAccount(AccountRequest request);
    AccountResponse getByAccountNumber(String accountNumber);
    List<AccountResponse> getByCustomerId(Long customerId);
    AccountResponse freeze(String accountNumber);
    AccountResponse close(String accountNumber);
}
