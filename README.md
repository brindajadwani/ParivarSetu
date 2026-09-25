<p align="center">
  <img src="https://img.shields.io/badge/Government%20of%20Gujarat-Official%20Platform-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-GOI--NIC-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Tests-21%20Passed-brightgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Python-3.14-blue?style=for-the-badge&logo=python" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL%2018%20(Supabase)-336791?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Security-DPDP%20Compliant-green?style=for-the-badge" />
</p>

# ParivarSetu (પરિવાર સેતુ)
### Unified State Welfare Architecture & Direct Benefit Transfer (DBT) Intelligence Platform
**Government of Gujarat (ગુજરાત સરકાર) | General Administration Department**

---

## 🎯 Executive Summary & Problem Formulation

### The Problem: Fragmented Welfare Delivery in State Governance
Public distribution and welfare administration across state departments historically suffered from acute structural friction:
1. **Departmental Data Silos**: Health, Education, MSME, and Social Justice departments operated isolated registries, forcing citizens into repetitive physical documentation cycles.
2. **Benefit Leakage & Multi-Dipping**: Lack of a centralized household key allowed duplicate claims, ghost beneficiaries, and cross-department subsidy stacking.
3. **Cognitive & Identity Bias**: Field officers reviewing applications had visibility over applicant names, caste markers, and personal identities, introducing unconscious bias or favoritism into statutory approvals.
4. **The "Saturation Blindspot"**: Traditional systems only tracked *who applied*, offering zero visibility into *who was eligible but never applied* (the **Saturation Gap**), leaving the most vulnerable citizens excluded.
5. **Database Bottlenecks**: Multi-attribute rule evaluation across millions of records (filtering simultaneously by income brackets, dynamic medical conditions, educational milestones, and business age) caused crippling table scans and slow query execution.

### The Solution: The "One Family – One ID" Ecosystem
**ParivarSetu** was engineered as a comprehensive digital public infrastructure (DPI) resolving these challenges through four foundational pillars:
- **Radical Transparency**: 5-stage visual application tracking, cryptographic DBT reference logging, and immutable audit trails.
- **Zero-Trust Security**: Server-enforced department isolation, DPDP-compliant PII masking, anti-IDOR guards, and anti-bias **Blind Adjudication**.
- **Sub-Millisecond Data Retrieval via Advanced Indexing**: PostgreSQL Generalized Inverted Indexes (GIN) on multi-valued tags and composite constraints for $O(1)$ query evaluation.
- **Executive Intelligence & Saturation Analytics**: Macro-level analytical command center for state leadership tracking department-wise disbursals, district saturation, and proactive eligibility gaps.

---

## 🌐 Live Production Deployments

| Component | Provider / Platform | Production URL | Operational Status |
|---|---|---|---|
| **Backend API** | Render Cloud Service | `https://parivarsetu-dy5u.onrender.com` | ✅ Active & Healthy |
| **API Documentation** | Swagger UI (OpenAPI 3.1) | `https://parivarsetu-dy5u.onrender.com/docs` | ✅ Interactive Explorer |
| **Alternative Docs** | ReDoc Engine | `https://parivarsetu-dy5u.onrender.com/redoc` | ✅ Technical Specification |
| **Database Tier** | Supabase (AWS Asia-Pacific Mumbai) | Managed PostgreSQL 18 with GIN Indexing | ✅ 74 Families, 12 Schemes Seeded |
| **Frontend Portal** | Vercel Platform | Production Single Page Application | ✅ Connected via `VITE_API_URL` |

---

## 🏛️ Foundational Architectural Pillars

