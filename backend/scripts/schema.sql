-- =========================================================
-- ParivarSetu: One Family – One ID Schema (PostgreSQL)
-- =========================================================

-- Clean existing tables if needed for fresh setup
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS schemes CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS bank_info CASCADE;
DROP TABLE IF EXISTS business_info CASCADE;
DROP TABLE IF EXISTS education_info CASCADE;
DROP TABLE IF EXISTS health_info CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS families CASCADE;

-- ===== CORE IDENTITY =====
CREATE TABLE families (
    family_id          VARCHAR(20) PRIMARY KEY,          -- e.g. auto-generated 12-digit
    head_name          VARCHAR(100) NOT NULL,
    income             NUMERIC(12,2) NOT NULL,
    category           VARCHAR(30),                      -- BPL/APL/SC/ST/OBC/General
    district           VARCHAR(50),
    ration_card_no     VARCHAR(30) UNIQUE,
    aadhaar_ref_masked VARCHAR(20),                      -- store only masked (XXXX-XXXX-1234)
    status             VARCHAR(20) DEFAULT 'provisional',-- provisional/permanent/rejected
    health_tags        TEXT[] DEFAULT '{}',               -- denormalized, synced
    education_tags     TEXT[] DEFAULT '{}',               -- denormalized, synced
    business_tags      TEXT[] DEFAULT '{}',               -- denormalized, synced
    created_at         TIMESTAMP DEFAULT now(),
    updated_at         TIMESTAMP DEFAULT now()
);

CREATE TABLE family_members (
    id          SERIAL PRIMARY KEY,
    family_id   VARCHAR(20) REFERENCES families(family_id) ON DELETE CASCADE,
    name        VARCHAR(100),
    age         INT,
    gender      VARCHAR(10),
    relation    VARCHAR(30),   -- head/spouse/child/parent
    occupation  VARCHAR(50)
);

-- ===== DOMAIN-SPECIFIC INFO (member-linked, family-linked) =====
CREATE TABLE health_info (
    id              SERIAL PRIMARY KEY,
    family_id       VARCHAR(20) REFERENCES families(family_id) ON DELETE CASCADE,
    member_id       INT REFERENCES family_members(id) ON DELETE CASCADE,
    condition_tags  TEXT[] DEFAULT '{}',   -- ['pregnant','diabetic','disability']
    bpl_health_card BOOLEAN DEFAULT false
);

CREATE TABLE education_info (
    id                SERIAL PRIMARY KEY,
    family_id         VARCHAR(20) REFERENCES families(family_id) ON DELETE CASCADE,
    member_id         INT REFERENCES family_members(id) ON DELETE CASCADE,
    current_class     VARCHAR(20),        -- '10th','UG-2'
    school_or_college VARCHAR(100),
    last_percentage   FLOAT,
    enrollment_status VARCHAR(20) DEFAULT 'enrolled'
);

CREATE TABLE business_info (
    id                   SERIAL PRIMARY KEY,
    family_id            VARCHAR(20) REFERENCES families(family_id) ON DELETE CASCADE,
    member_id            INT REFERENCES family_members(id) ON DELETE CASCADE,
    business_name        VARCHAR(100),
    business_type        VARCHAR(30),    -- startup/MSME/small_business
    registration_status  VARCHAR(20),    -- registered/unregistered
    business_age_months  INT,
    annual_turnover      NUMERIC(12,2)
);

CREATE TABLE bank_info (
    id                    SERIAL PRIMARY KEY,
    family_id             VARCHAR(20) UNIQUE REFERENCES families(family_id) ON DELETE CASCADE,
    account_number_masked VARCHAR(20),   -- e.g. ****4321
    ifsc                  VARCHAR(15),
    bank_name             VARCHAR(50),
    account_holder        VARCHAR(100)
);

-- ===== GOVERNMENT / SCHEME SIDE =====
CREATE TABLE departments (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(50) UNIQUE   -- Health, Education, MSME, Agriculture, Housing...
);

