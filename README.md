<p align="center">
  <img src="https://img.shields.io/badge/Government%20of%20Gujarat-Official%20Platform-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-GOI--NIC-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Tests-21%20Passed-brightgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Python-3.14-blue?style=for-the-badge&logo=python" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Security-DPDP%20Compliant-green?style=for-the-badge" />
</p>

# ParivarSetu (પરિવાર સેતુ)
### One Family – One ID: Unified Scheme Benefit Tracking & Direct Benefit Transfer Platform
**Government of Gujarat (ગુજરાત સરકાર) | General Administration Department**

---

ParivarSetu is a state-wide e-governance platform built for the **Government of Gujarat** under the **"One Family – One ID (GJ-XXXXXXXX)"** paradigm. It eliminates welfare benefit leakage, automates cross-department entitlement discovery without manual paperwork, enforces bias-free blind adjudication, provides transparent Direct Benefit Transfer (DBT) disbursals, and equips state administrators with proactive saturation analytics.

---

## 🌐 Live Deployments

| Component | Platform | URL |
|---|---|---|
| **Backend API** | Render | `https://parivarsetu-dy5u.onrender.com` |
| **API Documentation** | Swagger UI | `https://parivarsetu-dy5u.onrender.com/docs` |
| **Alternative Docs** | ReDoc | `https://parivarsetu-dy5u.onrender.com/redoc` |
| **Database** | Supabase | Managed PostgreSQL 18 (AWS Asia-Pacific Mumbai) |
| **Frontend Portal** | Vercel | Production React SPA (connected via `VITE_API_URL`) |

---

## 🔐 Security Architecture & Data Privacy

ParivarSetu implements **defense-in-depth** security aligned with the **Digital Personal Data Protection (DPDP) Act 2023** and Government of India cybersecurity standards:

### 1. Robust Authentication & Password Hashing
- **Bcrypt Hashing**: All passwords hashed using `bcrypt` (work factor 12) with unique salts; plaintext passwords are never stored or logged.
- **Cryptographic JWT Tokens**: Stateless JSON Web Tokens (`HS256`) carrying tamper-proof identity claims (`sub`, `user_id`, `role`, `dept_id`, `family_id`) and automated expiration timeouts.

### 2. Strict Role-Based Access Control (RBAC)
- Four strictly delineated roles: `citizen`, `officer`, `verifier`, and `admin`.
- Enforced at API router level via FastAPI dependency factories: `require_citizen`, `require_officer`, `require_verifier`, and `require_roles`.
- Unauthenticated or unauthorized attempts immediately return `401 Unauthorized` or `403 Forbidden`.

### 3. Cryptographic Department Isolation
- Department officers are **strictly restricted** to schemes and applications within their own administrative department.
- The `dept_id` is extracted server-side directly from the verified JWT token claims—**never** from client parameters or query strings.
- Cross-department operations automatically trigger immediate HTTP `403 Forbidden` exceptions.

### 4. Anti-IDOR (Insecure Direct Object Reference) Protection
- Citizens can access and modify **only** their own household details, applications, and grievances.
- The backend verifies that the requested `family_id` matches the authenticated user's token claim prior to executing queries.

### 5. Sensitive PII & Financial Identifier Masking
- **Aadhaar Numbers**: Stored and transmitted using statutory masking (`XXXX-XXXX-1234`). Full 12-digit Aadhaar numbers are never exposed in APIs or the UI.
- **Bank Account Numbers**: Automatically masked as `****4321` across all endpoints to prevent financial data harvesting.

### 6. Blind Adjudication (Anti-Bias De-Identification)
- When department officers inspect incoming scheme applications, all personally identifiable information (head name, member names, account holder names) is dynamically stripped server-side.
- Officers review applications based purely on objective qualification criteria (income, social category, health tags, district, education) under reference codes like `Applicant Household (GJ12345678)`.
- Eliminates cognitive bias, caste/religion discrimination, and nepotism during welfare evaluations.

### 7. OWASP Hardened HTTP Middleware
Production middleware automatically injects security headers on every response:
- `X-Content-Type-Options: nosniff` (prevents MIME-type sniffing)
- `X-Frame-Options: DENY` (prevents clickjacking attacks)
- `X-XSS-Protection: 1; mode=block` (mitigates cross-site scripting)
- `Referrer-Policy: strict-origin-when-cross-origin`

### 8. Relational Data Integrity & Anti-Duplicate Guards
- PostgreSQL composite unique constraints prevent duplicate submissions:
  - `(family_id, member_id, scheme_id)` prevents multi-dipping into the same scheme.
  - `(family_id, scheme_id)` on notifications prevents redundant alerts.
- Database cascade rules ensure orphaned records are cleanly removed upon entity lifecycle events.

---

## 🔍 Transparency & Citizen Accountability

ParivarSetu guarantees full visibility and institutional accountability across every stage of the welfare lifecycle:

