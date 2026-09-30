package com.bank.service;

import com.bank.dto.OpenRecurringDepositRequest;
import com.bank.dto.RecurringDepositResponse;

import java.util.List;

public interface RecurringDepositService {

    RecurringDepositResponse open(OpenRecurringDepositRequest request);
    RecurringDepositResponse getById(Long rdId);
    List<RecurringDepositResponse> getByAccount(String accountNumber);
    RecurringDepositResponse close(Long rdId);
}
