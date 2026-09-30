package com.bank.service.impl;

import com.bank.dto.AccountRequest;
import com.bank.dto.AccountResponse;
import com.bank.entity.Account;
import com.bank.entity.Customer;
import com.bank.exception.AccountNotFoundException;
import com.bank.exception.CustomerNotFoundException;
import com.bank.repository.AccountRepository;
import com.bank.repository.CustomerRepository;
import com.bank.service.AccountService;
import com.bank.service.EventPublisher;
import com.bank.util.AccountNumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final EventPublisher eventPublisher;

    /**
     * Opens a new bank account.
     */
    @Override
    @Transactional
    public AccountResponse openAccount(AccountRequest request) {

        // 1. Validate request
        validateOpeningRequest(request);

        // 2. Verify customer exists
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() ->
                        new CustomerNotFoundException(
                                "Customer not found: " + request.getCustomerId()
                        )
                );

        // 3. Generate a unique account number
        String accountNumber = generateUniqueAccountNumber();

        // 4. Create account
        Account account = Account.builder()
                .accountNumber(accountNumber)
                .customerId(customer.getCustomerId())
                .accountType(request.getAccountType())
                .balance(request.getOpeningBalance())
                .currency(request.getCurrency())
                .status("ACTIVE")
                .build();

        // 5. Save account
        Account savedAccount = accountRepository.save(account);

        // 6. Convert to response
        AccountResponse response = toResponse(savedAccount);

        // 7. Publish event
        eventPublisher.publish(
                "ACCOUNT_CREATED",
                savedAccount.getAccountNumber(),
                response
        );

        return response;
    }

    /**
     * Get account by account number.
     */
    @Override
    public AccountResponse getByAccountNumber(String accountNumber) {

        validateAccountNumber(accountNumber);

        Account account = findAccountOrThrow(accountNumber);

        return toResponse(account);
    }

    /**
     * Get all accounts belonging to a customer.
     */
    @Override
    public List<AccountResponse> getByCustomerId(Long customerId) {

        if (customerId == null) {
            throw new IllegalArgumentException("Customer ID is required");
        }

        return accountRepository.findByCustomerId(customerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Freeze an account.
     */
    @Override
    @Transactional
    public AccountResponse freeze(String accountNumber) {

        validateAccountNumber(accountNumber);

        Account account = findAccountOrThrow(accountNumber);

        if ("CLOSED".equalsIgnoreCase(account.getStatus())) {
            throw new IllegalStateException(
                    "Closed account cannot be frozen"
            );
        }

        if ("FROZEN".equalsIgnoreCase(account.getStatus())) {
            throw new IllegalStateException(
                    "Account is already frozen"
            );
        }

        account.setStatus("FROZEN");

        Account savedAccount = accountRepository.save(account);

        AccountResponse response = toResponse(savedAccount);

        eventPublisher.publish(
                "ACCOUNT_FROZEN",
                savedAccount.getAccountNumber(),
                response
        );

        return response;
    }

    /**
     * Close an account.
     */
    @Override
    @Transactional
    public AccountResponse close(String accountNumber) {

        validateAccountNumber(accountNumber);

        Account account = findAccountOrThrow(accountNumber);

        if ("CLOSED".equalsIgnoreCase(account.getStatus())) {
            throw new IllegalStateException(
                    "Account is already closed"
            );
        }

        if (account.getBalance() == null) {
            throw new IllegalStateException(
                    "Account balance cannot be null"
            );
        }

        if (account.getBalance().compareTo(BigDecimal.ZERO) != 0) {
            throw new IllegalStateException(
                    "Account cannot be closed while balance is not zero"
            );
        }

        account.setStatus("CLOSED");

        Account savedAccount = accountRepository.save(account);

        AccountResponse response = toResponse(savedAccount);

        eventPublisher.publish(
                "ACCOUNT_CLOSED",
                savedAccount.getAccountNumber(),
                response
        );

        return response;
    }

    /**
     * Find account or throw a proper exception.
     */
    private Account findAccountOrThrow(String accountNumber) {

        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() ->
                        new AccountNotFoundException(
                                "Account not found: " + accountNumber
                        )
                );
    }

    /**
     * Generate an account number that doesn't already exist.
     *
     * NOTE:
     * The database should ALSO have a UNIQUE constraint
     * on account_number.
     */
    private String generateUniqueAccountNumber() {

        for (int attempt = 0; attempt < 10; attempt++) {

            String accountNumber =
                    AccountNumberGenerator.generate();

            if (!accountRepository.existsByAccountNumber(accountNumber)) {
                return accountNumber;
            }
        }

        throw new IllegalStateException(
                "Unable to generate a unique account number"
        );
    }

    /**
     * Validate account-opening request.
     */
    private void validateOpeningRequest(AccountRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Account request cannot be null"
            );
        }

        if (request.getCustomerId() == null) {
            throw new IllegalArgumentException(
                    "Customer ID is required"
            );
        }

        if (request.getAccountType() == null) {
            throw new IllegalArgumentException(
                    "Account type is required"
            );
        }

        if (request.getCurrency() == null) {

            throw new IllegalArgumentException(
                    "Currency is required"
            );
        }

        if (request.getOpeningBalance() == null) {
            throw new IllegalArgumentException(
                    "Opening balance is required"
            );
        }

        if (request.getOpeningBalance()
                .compareTo(BigDecimal.ZERO) < 0) {

            throw new IllegalArgumentException(
                    "Opening balance cannot be negative"
            );
        }
    }

    /**
     * Basic account-number validation.
     */
    private void validateAccountNumber(String accountNumber) {

        if (accountNumber == null ||
                accountNumber.isBlank()) {

            throw new IllegalArgumentException(
                    "Account number is required"
            );
        }
    }

    /**
     * Entity -> DTO conversion.
     */
    private AccountResponse toResponse(Account account) {

        return AccountResponse.builder()
                .accountId(account.getAccountId())
                .accountNumber(account.getAccountNumber())
                .customerId(account.getCustomerId())
                .accountType(account.getAccountType())
                .balance(account.getBalance())
                .currency(account.getCurrency())
                .status(account.getStatus())
                .createdAt(account.getCreatedAt())
                .build();
    }
}