### 1. 5-Stage Visual Application Pipeline
Citizens can track their scheme benefit applications in real-time through an intuitive, 5-stage progress tracker:
```
[ Applied ] ──▶ [ Under Review ] ──▶ [ Approved ] ──▶ [ Disbursed ] ──▶ [ Completed ]
                                 └──▶ [ Rejected ]
```
Every transition requires verified administrative action and is reflected instantly in the citizen portal.

### 2. Traceable Direct Benefit Transfer (DBT)
- Every fund disbursal requires mandatory approval remarks and an authorized disbursal amount within statutory scheme limits.
- The platform generates a unique, immutable transaction tracking reference: `DBT-GJ-XXXXX`.
- Disbursal references are linked directly to the application record and visible to both the citizen and oversight authorities.

### 3. Immutable Audit Trail Ledger
- Every state change (`approve_application`, `reject`, `disburse`, `verify_family`) is recorded in the immutable `audit_logs` database table.
- Log entries capture:
  - `user_id` (who performed the action)
  - `action` (statutory event)
  - `entity` & `entity_id` (application, family, or complaint)
  - `timestamp` (UTC datetime)
- Ensures non-repudiation and provides an auditable forensic record for vigilance inquiries.

### 4. Citizen Grievance Redressal & Auto-Escalation SLA
- Citizens can file grievances directly against any active application with a single click.
- **Auto-Escalation**: Applications in `Applied` or `Under Review` status are automatically escalated to `Escalated` priority upon complaint submission.
- Complaints appear prominently in the reviewing officer's prioritized inbox until an official resolution remark is submitted.

### 5. Automated SLA Bottleneck Detection
- Applications pending without officer action beyond standard SLA thresholds (e.g., > 3 days) are automatically tagged as delayed bottlenecks.
- Bottlenecks are surfaced directly to state leadership via the Executive Intelligence dashboard for intervention.

---

## 🏛️ System Actors & Login Credentials

All demonstration personas share the unified password: **`Gujarat@2026`**

| Persona | Role | Department / Jurisdiction | Email Credentials | Access Scope |
|---|---|---|---|---|
| **Smt. Priya Sharma** | Citizen | Gandhinagar (BPL, Income: ₹1,20,000) | `priya.sharma@parivar.gujarat.gov.in` | Family ID: `GJ12345678` |
| **Dr. Rajesh Mehta** | Department Officer | Health & Family Welfare Department | `health.officer@gujarat.gov.in` | Health Schemes (Dept ID: 1) |
| **Shri Kirit Trivedi** | Department Officer | Education Department | `education.officer@gujarat.gov.in` | Education Schemes (Dept ID: 2) |
| **Smt. Hina Patel** | Department Officer | Industries & MSME Department | `msme.officer@gujarat.gov.in` | MSME Schemes (Dept ID: 3) |
| **Shri Ramesh Joshi** | Field Verifier | Talati-cum-Mantri, Gandhinagar | `talati.gandhinagar@gujarat.gov.in` | Field Verification Desk |
| **Shri Rajesh Kumar, IAS**| State Administrator| General Administration Department | `admin@gujarat.gov.in` | Statewide Executive Analytics |

---

## 🎯 Role-Based Portals & Capabilities

### 👤 1. Citizen Portal
- **Digital Family ID**: Unified view of household composition, socioeconomic tier, BPL status, and masked bank credentials.
- **Proactive Entitlement Discovery**: Dynamic suggestions of all government schemes for which the family qualifies.
- **1-Click Application**: Apply for any qualifying scheme without resubmitting repetitive KYC or income certificates.
- **Application Tracker**: Live 5-stage visual progress pipeline for all filed applications.
- **Grievance Redressal Desk**: Lodge complaints with automated status escalation.

### 👨‍💼 2. Department Officer Portal
- **Department-Isolated Workspace**: Strict scoping to relevant departmental schemes and incoming applications.
- **Blind Review Dossier**: Review applicant qualification facts (income, category, health, education) without personal identifying information.
- **Application Lifecycle Controls**: Transition applications through `Under Review`, `Approved`, or `Rejected` with mandatory remarks.
- **Direct Benefit Transfer (DBT)**: Execute benefit disbursals with automated `DBT-GJ-XXXXX` transaction generation.
- **Grievance Resolution Desk**: Inspect citizen complaints, submit official resolution remarks, and resolve escalated tickets.

### 🔍 3. Field Verifier Portal (Shri Ramesh Joshi, Talati)
- **Provisional Application Queue**: Review families registered at grassroots field camps or CSC centres.
- **Field Verification Desk**: Validate physical documents and approve provisional registrations into permanent Family IDs (`GJ-XXXXXXXX`).
- **Enrolled Families Directory**: Search, inspect, and audit active enrolled families across the jurisdiction.

