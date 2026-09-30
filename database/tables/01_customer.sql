-- ============================================================
-- CUSTOMER and related tables
-- ============================================================

CREATE TABLE customer (
    customer_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name      VARCHAR2(100) NOT NULL,
    last_name       VARCHAR2(100) NOT NULL,
    email           VARCHAR2(150) NOT NULL UNIQUE,
    phone           VARCHAR2(20)  NOT NULL,
    date_of_birth   DATE,
    kyc_status      VARCHAR2(20) DEFAULT 'PENDING' NOT NULL,
    status          VARCHAR2(20) DEFAULT 'ACTIVE'  NOT NULL,
    created_at      TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at      TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT chk_customer_status CHECK (status IN ('ACTIVE','INACTIVE','BLOCKED')),
    CONSTRAINT chk_kyc_status CHECK (kyc_status IN ('PENDING','VERIFIED','REJECTED'))
);

CREATE TABLE customer_address (
    address_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id     NUMBER NOT NULL REFERENCES customer(customer_id),
    address_type    VARCHAR2(20) DEFAULT 'PERMANENT',
    line1           VARCHAR2(200) NOT NULL,
    line2           VARCHAR2(200),
    city            VARCHAR2(100) NOT NULL,
    state           VARCHAR2(100) NOT NULL,
    postal_code     VARCHAR2(20)  NOT NULL,
    country         VARCHAR2(100) DEFAULT 'INDIA' NOT NULL
);

CREATE TABLE customer_kyc (
    kyc_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id     NUMBER NOT NULL REFERENCES customer(customer_id),
    document_type   VARCHAR2(30) NOT NULL, -- PAN, AADHAAR, PASSPORT, VOTER_ID
    document_number VARCHAR2(50) NOT NULL,
    verified_by     NUMBER,
    verified_at     TIMESTAMP,
    status          VARCHAR2(20) DEFAULT 'PENDING' NOT NULL
);

CREATE TABLE customer_document (
    document_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id     NUMBER NOT NULL REFERENCES customer(customer_id),
    document_name   VARCHAR2(200) NOT NULL,
    document_path   VARCHAR2(500) NOT NULL,
    uploaded_at     TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE TABLE nominee (
    nominee_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id     NUMBER NOT NULL REFERENCES customer(customer_id),
    name            VARCHAR2(200) NOT NULL,
    relationship    VARCHAR2(50)  NOT NULL,
    share_percent   NUMBER(5,2) DEFAULT 100
);
