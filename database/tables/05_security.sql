-- ============================================================
-- USER / ROLE (application login, distinct from bank CUSTOMER)
-- ============================================================

CREATE TABLE app_user (
    user_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username          VARCHAR2(100) NOT NULL UNIQUE,
    password_hash     VARCHAR2(255) NOT NULL,
    customer_id       NUMBER REFERENCES customer(customer_id), -- null for staff
    employee_code     VARCHAR2(30),
    status            VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL,
    created_at        TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE TABLE role (
    role_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_name    VARCHAR2(50) NOT NULL UNIQUE -- SUPER_ADMIN, BANK_ADMIN, BRANCH_MANAGER,
                                                -- BANK_EMPLOYEE, TELLER, CUSTOMER, AUDITOR
);

CREATE TABLE user_role (
    user_id  NUMBER NOT NULL REFERENCES app_user(user_id),
    role_id  NUMBER NOT NULL REFERENCES role(role_id),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE audit_log (
    audit_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id        NUMBER REFERENCES app_user(user_id),
    action         VARCHAR2(100) NOT NULL,
    entity_type    VARCHAR2(60)  NOT NULL,
    entity_id      VARCHAR2(60),
    old_value      CLOB,
    new_value      CLOB,
    ip_address     VARCHAR2(45),
    created_at     TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_user   ON audit_log(user_id);
