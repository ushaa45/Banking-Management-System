-- ============================================================
-- transfer_money: atomic fund transfer with double-entry ledger
--
-- This mirrors what TransactionServiceImpl.transfer() does at the
-- Java/JPA level, but pushes the critical section into the database
-- itself, which is the approach the requirement doc recommends for
-- the most critical banking operations. Use this via a
-- SimpleJdbcCall/CallableStatement from the Spring service layer if
-- you want the atomicity guarantee to live in Oracle rather than JPA.
-- ============================================================

CREATE OR REPLACE PROCEDURE transfer_money (
    p_from_account   IN  VARCHAR2,
    p_to_account     IN  VARCHAR2,
    p_amount         IN  NUMBER,
    p_reference      IN  VARCHAR2,
    p_channel        IN  VARCHAR2 DEFAULT 'INTERNAL',
    p_remarks        IN  VARCHAR2 DEFAULT NULL,
    p_transaction_id OUT NUMBER
)
AS
    v_from_account_id    account.account_id%TYPE;
    v_to_account_id      account.account_id%TYPE;
    v_from_balance        account.balance%TYPE;
    v_to_balance          account.balance%TYPE;
    v_from_status          account.status%TYPE;
    v_to_status             account.status%TYPE;
    v_from_new_balance      account.balance%TYPE;
    v_to_new_balance        account.balance%TYPE;
BEGIN
    IF p_from_account = p_to_account THEN
        RAISE_APPLICATION_ERROR(-20004, 'Source and destination accounts must differ');
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE_APPLICATION_ERROR(-20005, 'Transfer amount must be greater than zero');
    END IF;

    -- Lock both rows in a deterministic order (lower account_number first)
    -- to avoid deadlocks between two concurrent transfers on the same pair.
    IF p_from_account < p_to_account THEN
        SELECT account_id, balance, status INTO v_from_account_id, v_from_balance, v_from_status
        FROM account WHERE account_number = p_from_account FOR UPDATE;

        SELECT account_id, balance, status INTO v_to_account_id, v_to_balance, v_to_status
        FROM account WHERE account_number = p_to_account FOR UPDATE;
    ELSE
        SELECT account_id, balance, status INTO v_to_account_id, v_to_balance, v_to_status
        FROM account WHERE account_number = p_to_account FOR UPDATE;

        SELECT account_id, balance, status INTO v_from_account_id, v_from_balance, v_from_status
        FROM account WHERE account_number = p_from_account FOR UPDATE;
    END IF;

    IF v_from_status <> 'ACTIVE' THEN
        RAISE_APPLICATION_ERROR(-20002, 'Source account is not active: ' || p_from_account);
    END IF;

    IF v_to_status <> 'ACTIVE' THEN
        RAISE_APPLICATION_ERROR(-20003, 'Destination account is not active: ' || p_to_account);
    END IF;

    IF v_from_balance < p_amount THEN
        RAISE_APPLICATION_ERROR(-20001, 'Insufficient balance in account ' || p_from_account);
    END IF;

    v_from_new_balance := v_from_balance - p_amount;
    v_to_new_balance   := v_to_balance + p_amount;

    UPDATE account SET balance = v_from_new_balance, updated_at = SYSTIMESTAMP
    WHERE account_id = v_from_account_id;

    UPDATE account SET balance = v_to_new_balance, updated_at = SYSTIMESTAMP
    WHERE account_id = v_to_account_id;

    INSERT INTO transaction (
        transaction_reference, transaction_type, from_account_number,
        to_account_number, amount, transaction_status, remarks
    ) VALUES (
        p_reference, p_channel, p_from_account,
        p_to_account, p_amount, 'SUCCESS', p_remarks
    )
    RETURNING transaction_id INTO p_transaction_id;

    INSERT INTO ledger_entry (
        transaction_id, account_id, entry_type, amount, balance_before, balance_after
    ) VALUES (
        p_transaction_id, v_from_account_id, 'DEBIT', p_amount, v_from_balance, v_from_new_balance
    );

    INSERT INTO ledger_entry (
        transaction_id, account_id, entry_type, amount, balance_before, balance_after
    ) VALUES (
        p_transaction_id, v_to_account_id, 'CREDIT', p_amount, v_to_balance, v_to_new_balance
    );

    COMMIT;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20006, 'One or both accounts do not exist');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END transfer_money;
/
