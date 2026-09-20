# ParivarSetu (પરિવાર સેતુ)
### One Family – One ID: Scheme Benefit Tracking System
**Government of Gujarat (ગુજરાત સરકાર)**

ParivarSetu is an integrated, state-wide e-governance platform designed for the **Government of Gujarat (ગુજરાત સરકાર)** to eliminate welfare benefit leakage, unify citizen eligibility across departments, and enforce transparent, auditable Direct Benefit Transfer (DBT) disbursals and grievance redressal under the **"One Family – One ID" (GJ-XXXXXXXX)** paradigm.

---

## 🏛️ System Actors & Demo Personas

All personas share the default password: `password123`

| Persona | Role | Department / Jurisdiction | Email Credentials | Family ID |
|---|---|---|---|---|
| **Smt. Priya Sharma** | Citizen | Gandhinagar (BPL, Income: ₹1,20,000) | `priya.sharma@parivar.gujarat.gov.in` | `GJ12345678` |
| **Dr. Rajesh Mehta** | Department Officer | Health & Family Welfare Department | `health.officer@gujarat.gov.in` | N/A (Dept ID: 1) |
| **Shri Kirit Trivedi** | Department Officer | Education Department | `education.officer@gujarat.gov.in` | N/A (Dept ID: 2) |
| **Smt. Hina Patel** | Department Officer | Industries & MSME Department | `msme.officer@gujarat.gov.in` | N/A (Dept ID: 3) |
| **Shri Ramesh Joshi** | Field Verifier | Talati-cum-Mantri, Gandhinagar | `talati.gandhinagar@gujarat.gov.in` | N/A |
| **State Administrator** | State Admin | General Administration Dept | `admin@gujarat.gov.in` | N/A |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (Tested on Python 3.14)
- **Node.js 18+** & npm
- **PostgreSQL 14+** (Default db: `parivarsetu` on port `5432`)

### 1. Database Initialization
```bash
# In PostgreSQL, ensure database 'parivarsetu' exists:
CREATE DATABASE parivarsetu;

# Seed initial Gujarat dataset (29+ families, 18 schemes, users, audit logs):
cd backend
python scripts/init_db.py
```

### 2. Start Backend API
```bash
# Option A: Windows launcher
start-backend.bat

# Option B: Manual CLI
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
Backend API will be live at: `http://localhost:8000` (Swagger docs: `http://localhost:8000/docs`)

### 3. Start Frontend Portal
```bash
# Option A: Windows launcher
start-frontend.bat

# Option B: Manual CLI
cd frontend
npm install
npm run dev
```
Open portal at: `http://localhost:5173`

---

## 🎯 7-Step Live Demonstration Script & Pitch

Follow this exact walkthrough during evaluations or pitch presentations:

### Step 1: Citizen View & Entitlement Discovery (Priya Sharma)
1. In the top bar persona switcher, select **"Citizen: Smt. Priya Sharma"**.
2. Notice the official Gujarat Government sharp-edge portal layout (`rounded-none`), digital **Parivar ID (`GJ12345678`)**, BPL status, income badge (₹1,20,000), verified family members, and masked SBI bank account.
3. Open **"Notifications"** — the dynamic Eligibility Engine has already pre-calculated her family's eligibility for Gujarat schemes like **Mukhyamantri Amrutam (MA Yojana)** and **Mukhyamantri Yuva Swavalamban (MYSY)** without manual paperwork.

### Step 2: Instant 1-Click Scheme Application
1. Click on **"Schemes Catalog"** in the sidebar.
2. Filter or search for **"Mukhyamantri Amrutam (MA Yojana)"**. Notice the green **"Eligible"** badge.
3. Click **"Apply Now"** -> Application is instantly created in the `Applied` state, bound to the family's verified record.

### Step 3: Server-Side Department Isolation (Dr. Rajesh Mehta)
1. In the top header switcher, switch role to **"Health Officer: Dr. Rajesh Mehta"**.
2. **Key Security Pitch:** Notice the officer dashboard automatically restricts visibility strictly to **Health & Family Welfare** schemes. Education and MSME data are completely invisible.
3. Click **"View Eligible Families"** drawer — shows real-time algorithmic matching of Gujarat families qualifying for health aid.

