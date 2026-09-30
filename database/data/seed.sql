-- Sample seed data for local testing

INSERT INTO role (role_name) VALUES ('SUPER_ADMIN');
INSERT INTO role (role_name) VALUES ('BANK_ADMIN');
INSERT INTO role (role_name) VALUES ('BRANCH_MANAGER');
INSERT INTO role (role_name) VALUES ('BANK_EMPLOYEE');
INSERT INTO role (role_name) VALUES ('TELLER');
INSERT INTO role (role_name) VALUES ('CUSTOMER');
INSERT INTO role (role_name) VALUES ('AUDITOR');

INSERT INTO customer (first_name, last_name, email, phone, date_of_birth, kyc_status, status)
VALUES ('Rahul', 'Sharma', 'rahul.sharma@example.com', '+91-9876543210', DATE '1990-05-14', 'VERIFIED', 'ACTIVE');

INSERT INTO customer (first_name, last_name, email, phone, date_of_birth, kyc_status, status)
VALUES ('Priya', 'Nair', 'priya.nair@example.com', '+91-9123456780', DATE '1992-11-02', 'VERIFIED', 'ACTIVE');

INSERT INTO account (account_number, customer_id, account_type, balance, currency, status)
VALUES ('100000000001', 1, 'SAVINGS', 125450.00, 'INR', 'ACTIVE');

INSERT INTO account (account_number, customer_id, account_type, balance, currency, status)
VALUES ('100000000002', 2, 'SAVINGS', 45000.00, 'INR', 'ACTIVE');

COMMIT;
