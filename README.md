<p align="center">
  <img src="https://img.shields.io/badge/Government%20of%20Gujarat-Official%20Platform-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Tests-21%20Passed-brightgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Python-3.14-blue?style=for-the-badge&logo=python" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL%2018%20(Supabase)-336791?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Security-DPDP%20Compliant-green?style=for-the-badge" />
</p>

# ParivarSetu (પરિવાર સેતુ)
### Unified State Welfare & Direct Benefit Transfer (DBT) Intelligence Platform
**Government of Gujarat (ગુજરાત સરકાર) | General Administration Department**

---

## 🎯 What Problem Does ParivarSetu Solve?

In state governance, welfare delivery often faces critical structural challenges:
- **Department Silos**: Citizens must repeatedly submit physical proof to separate departments (Health, Education, MSME).
- **Benefit Leakage & Duplicate Claims**: Lack of a single household key leads to ghost beneficiaries and multi-dipping.
- **Review Bias**: Officers seeing names, caste, or background can introduce unconscious bias or favoritism into approvals.
- **The Saturation Blindspot**: Governments track who applied, but cannot see **who is eligible but never applied**.
- **Slow Multi-Criteria Queries**: Evaluating complex rules (income, health conditions, education, business age) across millions of citizens causes slow database searches.

**The Solution:** **ParivarSetu** unifies citizens under **"One Family – One ID" (`GJ-XXXXXXXX`)**, providing an end-to-end platform for automated eligibility matching, bias-free review, transparent DBT tracking, and state-level policy analytics.

---

## 🌐 Live Deployments

- **Backend API (Render)**: `https://parivarsetu-dy5u.onrender.com`
- **Interactive Swagger Docs**: `https://parivarsetu-dy5u.onrender.com/docs`
- **Alternative Docs (ReDoc)**: `https://parivarsetu-dy5u.onrender.com/redoc`
- **Database (Supabase)**: Managed PostgreSQL 18 (AWS Asia-Pacific Mumbai)
- **Frontend Portal**: Vercel Production Build

---

## 💡 Core Pillars of the Solution

### 1. 🔐 Zero-Trust Security & Data Privacy
- **Bcrypt & JWT Authentication**: Passwords hashed with bcrypt (work factor 12). Stateless JWT tokens carry tamper-proof claims (`role`, `dept_id`, `family_id`).
- **Cryptographic Department Isolation**: Officers can **only** view and action schemes in their assigned department. The `dept_id` is extracted strictly from the JWT token server-side; cross-department access is blocked (`403 Forbidden`).
- **Anti-Bias Blind Adjudication (DPDP Act 2023 Compliant)**: Review officers see **only qualification facts** (income, category, health, education). Personal identifiers are stripped server-side:
  - Head Name $\rightarrow$ `Applicant Household (GJ12345678)`
  - Member Names $\rightarrow$ `Member #1 (Head)`, `Member #2 (Spouse)`
  - Account Holder $\rightarrow$ `Beneficiary #GJ12345678`
- **Anti-IDOR Protection**: Citizens can only view/modify their own family data, verified against their session token.
- **Mandatory PII Masking**: Aadhaar numbers masked as `XXXX-XXXX-1234`; Bank accounts masked as `****4321`.
- **OWASP Headers**: Built-in middleware enforces `nosniff`, `DENY` for frames, XSS protection, and strict referrer policy.

---

### 2. 🔍 Transparency & Citizen Empowerment
- **5-Stage Live Application Tracking**: Citizens visually monitor progress in real-time:
  ```
  Applied  ──▶  Under Review  ──▶  Approved  ──▶  Disbursed  ──▶  Completed
                                └──▶  Rejected
  ```
- **Verifiable DBT Traceability**: Every fund transfer generates an immutable tracking reference (`DBT-GJ-XXXXX`) logged in the database.
- **Immutable Audit Trail (`audit_logs`)**: Records every state change with `user_id`, `action`, `entity`, and `timestamp` for non-repudiation and audits.
- **Grievance Redressal with Auto-Escalation**: Filing a complaint on an active application automatically escalates its priority to `Escalated` in the reviewing officer's queue.