```
                               ┌─────────────────────────────────────────────────────────────┐
                               │                 PARIVARSETU SOLUTION ENGINE                 │
                               └──────────────────────────────┬──────────────────────────────┘
                                                              │
         ┌───────────────────────────┬────────────────────────┴───────────────────┬───────────────────────────┐
         ▼                           ▼                                            ▼                           ▼
┌───────────────────┐       ┌───────────────────┐                        ┌───────────────────┐       ┌───────────────────┐
│     PILLAR 1:     │       │     PILLAR 2:     │                        │     PILLAR 3:     │       │     PILLAR 4:     │
│    TRANSPARENCY   │       │     SECURITY      │                        │  INDEXING & SPEED │       │  DATA ANALYTICS   │
├───────────────────┤       ├───────────────────┤                        ├───────────────────┤       ├───────────────────┤
│ • 5-Stage Funnel  │       │ • Bcrypt + JWT    │                        │ • GIN Inverted Idx│       │ • Executive KPIs  │
│ • DBT Trace Ledger│       │ • RBAC Guards     │                        │ • Composite Keys  │       │ • Dept Disbursals │
│ • Immutable Logs  │       │ • Dept Isolation  │                        │ • O(1) Tag Match  │       │ • Saturation Gap  │
│ • SLA Escalation  │       │ • Blind Review    │                        │ • Cascade Integrity│      │ • District Heatmap│
│ • Public OpenAPI  │       │ • PII Masking     │                        │ • Generic Engine  │       │ • SLA Bottlenecks │
└───────────────────┘       └───────────────────┘                        └───────────────────┘       └───────────────────┘
```

---

## 🔍 Pillar 1: Radical Transparency & Citizen Empowerment

To eliminate administrative opacity and build citizen trust, ParivarSetu introduces complete end-to-end visibility:

### 1. 5-Stage Visual Application Pipeline
Citizens track their scheme applications in real-time through an explicit, auditable progression state machine:
```
[ Applied ] ──▶ [ Under Review ] ──▶ [ Approved ] ──▶ [ Disbursed ] ──▶ [ Completed ]
                                 └──▶ [ Rejected ]
```
- Every transition requires authenticated officer interaction with mandatory remarks.
- State changes trigger real-time notifications to the household portal.

### 2. Cryptographic Direct Benefit Transfer (DBT) Traceability
- Fund transfers cannot occur in a vacuum; disbursal is permitted only from an `Approved` state and within statutory benefit bounds.
- Upon execution, the system issues a cryptographically formatted transaction reference: `DBT-GJ-XXXXX`.
- The transaction identifier is irreversibly bonded to the application record and visible to both the citizen and oversight authorities.

### 3. Immutable Audit Trail Ledger (`audit_logs`)
- Every statutory state alteration (`approve_application`, `reject`, `disburse`, `verify_family`) writes to a tamper-evident audit table.
- Log entries record:
  - `user_id`: Exact authenticated identity executing the action.
  - `action`: Statutory lifecycle verb.
  - `entity` & `entity_id`: Target application, family record, or complaint.
  - `timestamp`: UTC audit timestamp.
- Guarantees non-repudiation and enables rapid forensic review during administrative vigilance audits.

### 4. Citizen Grievance Redressal & Automated SLA Escalation
- Citizens can file grievances directly against stalled applications.
- **Automated Escalation Rule**: Submitting a grievance on an application in `Applied` or `Under Review` status automatically elevates its priority to `Escalated`.
- Escalated records surface at the top of the departmental officer's priority queue and require formal resolution remarks.

---

## 🔐 Pillar 2: Defense-in-Depth Security & Zero-Trust Privacy

Aligned with the **Digital Personal Data Protection (DPDP) Act 2023** and Government of India cybersecurity mandates:

### 1. Tiered Authentication & Stateless Cryptographic Claims
- **Password Security**: Passwords hashed with `bcrypt` (work factor 12) utilizing randomized per-user salts; plaintext values never touch storage or logging pipelines.
- **Tamper-Proof JWT Tokens**: Stateless access tokens (`HS256`) carrying cryptographically signed claims (`sub`, `user_id`, `role`, `dept_id`, `family_id`) with 24-hour expiration envelopes.