### Step 4: Application Review & State Machine Lifecycle
1. In the **Applications Review** desk, find Priya Sharma's new application.
2. Click **"Review Application"** -> The status transitions to `Under Review`.
3. Click **"Approve"** with remark *"Verified BPL card & eligibility criteria"* -> The status transitions to `Approved`.

### Step 5: Direct Benefit Transfer (DBT) Disbursal
1. Click **"Disburse Funds"** modal on Priya's approved record.
2. Enter benefit disbursal amount: `₹50,000`.
3. Click **"Execute Disbursal"** -> State transitions to `Disbursed`.
4. An immutable **DBT Transaction Reference (`DBT-GJ-XXXXX`)** is generated in real-time, and written to the tamper-evident PostgreSQL `audit_logs` ledger.

### Step 6: Citizen Grievance & Auto-Escalation
1. Switch persona back to **Citizen: Smt. Priya Sharma**.
2. Navigate to **"Application Tracker"** -> view the visual 5-stage progress pipeline.
3. Click **"File Grievance"** -> Submit complaint *"Disbursal SMS not received yet"*.
4. **Pitch Highlight:** The application automatically gets flagged and escalated to `Escalated` status in the officer's priority inbox.
5. Switch to **Health Officer** -> view Grievance Inbox -> Submit resolution remark *"Bank transfer re-verified, SMS sent"* -> Status seamlessly returns to `Approved`.

### Step 7: Verifier Desk & Department Analytics
1. Switch to **Verifier: Shri Ramesh Joshi (Talati)**.
2. Open **"Verifier Desk"** to review field camp provisional registrations and verify them into permanent Family IDs.
3. Switch to Officer / Admin and open **"Analytics Dashboard"**:
   - Live Application Status Funnel (`Applied` → `Under Review` → `Approved` → `Disbursed`).
   - Scheme Disbursals Distribution chart.
   - District-wise Gujarat saturation breakdown across Ahmedabad, Surat, Rajkot, Vadodara, Gandhinagar, Bhavnagar, and Kutch.

---

## 🔒 Security, Privacy & Compliance (Phase 5)

- **Sensitive Data Masking:** Aadhaar numbers are strictly stored and serialized as `XXXX-XXXX-1234`. Bank account numbers are masked (`****1234`).
- **Anti-IDOR Protection:** Citizens cannot modify another family's profile, bank info, applications, or complaints.
- **Department Boundaries:** Department IDs are extracted strictly from server-side JWT claims. Cross-department actions trigger immediate `403 Forbidden`.
- **Relational Deduplication:** PostgreSQL unique constraints and partial indexes prevent duplicate scheme applications and notifications.
- **OWASP Headers:** Production middleware applies `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and strict referrer policy.

---

## 🧪 Automated Test Suite

Run the full suite of 21 tests covering all phases:

```bash
cd backend
python -m pytest tests/ -v
```

Test coverage includes:
- `tests/test_phase1.py` - Auth, JWT claims, role-based isolation, mock PDS registry.
- `tests/test_phase2.py` - Scheme CRUD, generic eligibility engine, state machine transitions, DBT disbursals.
- `tests/test_phase3.py` - Grievance lifecycle, auto-escalation, delayed applications detection, analytics endpoints.
- `tests/test_phase5.py` - Security headers, Aadhaar/Bank masking, anti-IDOR checks, verifier permissions.

---

## 💻 Tech Stack
- **Frontend:** React 19, Vite 8, Tailwind CSS, Lucide Icons, Recharts
- **Backend:** FastAPI, SQLAlchemy ORM, Pydantic v2 (ConfigDict), Python 3.14
- **Database:** PostgreSQL 18 with GIN array indexing on tags
- **Design System:** Government of Gujarat official sharp-edge design system (`rounded-none`, NIC portal standard)
