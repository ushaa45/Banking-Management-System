-- ============================================================
-- withdraw_money: debit an account and write the ledger entry
-- ============================================================

CREATE OR REPLACE PROCEDURE withdraw_money (
    p_account_number  IN  VARCHAR2,
    p_amount          IN  NUMBER,
    p_reference       IN  VARCHAR2,
    p_remarks         IN  VARCHAR2 DEFAULT NULL,
    p_transaction_id  OUT NUMBER
)
AS
    v_account_id  account.account_id%TYPE;
    v_balance     account.balance%TYPE;
    v_status      account.status%TYPE;
    v_new_balance account.balance%TYPE;
BEGIN
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE_APPLICATION_ERROR(-20005, 'Withdrawal amount must be greater than zero');
    END IF;

    SELECT account_id, balance, status INTO v_account_id, v_balance, v_status
    FROM account WHERE account_number = p_account_number FOR UPDATE;

    IF v_status <> 'ACTIVE' THEN
        RAISE_APPLICATION_ERROR(-20002, 'Account is not active: ' || p_account_number);
    END IF;

    IF v_balance < p_amount THEN
        RAISE_APPLICATION_ERROR(-20001, 'Insufficient balance in account ' || p_account_number);
    END IF;

    v_new_balance := v_balance - p_amount;

    UPDATE account SET balance = v_new_balance, updated_at = SYSTIMESTAMP
    WHERE account_id = v_account_id;

    INSERT INTO transaction (
        transaction_reference, transaction_type, from_account_number,
        amount, transaction_status, remarks
    ) VALUES (
        p_reference, 'WITHDRAWAL', p_account_number, p_amount, 'SUCCESS', p_remarks
    )
    RETURNING transaction_id INTO p_transaction_id;

    INSERT INTO ledger_entry (
        transaction_id, account_id, entry_type, amount, balance_before, balance_after
    ) VALUES (
        p_transaction_id, v_account_id, 'DEBIT', p_amount, v_balance, v_new_balance
    );

    COMMIT;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        ROLLBACK;
        RAISE_APPLICATION_ERROR(-20006, 'Account does not exist: ' || p_account_number);
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END withdraw_money;
/
