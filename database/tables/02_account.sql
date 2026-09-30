-- ============================================================
-- ACCOUNT tables
-- ============================================================

CREATE TABLE account (
    account_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_number  VARCHAR2(20) NOT NULL UNIQUE,
    customer_id     NUMBER NOT NULL REFERENCES customer(customer_id),
    account_type    VARCHAR2(30) NOT NULL, -- SAVINGS, CURRENT, SALARY, FD, RD
    balance         NUMBER(19,4) DEFAULT 0 NOT NULL,
    currency        VARCHAR2(3)  DEFAULT 'INR' NOT NULL,
    status          VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL,
    version         NUMBER DEFAULT 0 NOT NULL,
    created_at      TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at      TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT chk_account_status CHECK (status IN ('ACTIVE','FROZEN','CLOSED')),
    CONSTRAINT chk_balance_nonneg CHECK (balance >= 0)
);

CREATE INDEX idx_account_customer ON account(customer_id);

CREATE TABLE account_holder (
    account_holder_id  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id         NUMBER NOT NULL REFERENCES account(account_id),
    customer_id        NUMBER NOT NULL REFERENCES customer(customer_id),
    holder_type         VARCHAR2(20) DEFAULT 'PRIMARY' -- PRIMARY, JOINT
);

CREATE TABLE beneficiary (
    beneficiary_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id          NUMBER NOT NULL REFERENCES customer(customer_id),
    beneficiary_name     VARCHAR2(200) NOT NULL,
    beneficiary_account  VARCHAR2(20)  NOT NULL,
    ifsc_code             VARCHAR2(15),
    nickname              VARCHAR2(100),
    added_at              TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);
