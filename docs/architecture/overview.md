# Architecture Overview

Modular monolith, per section 19 of the requirement doc:

```
                   React
                     |
                     v
              Spring Boot API
                     |
       +-------------+--------------+
       |             |              |
   Customer       Account       Transaction
   Module         Module        Module
       |             |              |
       +-------------+--------------+
       |             |              |
       v             v              v
              Oracle Database
                     |
                  PL/SQL
                     |
              Stored Procedures
```

Growth path (add incrementally, don't build all at once):
1. Kafka (async events: ACCOUNT_CREATED, TRANSACTION_COMPLETED, ...)
2. Redis (cache customer profile, account summary, sessions)
3. Docker (containerize backend + frontend)
4. Spring Security + JWT (already wired in this scaffold)
5. Swagger/OpenAPI (already wired in this scaffold)
6. Audit logging (Kafka consumer -> AUDIT_LOG table)

## Fund transfer flow

```
Customer A
     |
     | Debit
     v
 Account A
     |
     v
 Transaction  (atomic: locks both accounts, writes 2 ledger entries)
     |
     | Credit
     v
 Account B
     |
     v
 Customer B
```

Implemented two ways in this scaffold, pick one:
- **Java/JPA** (`TransactionServiceImpl.transfer`) - pessimistic row locks,
  deterministic lock ordering to avoid deadlocks, ledger entries written
  in the same DB transaction.
- **PL/SQL** (`database/procedures/transfer_money.sql`) - same logic
  pushed into Oracle with `FOR UPDATE` and explicit `COMMIT`/`ROLLBACK`.

## Roles (section 9)

| Role | Can do |
|---|---|
| CUSTOMER | View account, transfer money, view transactions |
| TELLER | Deposit, withdrawal, customer search |
| BRANCH_MANAGER | Approve transactions/loans, manage employees |
| BANK_ADMIN / SUPER_ADMIN | Manage users, roles, system config |
| AUDITOR | Read audit logs, generate reports |

These map directly to the `@PreAuthorize` annotations on the controllers
and to the `role` / `user_role` tables in the DB schema.
