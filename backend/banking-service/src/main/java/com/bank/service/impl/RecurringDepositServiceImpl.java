package com.bank.service.impl;

import com.bank.dto.OpenRecurringDepositRequest;
import com.bank.dto.RecurringDepositResponse;
import com.bank.entity.Account;
import com.bank.entity.RecurringDeposit;
import com.bank.exception.AccountNotFoundException;
import com.bank.exception.DepositNotFoundException;
import com.bank.repository.AccountRepository;
import com.bank.repository.RecurringDepositRepository;
import com.bank.service.RecurringDepositService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecurringDepositServiceImpl implements RecurringDepositService {

    private final RecurringDepositRepository recurringDepositRepository;
    private final AccountRepository accountRepository;

    @Override
    @Transactional
    public RecurringDepositResponse open(OpenRecurringDepositRequest request) {
        Account account = accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + request.getAccountNumber()));

        LocalDate start = LocalDate.now();
        RecurringDeposit rd = RecurringDeposit.builder()
                .accountId(account.getAccountId())
                .monthlyInstallment(request.getMonthlyInstallment())
                .interestRate(request.getInterestRate())
                .tenureMonths(request.getTenureMonths())
                .startDate(start)
                .maturityDate(start.plusMonths(request.getTenureMonths()))
                .status("ACTIVE")
                .build();

        return toResponse(recurringDepositRepository.save(rd));
    }

    @Override
    public RecurringDepositResponse getById(Long rdId) {
        return toResponse(recurringDepositRepository.findById(rdId)
                .orElseThrow(() -> new DepositNotFoundException("Recurring deposit not found: " + rdId)));
    }

    @Override
    public List<RecurringDepositResponse> getByAccount(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountNumber));
        return recurringDepositRepository.findByAccountId(account.getAccountId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public RecurringDepositResponse close(Long rdId) {
        RecurringDeposit rd = recurringDepositRepository.findById(rdId)
                .orElseThrow(() -> new DepositNotFoundException("Recurring deposit not found: " + rdId));
        rd.setStatus("CLOSED_PREMATURE");
        return toResponse(recurringDepositRepository.save(rd));
    }

    private RecurringDepositResponse toResponse(RecurringDeposit rd) {
        return RecurringDepositResponse.builder()
                .rdId(rd.getRdId())
                .accountId(rd.getAccountId())
                .monthlyInstallment(rd.getMonthlyInstallment())
                .interestRate(rd.getInterestRate())
                .tenureMonths(rd.getTenureMonths())
                .startDate(rd.getStartDate())
                .maturityDate(rd.getMaturityDate())
                .status(rd.getStatus())
                .build();
    }
}