### 2. Strict Role-Based Access Control (RBAC)
Four mutually exclusive operational roles enforced by FastAPI dependency injection factories:
- `require_citizen`: Confines data access to the user's bound `family_id`.
- `require_officer`: Enforces valid officer credentials and non-null `dept_id`.
- `require_verifier`: Authorizes field-level Talati verification privileges.
- `require_roles(["admin"])`: Grants high-level macro analytical capabilities.

### 3. Cryptographic Department Isolation
- Officers are strictly confined to schemes and applications within their own administrative department.
- **Server-Side Enforcement**: `dept_id` is extracted strictly from the validated JWT token payload. Query-string tampering (e.g., passing `?dept_id=2` to another department) triggers an immediate `403 Forbidden` response.

### 4. Anti-IDOR (Insecure Direct Object Reference) Protection
- Citizens cannot inspect, modify, or file actions against any other household.
- Every API endpoint cross-references the requested record's `family_id` against the authenticated token claim before invoking business logic.

### 5. Sensitive PII & Financial Masking
- **Aadhaar Privacy**: Aadhaar numbers are stored and serialized strictly in masked format: `XXXX-XXXX-1234`.
- **Financial Privacy**: Bank account numbers are serialized as `****4321`. Raw account details are shielded against screen-scraping and exfiltration.

### 6. Anti-Bias Blind Adjudication (DPDP Act Compliant)
- **The Problem**: Traditional reviewers see applicant names, surnames, and addresses, enabling unconscious caste, religious, or regional bias.
- **The Architectural Fix**: When an officer accesses an application dossier, the backend dynamically strips all personal identifiers:
  - Household Head Name $\rightarrow$ `Applicant Household (GJ12345678)`
  - Family Member Names $\rightarrow$ `Member #1 (Head)`, `Member #2 (Spouse)`
  - Bank Account Holder $\rightarrow$ `Beneficiary #GJ12345678`
- Decisions are rendered strictly upon objective qualification facts: income ceiling, category quota, health condition tags, and education milestones.

### 7. OWASP Hardened HTTP Middleware
Production responses automatically enforce standard defensive headers:
- `X-Content-Type-Options: nosniff` (mitigates MIME confusion)
- `X-Frame-Options: DENY` (neutralizes clickjacking)
- `X-XSS-Protection: 1; mode=block` (browser-side reflection defense)
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## ⚡ Pillar 3: High-Performance Database Architecture & Sub-Millisecond Retrieval

To support statewide scalability (tens of thousands of concurrent queries across millions of citizens), ParivarSetu employs a heavily optimized database schema on **PostgreSQL 18**:

### 1. The Multi-Dimensional Query Problem
Welfare eligibility evaluation requires checking combinations of:
- Numeric economic bounds (`income <= max_income`)
- Social categorizations (`category = 'BPL'`)
- Dynamic health attributes (`health_tags` contains `'cardiac'`, `'disability'`)
- Educational parameters (`current_class`, `last_percentage >= 60.0`)
- Enterprise parameters (`business_type`, `business_age_months >= 12`)

Under a standard relational schema, multi-criteria condition queries require expensive table joins and full sequential scans ($O(n)$ complexity), choking server throughput.

### 2. GIN (Generalized Inverted Index) on PostgreSQL Array Columns
ParivarSetu models multi-valued citizen attributes using PostgreSQL native `ARRAY` types:
- `families.health_tags` (`ARRAY(String)`)
- `families.education_tags` (`ARRAY(String)`)
- `families.business_tags` (`ARRAY(String)`)
- `health_info.condition_tags` (`ARRAY(String)`)

**The Indexing Advantage**:
```sql
-- Without Index: Full sequential scan checking every row: O(N)
-- With GIN Index: Direct inverted index lookup: O(1)
SELECT * FROM families WHERE health_tags @> ARRAY['cardiac'];
```
The GIN index builds an internal lookup tree mapping every distinct tag directly to its matching tuple IDs, executing condition matching in **sub-millisecond time**.