### 🏢 4. State Administrator Portal (Executive Intelligence Centre)
*The State Administrator role is purely analytical and supervisory (no manual approvals/rejections):*
- **Executive KPI Summary**: Total registered families, total DBT funds disbursed, active pending backlog, and saturation gaps.
- **Departmental Disbursal Analysis**: Cross-department breakdown of total disbursed amounts, approved claims, and budget utilization.
- **Pending Caseload & SLA Bottlenecks**: Real-time tracking of pending applications across departments, highlighting cases exceeding SLA limits (> 3 days).
- **Proactive Saturation Gap Analysis**: Granular analysis comparing eligible families vs. actually applied families per scheme to highlight under-saturated welfare programs.
- **District Performance Heatmap**: District-wise enrollment and application saturation across Gujarat (Ahmedabad, Surat, Gandhinagar, Rajkot, etc.).

---

## 🧠 Generic Eligibility Engine (Auto Schema Matching)

Unlike legacy systems that rely on hardcoded condition checks, ParivarSetu features a **Generic Eligibility Engine** that dynamically evaluates scheme criteria defined in the database against family profile attributes:

| Scheme Rule Column | Matched Family Attribute | Operational Example |
|---|---|---|
| `max_income` | `Family.income` | Families with income $\le$ ₹2,50,000 |
| `min_income` | `Family.income` | Families meeting minimum economic criteria |
| `category` | `Family.category` | Affirmative welfare: `SC`, `ST`, `OBC`, `General`, `BPL` |
| `required_condition_tag` | `Family.health_tags[]` | Medical conditions: `cardiac`, `diabetes`, `disability`, `pregnant` |
| `required_class` | `EducationInfo.current_class`| Educational level: `10th`, `12th`, `Graduate` |
| `min_percentage` | `EducationInfo.last_percentage` | Merit scholarships: Academic score $\ge 60\%$ |
| `business_category` | `BusinessInfo.business_type` | Enterprise aid: `startup`, `MSME`, `small_business` |
| `min_business_age` | `BusinessInfo.business_age_months`| Operating vintage: Business age $\ge 12\text{ months}$ |

### High-Performance Query Optimization
- **PostgreSQL GIN (Generalized Inverted Index)**: Applied to PostgreSQL `ARRAY` columns (`health_tags`, `education_tags`, `business_tags`) for $O(1)$ multi-tag matching across tens of thousands of households.
- **Zero-Code Scheme Expansion**: Department administrators can launch new welfare schemes simply by inserting a database row; the engine automatically identifies all eligible families statewide.

---

## ⚖️ Key Differentiators: Legacy Welfare vs. ParivarSetu

| Evaluation Dimension | Legacy Government Systems | ParivarSetu Platform |
|---|---|---|
| **Eligibility Verification** | Physical document submission per scheme | **Automated Schema Matching** via unified Family ID |
| **Officer Adjudication** | Subjective, vulnerable to identity bias | **Blind Review Policy** stripping identifying applicant PII |
| **Department Security** | Co-mingled tables or siloed databases | **Cryptographic Isolation** via signed JWT token claims |
| **Administrative Oversight** | Static quarterly reports | **Real-Time Executive Intelligence** with saturation gap analytics |
| **Disbursal Tracking** | Opaque payment cycles | **5-Stage Visual Tracker** + verifiable `DBT-GJ-XXXXX` references |
| **Citizen Recourse** | Manual physical grievance letters | **Built-in Redressal** with automatic application SLA escalation |
| **Audit Compliance** | Minimal log retention | **Immutable Audit Trail** capturing every statutory state change |

---

## 🧪 Automated Test Suite

The platform includes 21 comprehensive tests covering authorization, business logic, security guards, and analytics:

```bash
cd backend
python -m pytest tests/ -v
```

| Test Suite | Scope Covered |
|---|---|
| `tests/test_phase1.py` | Authentication, token issuance, RBAC isolation, mock identity registry |
| `tests/test_phase2.py` | Scheme CRUD, generic eligibility engine matching, 5-stage state transitions, DBT disbursals |
| `tests/test_phase3.py` | Grievance lifecycle, auto-escalation, delayed application bottleneck detection, analytics |
| `tests/test_phase5.py` | OWASP security headers, Aadhaar & Bank PII masking, anti-IDOR checks, verifier permissions |

---

## 💻 Technology Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: FastAPI, SQLAlchemy ORM, Pydantic v2, Python 3.14
- **Database**: PostgreSQL 18 with GIN array indexing on multi-valued tags
- **Authentication**: `python-jose` (cryptographic JWT), `bcrypt` (password hashing)
- **UI Standard**: Government of Gujarat official sharp-edge design standard (`rounded-none`, NIC portal palette)

---

<p align="center">
  <strong>🏛️ ParivarSetu — One Family, One ID, One Platform</strong><br/>
  <em>Government of Gujarat (ગુજરાત સરકાર) | General Administration Department</em>
</p>
