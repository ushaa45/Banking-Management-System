-- ============================================================
-- LOAN, FIXED_DEPOSIT, RECURRING_DEPOSIT, CARD, CHEQUE
-- (table shape only - business logic/services not yet implemented,
--  see README "Next steps to extend")
-- ============================================================

CREATE TABLE loan (
    loan_id           NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id        NUMBER NOT NULL REFERENCES customer(customer_id),
    loan_type          VARCHAR2(30) NOT NULL, -- PERSONAL, HOME, EDUCATION, VEHICLE, BUSINESS
    principal_amount   NUMBER(19,4) NOT NULL,
    interest_rate      NUMBER(5,2) NOT NULL,
    tenure_months      NUMBER NOT NULL,
    status             VARCHAR2(30) DEFAULT 'APPLIED' NOT NULL, -- APPLIED, KYC_VERIFIED,
                                                                  -- CREDIT_EVALUATED, APPROVED,
                                                                  -- SANCTIONED, DISBURSED,
                                                                  -- CLOSED, REJECTED
    applied_at         TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    disbursed_at       TIMESTAMP
);

CREATE TABLE loan_emi (
    emi_id        NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    loan_id        NUMBER NOT NULL REFERENCES loan(loan_id),
    due_date        DATE NOT NULL,
    emi_amount      NUMBER(19,4) NOT NULL,
    status          VARCHAR2(20) DEFAULT 'DUE' NOT NULL -- DUE, PAID, OVERDUE
);

CREATE TABLE loan_payment (
    payment_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    emi_id          NUMBER NOT NULL REFERENCES loan_emi(emi_id),
    paid_amount      NUMBER(19,4) NOT NULL,
    paid_at          TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE TABLE fixed_deposit (
    fd_id             NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id         NUMBER NOT NULL REFERENCES account(account_id),
    principal_amount   NUMBER(19,4) NOT NULL,
    interest_rate      NUMBER(5,2) NOT NULL,
    tenure_months      NUMBER NOT NULL,
    start_date         DATE NOT NULL,
    maturity_date      DATE NOT NULL,
    status             VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL -- ACTIVE, MATURED, CLOSED_PREMATURE
);

CREATE TABLE recurring_deposit (
    rd_id              NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id          NUMBER NOT NULL REFERENCES account(account_id),
    monthly_installment  NUMBER(19,4) NOT NULL,
    interest_rate        NUMBER(5,2) NOT NULL,
    tenure_months         NUMBER NOT NULL,
    start_date            DATE NOT NULL,
    maturity_date         DATE NOT NULL,
    status                VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL
);

CREATE TABLE card (
    card_id         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id       NUMBER NOT NULL REFERENCES account(account_id),
    card_number_mask VARCHAR2(20) NOT NULL, -- store masked, PCI-DSS: never store PAN in plaintext
    card_type        VARCHAR2(20) NOT NULL, -- DEBIT, CREDIT
    expiry_date       DATE NOT NULL,
    status            VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL -- ACTIVE, BLOCKED, EXPIRED
);

CREATE TABLE card_transaction (
    card_txn_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    card_id           NUMBER NOT NULL REFERENCES card(card_id),
    transaction_id     NUMBER NOT NULL REFERENCES transaction(transaction_id),
    merchant_name       VARCHAR2(200)
);

CREATE TABLE cheque (
    cheque_id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id       NUMBER NOT NULL REFERENCES account(account_id),
    cheque_number     VARCHAR2(20) NOT NULL,
    status            VARCHAR2(20) DEFAULT 'ISSUED' NOT NULL -- ISSUED, CLEARED, BOUNCED, CANCELLED
);

CREATE TABLE cheque_transaction (
    cheque_txn_id    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cheque_id         NUMBER NOT NULL REFERENCES cheque(cheque_id),
    transaction_id     NUMBER NOT NULL REFERENCES transaction(transaction_id)
);

CREATE TABLE notification (
    notification_id  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id       NUMBER NOT NULL REFERENCES customer(customer_id),
    channel            VARCHAR2(20) NOT NULL, -- SMS, EMAIL, PUSH
    message            VARCHAR2(500) NOT NULL,
    status             VARCHAR2(20) DEFAULT 'PENDING' NOT NULL,
    created_at         TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);