### 3. Structural Constraints & Index Strategy

| Table | Column / Target | Index / Constraint Mechanism | Performance & Integrity Impact |
|---|---|---|---|
| `families` | `family_id` | **Primary Key (B-Tree)** | $O(1)$ direct lookup for household dossiers |
| `families` | `ration_card_no` | **Unique Constraint** | Prevents duplicate household enrollment statewide |
| `families` | `health_tags` | **GIN Inverted Index** | Instant multi-tag eligibility evaluation |
| `families` | `education_tags` | **GIN Inverted Index** | Rapid scholarship qualification filtering |
| `families` | `business_tags` | **GIN Inverted Index** | High-speed enterprise subsidy discovery |
| `users` | `email` | **Unique Constraint** | High-speed authentication credential retrieval |
| `departments`| `name` | **Unique Constraint** | Guarantees departmental taxonomy consistency |
| `applications`| `(family_id, member_id, scheme_id)` | **Composite Unique Constraint** | Eliminates multi-dipping and duplicate benefit applications |
| `notifications`| `(family_id, scheme_id)` | **Composite Unique Constraint** | Prevents notification spamming for matched schemes |
| `bank_info` | `family_id` | **Unique Foreign Key** | Strict 1:1 household financial binding |
| `family_members`| `family_id` | **Foreign Key (CASCADE)** | Guaranteed referential integrity with zero orphaned member rows |

### 4. Generic Eligibility Engine (Auto Schema Matching)
Unlike rigid platforms that require code deployments for each new scheme, ParivarSetu's engine is entirely **data-driven**:
- Scheme criteria are stored as structured rule columns in the `schemes` table.
- When evaluating eligibility, the engine dynamically constructs parameterized SQLAlchemy queries matching against `Family`, `HealthInfo`, `EducationInfo`, and `BusinessInfo`.
- **Zero-Code Scalability**: Launching a new government scheme requires only inserting a new row into the `schemes` table; the engine automatically matches all qualifying families statewide without redeploying code.

---

## 📊 Pillar 4: Executive Intelligence & Deep Data Analytics

