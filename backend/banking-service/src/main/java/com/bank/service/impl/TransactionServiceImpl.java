package com.bank.service.impl;

import com.bank.dto.DepositWithdrawRequest;
import com.bank.dto.TransactionResponse;
import com.bank.dto.TransferRequest;
import com.bank.entity.Account;
import com.bank.entity.LedgerEntry;
import com.bank.entity.Transaction;
import com.bank.exception.AccountNotActiveException;
import com.bank.exception.AccountNotFoundException;
import com.bank.exception.InsufficientBalanceException;
import com.bank.repository.AccountRepository;
import com.bank.repository.LedgerEntryRepository;
import com.bank.repository.TransactionRepository;
import com.bank.service.EventPublisher;
import com.bank.service.TransactionService;
import com.bank.util.ReferenceGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Implements deposit / withdraw / transfer with a double-entry ledger.
 *
 * NOTE on Oracle: this Java-level implementation uses JPA pessimistic
 * locking (SELECT ... FOR UPDATE under the hood, same idea as the
 * `transfer_money` PL/SQL procedure in database/procedures/). Either
 * approach gives you atomic, race-free balance updates. If you'd rather
 * push the critical section fully into the database (as the requirement
 * doc suggests for "critical banking operations"), replace the body of
 * transfer() with a call to the stored procedure via JdbcTemplate /
 * SimpleJdbcCall instead of the repository calls below — the ledger
 * table shape is identical either way.
 */
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final EventPublisher eventPublisher;

    @Override
    @Transactional
    public TransactionResponse deposit(DepositWithdrawRequest request) {
        Account account = lockAccountOrThrow(request.getAccountNumber());
        assertActive(account);

        BigDecimal before = account.getBalance();
        BigDecimal after = before.add(request.getAmount());
        account.setBalance(after);
        accountRepository.save(account);

        Transaction txn = saveTransaction("DEPOSIT", null, account.getAccountNumber(),
                request.getAmount(), request.getRemarks());

        ledgerEntryRepository.save(LedgerEntry.builder()
                .transactionId(txn.getTransactionId())
                .accountId(account.getAccountId())
                .entryType("CREDIT")
                .amount(request.getAmount())
                .balanceBefore(before)
                .balanceAfter(after)
                .build());

        eventPublisher.publish("TRANSACTION_COMPLETED", txn.getTransactionReference(), toResponse(txn));

        return toResponse(txn);
    }

    @Override
    @Transactional
    public TransactionResponse withdraw(DepositWithdrawRequest request) {
        Account account = lockAccountOrThrow(request.getAccountNumber());
        assertActive(account);

        BigDecimal before = account.getBalance();
        if (before.compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException(
                    "Insufficient balance in account " + account.getAccountNumber());
        }
        BigDecimal after = before.subtract(request.getAmount());
        account.setBalance(after);
        accountRepository.save(account);

        Transaction txn = saveTransaction("WITHDRAWAL", account.getAccountNumber(), null,
                request.getAmount(), request.getRemarks());

        ledgerEntryRepository.save(LedgerEntry.builder()
                .transactionId(txn.getTransactionId())
                .accountId(account.getAccountId())
                .entryType("DEBIT")
                .amount(request.getAmount())
                .balanceBefore(before)
                .balanceAfter(after)
                .build());

        return toResponse(txn);
    }

    @Override
    @Transactional
    public TransactionResponse transfer(TransferRequest request) {
        if (request.getFromAccountNumber().equals(request.getToAccountNumber())) {
            throw new IllegalArgumentException("Source and destination accounts must differ");
        }

        // Lock accounts in a deterministic order (by account number) to avoid deadlocks
        // when two transfers happen between the same pair of accounts concurrently.
        String first = request.getFromAccountNumber().compareTo(request.getToAccountNumber()) < 0
                ? request.getFromAccountNumber() : request.getToAccountNumber();
        String second = first.equals(request.getFromAccountNumber())
                ? request.getToAccountNumber() : request.getFromAccountNumber();

        Account lockedFirst = lockAccountOrThrow(first);
        Account lockedSecond = lockAccountOrThrow(second);

        Account fromAccount = lockedFirst.getAccountNumber().equals(request.getFromAccountNumber())
                ? lockedFirst : lockedSecond;
        Account toAccount = lockedFirst.getAccountNumber().equals(request.getToAccountNumber())
                ? lockedFirst : lockedSecond;

        assertActive(fromAccount);
        assertActive(toAccount);

        BigDecimal fromBefore = fromAccount.getBalance();
        if (fromBefore.compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException(
                    "Insufficient balance in account " + fromAccount.getAccountNumber());
        }
        BigDecimal fromAfter = fromBefore.subtract(request.getAmount());
        BigDecimal toBefore = toAccount.getBalance();
        BigDecimal toAfter = toBefore.add(request.getAmount());

        fromAccount.setBalance(fromAfter);
        toAccount.setBalance(toAfter);
        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);

        Transaction txn = saveTransaction(
                request.getChannel() == null ? "TRANSFER" : request.getChannel(),
                fromAccount.getAccountNumber(), toAccount.getAccountNumber(),
                request.getAmount(), request.getRemarks());

        ledgerEntryRepository.save(LedgerEntry.builder()
                .transactionId(txn.getTransactionId())
                .accountId(fromAccount.getAccountId())
                .entryType("DEBIT")
                .amount(request.getAmount())
                .balanceBefore(fromBefore)
                .balanceAfter(fromAfter)
                .build());

        ledgerEntryRepository.save(LedgerEntry.builder()
                .transactionId(txn.getTransactionId())
                .accountId(toAccount.getAccountId())
                .entryType("CREDIT")
                .amount(request.getAmount())
                .balanceBefore(toBefore)
                .balanceAfter(toAfter)
                .build());

        eventPublisher.publish("TRANSACTION_COMPLETED", txn.getTransactionReference(), toResponse(txn));
        eventPublisher.publish("MONEY_TRANSFERRED", txn.getTransactionReference(), toResponse(txn));

        return toResponse(txn);
    }

    @Override
    public List<TransactionResponse> getHistory(String accountNumber) {
        return transactionRepository
                .findByFromAccountNumberOrToAccountNumberOrderByTransactionDateDesc(accountNumber, accountNumber)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private Account lockAccountOrThrow(String accountNumber) {
        return accountRepository.findByAccountNumberForUpdate(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountNumber));
    }

    private void assertActive(Account account) {
        if (!"ACTIVE".equals(account.getStatus())) {
            throw new AccountNotActiveException(
                    "Account " + account.getAccountNumber() + " is " + account.getStatus());
        }
    }

    private Transaction saveTransaction(String type, String fromAcc, String toAcc,
                                         BigDecimal amount, String remarks) {
        Transaction txn = Transaction.builder()
                .transactionReference(ReferenceGenerator.generateTransactionReference())
                .transactionType(type)
                .fromAccountNumber(fromAcc)
                .toAccountNumber(toAcc)
                .amount(amount)
                .transactionStatus("SUCCESS")
                .remarks(remarks)
                .build();
        return transactionRepository.save(txn);
    }

    private TransactionResponse toResponse(Transaction t) {
        return TransactionResponse.builder()
                .transactionId(t.getTransactionId())
                .transactionReference(t.getTransactionReference())
                .transactionType(t.getTransactionType())
                .fromAccountNumber(t.getFromAccountNumber())
                .toAccountNumber(t.getToAccountNumber())
                .amount(t.getAmount())
                .transactionStatus(t.getTransactionStatus())
                .remarks(t.getRemarks())
                .transactionDate(t.getTransactionDate())
                .build();
    }
}
