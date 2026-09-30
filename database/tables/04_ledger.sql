-- ============================================================
-- Double-entry LEDGER
-- ============================================================

CREATE TABLE ledger_entry (
    ledger_id        NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    transaction_id    NUMBER NOT NULL REFERENCES transaction(transaction_id),
    account_id        NUMBER NOT NULL REFERENCES account(account_id),
    entry_type        VARCHAR2(10) NOT NULL, -- DEBIT or CREDIT
    amount            NUMBER(19,4) NOT NULL,
    balance_before    NUMBER(19,4) NOT NULL,
    balance_after     NUMBER(19,4) NOT NULL,
    created_at        TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT chk_entry_type CHECK (entry_type IN ('DEBIT','CREDIT'))
);

CREATE INDEX idx_ledger_txn     ON ledger_entry(transaction_id);
CREATE INDEX idx_ledger_account ON ledger_entry(account_id);
