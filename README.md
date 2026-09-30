# Bank Management System (BaNCS-inspired Core Banking)

A modular-monolith core banking system built from the requirement doc:
React frontend, Spring Boot 3 backend, Oracle + PL/SQL for critical money
movement, Kafka for async events, Redis for caching, JWT/Spring Security
for auth, and Docker for packaging.

This is a **starter, ready-to-extend scaffold** — it implements the
Customer, Account, and Transaction/Ledger modules end-to-end (entity →
repository → service → controller → PL/SQL procedure) exactly as
architected in section 19 of the requirement doc, plus stubs and folder
structure for every other module (Loans, FD/RD, Cards, Cheques, Reports,
Audit) so you can grow it module by module.

## What's actually wired up and working

- **Customer module** — register/get/update customer (`CustomerController`)
- **Account module** — open account, get account, list customer accounts,
  freeze/close (`AccountController`)
- **Transaction module** — deposit, withdraw, and **fund transfer with a
  double-entry ledger**, calling an Oracle stored procedure
  (`TransactionController` → `TransferService` → `transfer_money` PL/SQL proc)
- **Security** — JWT filter + Spring Security config with role-based
  authorization matching the roles in section 9
- **Global exception handling** — `InsufficientBalanceException`,
  `AccountNotFoundException` → clean JSON error responses
- **Database** — full Oracle DDL for the core tables + the `transfer_money`
  PL/SQL procedure with `FOR UPDATE` row locking and rollback on failure
- **Docker Compose** — backend, frontend, Redis, Kafka + Zookeeper (Oracle
  is intentionally left external — see note below)
- **React frontend** — dashboard, customer list, account details, and a
  "send money" screen wired to the REST API

## What's scaffolded but not fully implemented (by design, per the doc's advice)

Loans, Fixed/Recurring Deposits, Cards, Cheques and Reports get empty
package folders and DB table DDL, but no business logic yet — building
all of that out is the "module by module" work the requirement doc
suggests, and doing it well (esp. interest/EMI schedules) deserves its
own pass rather than a rushed stub.

## Running it

### Backend
```bash
cd backend/banking-service
mvn spring-boot:run
```
Needs an Oracle instance reachable via the JDBC URL in
`src/main/resources/application.yml` (or swap the `oracle` Spring profile
for `dev` which points at an in-memory H2 database with the same schema,
useful for trying the API without an Oracle license/install).

### Database (Oracle)
Run the scripts in `database/` in this order:
```
tables/*.sql        (01 → 06)
sequences/*.sql
procedures/transfer_money.sql
data/seed.sql        (optional sample data)
```

**Note on `dev` profile startup:** Kafka topic auto-creation and the
Redis health check are both skipped when the `dev` profile is active
(no local Kafka/Redis needed). If you see Kafka connection warnings on
startup anyway, make sure you're actually running with `dev` active —
it's the default, but an explicit `SPRING_PROFILES_ACTIVE=oracle` or a
stale `application-local.yml` can override it.

### Frontend
```bash
cd frontend/banking-web
npm install
npm start
```

### Everything via Docker (backend + frontend + redis + kafka)
```bash
docker compose up --build
```
Point `SPRING_DATASOURCE_URL` at your Oracle instance via an env var or
`.env` file — Oracle itself isn't containerized here since licensing and
sizing vary too much to bake into a generic compose file.

## Folder layout
See `docs/architecture/` for the full architecture diagrams (copied from
the requirement doc) and `docs/database/` for the ER-diagram notes.

## Next steps to extend
1. Implement `LoanService` (workflow: application → KYC → credit
   evaluation → approval → disbursement → EMI schedule).
2. Implement `FixedDepositService` with maturity/interest calc.
3. Wire `AuditService` as a Kafka consumer writing to `AUDIT_LOG`.
4. Add `NotificationService` (SMS/email) as another Kafka consumer.
5. Add Prometheus/Grafana + Swagger UI (dependencies are already in
   `pom.xml`, just need `@Configuration` beans).