State leadership requires macro-level intelligence to direct fiscal resources, eliminate bottlenecks, and ensure equitable welfare distribution. The **State Administrator Portal** operates as an executive command center:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        EXECUTIVE INTELLIGENCE COMMAND CENTRE                           │
├───────────────────┬───────────────────┬────────────────────────┬───────────────────────┤
│  TOTAL FAMILIES   │ TOTAL DISBURSED   │   PENDING CASELOAD     │    SATURATION GAP     │
│   28 Households   │   ₹1,85,000       │      14 Claims         │   67% Undersaturated  │
└───────────────────┴───────────────────┴────────────────────────┴───────────────────────┘
```

### 1. Executive Summary KPIs
- **Family Enrollment Health**: Total households registered, differentiated by Provisional (field camp) vs. Permanent (verified) status.
- **Fiscal DBT Outflow**: Real-time aggregation of total welfare funds disbursed across the state.
- **Caseload & SLA Health**: Statewide count of pending applications and active SLA breach alerts.

### 2. Department-Wise Financial & Disbursal Breakdown
- Analyzes budget utilization and disbursal volumes across Health, Education, MSME, and Social Justice departments.
- Tracks approval ratios vs. rejection ratios per department to detect administrative disparities.

### 3. Proactive Saturation Gap Analysis
- **The Core Innovation**: Compares **Eligible Households** vs. **Actually Applied Households** per scheme:
$$\text{Saturation Gap \%} = \left( 1 - \frac{\text{Families Applied}}{\text{Families Eligible}} \right) \times 100$$
- Uncovers "silent exclusion"—programs where thousands of qualifying citizens exist in the database but have not yet submitted claims, enabling targeted awareness drives.

### 4. District Saturation Heatmap
- Aggregates household enrollments, applications, and fund disbursals across Gujarat districts (Ahmedabad, Surat, Gandhinagar, Rajkot, Vadodara, Bhavnagar, Kutch).
- Highlights regional imbalances in welfare penetration.

### 5. Delayed Bottleneck & SLA Breach Tracking
- Automatically flags applications residing in `Applied` or `Under Review` status beyond 3 business days.
- Details the specific department, officer in charge, and elapsed duration, equipping administrative leadership with actionable intervention data.

---

## 👥 System Personas & Demo Credentials

All test profiles are pre-seeded with the standardized password: **`Gujarat@2026`**

| Persona | Role Category | Administrative Scope | Login Email | Assigned Context |
|---|---|---|---|---|
| **Smt. Priya Sharma** | Citizen | Gandhinagar BPL Household | `priya.sharma@parivar.gujarat.gov.in` | Family ID: `GJ12345678` |
| **Dr. Rajesh Mehta** | Department Officer | Health & Family Welfare | `health.officer@gujarat.gov.in` | Dept ID: `1` (Isolated) |
| **Shri Kirit Trivedi** | Department Officer | Education Department | `education.officer@gujarat.gov.in` | Dept ID: `2` (Isolated) |
| **Smt. Hina Patel** | Department Officer | Industries & MSME | `msme.officer@gujarat.gov.in` | Dept ID: `3` (Isolated) |
| **Shri Ramesh Joshi** | Field Verifier | Talati-cum-Mantri | `talati.gandhinagar@gujarat.gov.in` | Grassroots Verification |
| **Shri Rajesh Kumar, IAS**| State Administrator | General Administration | `admin@gujarat.gov.in` | Statewide Analytics Center |

---

## 🎯 Role-Based Portals & Functional Matrix

| Functional Capability | Citizen | Department Officer | Field Verifier | State Administrator |
|---|:---:|:---:|:---:|:---:|
| View Digital Family ID & Masked PII | ✅ | ❌ | ✅ | ❌ |
| Proactive Scheme Discovery | ✅ | ❌ | ❌ | ❌ |
| 1-Click Scheme Application | ✅ | ❌ | ❌ | ❌ |
| 5-Stage Live Application Tracking | ✅ | ✅ | ❌ | ❌ |
| File Grievance with Auto-Escalation | ✅ | ❌ | ❌ | ❌ |
| Anti-Bias Blind Dossier Review | ❌ | ✅ | ❌ | ❌ |
| Approve / Reject Scheme Claims | ❌ | ✅ | ❌ | ❌ |
| Execute DBT Disbursal (`DBT-GJ-XXXXX`)| ❌ | ✅ | ❌ | ❌ |
| Resolve Grievances with Remarks | ❌ | ✅ | ❌ | ❌ |
| Verify Field Camp Registrations | ❌ | ❌ | ✅ | ❌ |
| Statewide Executive Analytics | ❌ | ❌ | ❌ | ✅ |
| Proactive Saturation Gap Analysis | ❌ | ❌ | ❌ | ✅ |
| District Saturation Performance | ❌ | ❌ | ❌ | ✅ |
| Delayed Bottleneck SLA Monitoring | ❌ | ❌ | ❌ | ✅ |

---

## 🧪 Automated Test & Verification Suite

The repository contains 21 automated regression and security tests executed with `pytest`:

```bash
cd backend
python -m pytest tests/ -v
```

### Test Coverage Highlights:
- **`tests/test_phase1.py`**: Authentication, token generation, claim verification, RBAC guards, and mock PDS identity lookup.
- **`tests/test_phase2.py`**: Generic eligibility query matching, 5-stage state transitions, and DBT disbursal ledger integrity.
- **`tests/test_phase3.py`**: Grievance escalation workflows, delayed bottleneck queries, and departmental analytics endpoints.
- **`tests/test_phase5.py`**: OWASP headers verification, Aadhaar/Bank PII masking, anti-IDOR isolation checks, and verifier permissions.

---

## 💻 Technology Stack

| Architecture Layer | Component | Technologies Employed |
|---|---|---|
| **Client Portal** | Frontend Single Page App | React 19, Vite 8, Tailwind CSS, Lucide Icons, Recharts |
| **API Application Tier** | High-Performance Backend | FastAPI (Asynchronous Python 3.14), Pydantic v2 (ConfigDict) |
| **Data Persistence Tier** | Relational Database | PostgreSQL 18 with GIN Array Indexing (Hosted on Supabase) |
| **Data Modeling** | Object-Relational Mapping | SQLAlchemy ORM 2.0 with connection pooling (`pool_pre_ping`) |
| **Security & Cryptography**| Authentication Layer | `python-jose` (HS256 JWT), `bcrypt` (Passlib work factor 12) |
| **Design Standard** | Design System | Government of Gujarat NIC Standard (`rounded-none`, sharp corners) |

---

## 📁 Repository Structure

```
ParivarSetu/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── auth.py             # Login, Token generation & Me endpoint
│   │   │   │   ├── families.py         # Family CRUD & Blind Review serialization
│   │   │   │   ├── schemes.py          # Dynamic Scheme catalog & Eligibility
│   │   │   │   ├── applications.py     # 5-Stage State machine & DBT disbursals
│   │   │   │   ├── complaints.py       # Grievance lifecycle & Auto-escalation
│   │   │   │   ├── analytics.py        # Officer metrics & Executive Command Centre
│   │   │   │   └── notifications.py    # Household eligibility notifications
│   │   │   └── api_router.py           # Unified V1 route registration
│   │   ├── core/
│   │   │   ├── config.py               # Pydantic BaseSettings & Environment variables
│   │   │   ├── database.py             # SQLAlchemy engine & session factory
│   │   │   └── security.py             # Bcrypt hashing, JWT handling, PII masking & RBAC
│   │   ├── models/
│   │   │   ├── user.py                 # Users & Department bindings
│   │   │   ├── family.py               # Family, FamilyMember, Health, Education, Business, Bank
│   │   │   ├── scheme.py               # Schemes & Department models
│   │   │   ├── application.py          # Application state model with composite unique key
│   │   │   ├── complaint.py            # Grievance tracking model
│   │   │   ├── notification.py         # Scheme eligibility notifications
│   │   │   └── audit.py                # Immutable audit log ledger
│   │   └── services/
│   │       ├── eligibility.py          # Generic Eligibility Engine (dynamic schema queries)
│   │       └── workflow.py             # SLA tracking & delayed bottleneck flagging
│   ├── scripts/
│   │   └── init_db.py                  # Database initialization & Gujarat seed script
│   └── tests/                          # 21 unit, integration, and security tests
├── frontend/
│   ├── src/
│   │   ├── components/layout/          # Header (Persona Switcher), Sidebar
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx         # Public portal & Role-based authentication
│   │   │   ├── CitizenDashboard.jsx    # Household profile, Scheme discovery & Tracker
│   │   │   ├── OfficerPortal.jsx       # Blind Review desk, DBT disbursals & Grievances
│   │   │   ├── VerifierPortal.jsx      # Field verification desk (Shri Ramesh Joshi)
│   │   │   └── AdminPortal.jsx         # Executive Intelligence Centre (Analytics)
│   │   └── services/
│   │       └── api.js                  # Axios/Fetch HTTP client with VITE_API_URL resolution
│   ├── vite.config.js                  # Vite bundler configuration
│   └── package.json
└── README.md
```

---

<p align="center">
  <strong>🏛️ ParivarSetu — One Family, One ID, One Unified State Platform</strong><br/>
  <em>Designed for Government of Gujarat (ગુજરાત સરકાર) | General Administration Department</em>
</p>
