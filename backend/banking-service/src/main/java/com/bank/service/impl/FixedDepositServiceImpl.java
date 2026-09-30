package com.bank.service.impl;

import com.bank.dto.FixedDepositResponse;
import com.bank.dto.OpenFixedDepositRequest;
import com.bank.entity.Account;
import com.bank.entity.FixedDeposit;
import com.bank.exception.AccountNotActiveException;
import com.bank.exception.AccountNotFoundException;
import com.bank.exception.DepositNotFoundException;
import com.bank.exception.InsufficientBalanceException;
import com.bank.repository.AccountRepository;
import com.bank.repository.FixedDepositRepository;
import com.bank.service.FixedDepositService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FixedDepositServiceImpl implements FixedDepositService {

    private final FixedDepositRepository fixedDepositRepository;
    private final AccountRepository accountRepository;

    @Override
    @Transactional
    public FixedDepositResponse open(OpenFixedDepositRequest request) {
        Account account = accountRepository.findByAccountNumberForUpdate(request.getAccountNumber())
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + request.getAccountNumber()));

        if (!"ACTIVE".equals(account.getStatus())) {
            throw new AccountNotActiveException("Account " + account.getAccountNumber() + " is " + account.getStatus());
        }
        if (account.getBalance().compareTo(request.getPrincipalAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance to open this fixed deposit");
        }

        account.setBalance(account.getBalance().subtract(request.getPrincipalAmount()));
        accountRepository.save(account);

        LocalDate start = LocalDate.now();
        FixedDeposit fd = FixedDeposit.builder()
                .accountId(account.getAccountId())
                .principalAmount(request.getPrincipalAmount())
                .interestRate(request.getInterestRate())
                .tenureMonths(request.getTenureMonths())
                .startDate(start)
                .maturityDate(start.plusMonths(request.getTenureMonths()))
                .status("ACTIVE")
                .build();

        return toResponse(fixedDepositRepository.save(fd));
    }

    @Override
    public FixedDepositResponse getById(Long fdId) {
        return toResponse(fixedDepositRepository.findById(fdId)
                .orElseThrow(() -> new DepositNotFoundException("Fixed deposit not found: " + fdId)));
    }

    @Override
    public List<FixedDepositResponse> getByAccount(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountNumber));
        return fixedDepositRepository.findByAccountId(account.getAccountId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public FixedDepositResponse closePrematurely(Long fdId) {
        FixedDeposit fd = fixedDepositRepository.findById(fdId)
                .orElseThrow(() -> new DepositNotFoundException("Fixed deposit not found: " + fdId));

        Account account = accountRepository.findById(fd.getAccountId())
                .orElseThrow(() -> new AccountNotFoundException("Account not found for this deposit"));

        account.setBalance(account.getBalance().add(fd.getPrincipalAmount()));
        accountRepository.save(account);

        fd.setStatus("CLOSED_PREMATURE");
        return toResponse(fixedDepositRepository.save(fd));
    }

    private FixedDepositResponse toResponse(FixedDeposit fd) {
        double years = fd.getTenureMonths() / 12.0;
        double rate = fd.getInterestRate().doubleValue() / 100.0;
        double maturity = fd.getPrincipalAmount().doubleValue() * Math.pow(1 + rate, years);
        BigDecimal maturityAmount = BigDecimal.valueOf(maturity).setScale(2, RoundingMode.HALF_UP);

        return FixedDepositResponse.builder()
                .fdId(fd.getFdId())
                .accountId(fd.getAccountId())
                .principalAmount(fd.getPrincipalAmount())
                .interestRate(fd.getInterestRate())
                .tenureMonths(fd.getTenureMonths())
                .startDate(fd.getStartDate())
                .maturityDate(fd.getMaturityDate())
                .projectedMaturityAmount(maturityAmount)
                .status(fd.getStatus())
                .build();
    }

}