CREATE TABLE schemes (
    id                      SERIAL PRIMARY KEY,
    dept_id                 INT REFERENCES departments(id),
    name                    VARCHAR(100),
    description             TEXT,
    min_income              NUMERIC(12,2),
    max_income              NUMERIC(12,2),
    category                VARCHAR(30),           -- optional category filter
    required_condition_tag  VARCHAR(30),           -- health rule
    required_class          VARCHAR(20),           -- education rule
    min_percentage          FLOAT,                 -- education rule
    business_category       VARCHAR(30),           -- business rule
    min_business_age        INT,                   -- business rule
    benefit_amount          NUMERIC(12,2),
    active                  BOOLEAN DEFAULT true,
    created_at              TIMESTAMP DEFAULT now()
);

CREATE TABLE applications (
    id                SERIAL PRIMARY KEY,
    family_id         VARCHAR(20) REFERENCES families(family_id),
    member_id         INT REFERENCES family_members(id) NULL,  -- specific person if applicable
    scheme_id         INT REFERENCES schemes(id),
    status            VARCHAR(20) DEFAULT 'Notified',
    -- Notified -> Applied -> Under Review -> Approved -> Disbursed
    --                                     \-> Rejected
    -- Applied/Under Review -> Escalated (via complaint)
    disbursed_amount  NUMERIC(12,2),
    txn_id            VARCHAR(50),
    applied_on        TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT now(),
    UNIQUE (family_id, member_id, scheme_id)   -- 🔴 prevents duplicate applications
);

CREATE TABLE complaints (
    id               SERIAL PRIMARY KEY,
    application_id   INT REFERENCES applications(id),
    message          TEXT,
    status           VARCHAR(20) DEFAULT 'Open',  -- Open/Resolved
    officer_response TEXT,
    created_at        TIMESTAMP DEFAULT now(),
    resolved_at      TIMESTAMP
);

CREATE TABLE notifications (
    id          SERIAL PRIMARY KEY,
    family_id   VARCHAR(20) REFERENCES families(family_id),
    scheme_id   INT REFERENCES schemes(id),
    message     TEXT,
    read        BOOLEAN DEFAULT false,
    created_at  TIMESTAMP DEFAULT now(),
    UNIQUE (family_id, scheme_id)   -- 🔴 prevents duplicate notifications
);

-- ===== AUTH & SECURITY =====
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(100) UNIQUE,
    password_hash   VARCHAR(200),
    role            VARCHAR(20),      -- citizen/officer/verifier/admin
    dept_id         INT REFERENCES departments(id) NULL,  -- only for officers
    family_id       VARCHAR(20) REFERENCES families(family_id) NULL, -- only for citizens
    created_at      TIMESTAMP DEFAULT now()
);

CREATE TABLE audit_logs (
    id          SERIAL PRIMARY KEY,
    user_id     INT REFERENCES users(id),
    action      VARCHAR(50),     -- 'approve_application','disburse','reject','verify_family'
    entity      VARCHAR(30),     -- 'application','family','complaint'
    entity_id   VARCHAR(20),
    timestamp   TIMESTAMP DEFAULT now()
);

-- ===== INDEXES (for speed/scalability) =====
CREATE INDEX idx_families_income ON families(income);
CREATE INDEX idx_families_category ON families(category);
CREATE INDEX idx_families_health_tags ON families USING GIN(health_tags);
CREATE INDEX idx_families_education_tags ON families USING GIN(education_tags);
CREATE INDEX idx_families_business_tags ON families USING GIN(business_tags);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_scheme ON applications(scheme_id);
CREATE INDEX idx_applications_family ON applications(family_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_app_family_scheme_null_member ON applications (family_id, scheme_id) WHERE member_id IS NULL;

-- ===== INITIAL SEED FOR DEPARTMENTS =====
INSERT INTO departments (name) VALUES 
('Health'),
('Education'),
('MSME & Startup'),
('Housing & Urban'),
('Social Welfare')
ON CONFLICT (name) DO NOTHING;
