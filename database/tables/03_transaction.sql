-- ============================================================
-- TRANSACTION tables
-- ============================================================

CREATE TABLE transaction (
    transaction_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    transaction_reference   VARCHAR2(40) NOT NULL UNIQUE,
    transaction_type        VARCHAR2(30) NOT NULL, -- DEPOSIT, WITHDRAWAL, TRANSFER, NEFT, RTGS, IMPS, UPI
    from_account_number     VARCHAR2(20),
    to_account_number       VARCHAR2(20),
    amount                  NUMBER(19,4) NOT NULL,
    transaction_status      VARCHAR2(20) DEFAULT 'PENDING' NOT NULL,
    remarks                 VARCHAR2(255),
    transaction_date        TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT chk_txn_status CHECK (transaction_status IN ('PENDING','SUCCESS','FAILED','REVERSED')),
    CONSTRAINT chk_txn_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_txn_from_account ON transaction(from_account_number);
CREATE INDEX idx_txn_to_account   ON transaction(to_account_number);
CREATE INDEX idx_txn_date         ON transaction(transaction_date);

CREATE TABLE fund_transfer (
    fund_transfer_id    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    transaction_id       NUMBER NOT NULL REFERENCES transaction(transaction_id),
    channel               VARCHAR2(20) NOT NULL, -- NEFT, RTGS, IMPS, UPI, INTERNAL
    beneficiary_id        NUMBER REFERENCES beneficiary(beneficiary_id)
);