---

### 3. ⚡ High-Speed Database Retrieval via Indexing
Evaluating eligibility across multiple attributes (income, caste, medical conditions, academic merit, business vintage) across millions of records requires specialized indexing:

- **PostgreSQL GIN (Generalized Inverted Index)**:
  - Applied to array columns: `health_tags`, `education_tags`, `business_tags`.
  - Instead of slow full table scans ($O(N)$), GIN allows instant $O(1)$ set containment lookups:
    ```sql
    SELECT * FROM families WHERE health_tags @> ARRAY['cardiac'];
    ```
- **Composite Unique Constraints**:
  - `(family_id, member_id, scheme_id)` on applications prevents duplicate claims and double-dipping.
  - `(family_id, scheme_id)` on notifications prevents alert spam.
- **Cascade Deletion Integrity**: Cascading foreign keys ensure dependent health, education, and member records are cleanly maintained without orphans.
- **Generic Eligibility Engine**: Rules are stored in database columns. Launching a new welfare scheme requires only adding a database row—**zero code changes needed**.

---

### 4. 📊 Executive Intelligence & Policy Analytics
Designed specifically for the **State Administrator**, shifting focus from form approvals to macro-level intelligence:

- **Executive Summary**: Real-time totals of enrolled families (Provisional vs. Permanent), total funds disbursed, pending caseload, and active SLA breaches.
- **Department-Wise Disbursals**: Breakdown of funds disbursed, claims approved, and budget utilization per department.
- **Proactive Saturation Gap Analysis**: Identifies **Eligible vs. Actually Applied** families per scheme:
  $$\text{Saturation Gap \%} = \left( 1 - \frac{\text{Families Applied}}{\text{Families Eligible}} \right) \times 100$$
  Reveals underserved populations who qualify but haven't applied, enabling targeted welfare drives.
- **District Saturation Performance**: District-wise performance across Gujarat (Ahmedabad, Surat, Gandhinagar, Rajkot, etc.).
- **SLA Bottleneck Detection**: Automatically flags applications stalled > 3 business days without officer action.

---

## 👥 Demo Personas & Login Credentials

All test accounts use the password: **`Gujarat@2026`**

| Persona | Role | Department / Scope | Login Email |
|---|---|---|---|
| **Smt. Priya Sharma** | Citizen | Gandhinagar (BPL, ₹1,20,000) | `priya.sharma@parivar.gujarat.gov.in` |
| **Dr. Rajesh Mehta** | Department Officer | Health & Family Welfare | `health.officer@gujarat.gov.in` |
| **Shri Kirit Trivedi** | Department Officer | Education Department | `education.officer@gujarat.gov.in` |
| **Smt. Hina Patel** | Department Officer | Industries & MSME | `msme.officer@gujarat.gov.in` |
| **Shri Ramesh Joshi** | Field Verifier | Talati-cum-Mantri, Gandhinagar | `talati.gandhinagar@gujarat.gov.in` |
| **Shri Rajesh Kumar, IAS** | State Administrator | General Administration (Analytics) | `admin@gujarat.gov.in` |

---

## 💻 Tech Stack & Test Suite

- **Frontend**: React 19, Vite 8, Tailwind CSS, Lucide Icons, Recharts (NIC design: sharp edges, `rounded-none`)
- **Backend**: FastAPI, SQLAlchemy ORM, Pydantic v2, Python 3.14
- **Database**: PostgreSQL 18 with GIN Array Indexing (Supabase)
- **Security**: python-jose (JWT), bcrypt

### Automated Tests
Run the 21 automated regression and security tests:
```bash
cd backend
python -m pytest tests/ -v
```

---

<p align="center">
  <strong>🏛️ ParivarSetu — One Family, One ID, One Unified Platform</strong><br/>
  <em>Government of Gujarat (ગુજરાત સરકાર) | General Administration Department</em>
</p>
