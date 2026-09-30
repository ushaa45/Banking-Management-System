package com.bank.service;

import com.bank.dto.DepositWithdrawRequest;
import com.bank.dto.TransactionResponse;
import com.bank.dto.TransferRequest;

import java.util.List;

public interface TransactionService {
    TransactionResponse deposit(DepositWithdrawRequest request);
    TransactionResponse withdraw(DepositWithdrawRequest request);
    TransactionResponse transfer(TransferRequest request);
    List<TransactionResponse> getHistory(String accountNumber);
}
