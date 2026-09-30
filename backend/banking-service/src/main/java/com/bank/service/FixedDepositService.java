package com.bank.service;

import com.bank.dto.FixedDepositResponse;
import com.bank.dto.OpenFixedDepositRequest;

import java.util.List;

public interface FixedDepositService {

    FixedDepositResponse open(OpenFixedDepositRequest request);
    FixedDepositResponse getById(Long fdId);
    List<FixedDepositResponse> getByAccount(String accountNumber);
    FixedDepositResponse closePrematurely(Long fdId);
}
