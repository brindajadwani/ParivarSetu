# ParivarSetu (परिवार सेतु)
### One Family – One ID: Scheme Benefit Tracking System
**Government of Uttar Pradesh**

ParivarSetu is an integrated governance platform designed to streamline citizen scheme eligibility, verification, application tracking, disbursal, and grievance redressal under the "One Family – One ID" initiative.

---

## Architecture Overview

- **Frontend:** React (Vite) + Tailwind CSS + Lucide Icons + Recharts
- **Backend:** FastAPI (Python) + SQLAlchemy ORM + Pydantic v2
- **Database:** PostgreSQL with GIN indexes on array tags and relational integrity constraints
- **Core Engine:** Generic data-driven Eligibility Engine serving all government departments (Health, Education, MSME/Business, Housing, etc.) without code modifications.

---

## System Actors

1. **Citizen (Parivar):**
   - Registers family and members
   - Receives automatic notifications of eligible welfare schemes
   - Applies for schemes and tracks progress through a strict state machine
   - Raises grievances and complaints

2. **Government Officer (Department-Scoped):**
   - Department-isolated dashboard
   - Queries eligible families dynamically via the generic eligibility engine
   - Broadcasts eligible notifications
   - Approves, rejects, and disburses welfare benefits with audit logging

3. **Verifier (Panchayat Secretary / Lekhpal):**
   - Verifies provisional family registrations to grant permanent Family ID status

---

## Directory Structure

```
Family_ID/
├── backend/
│   ├── app/
│   │   ├── api/routes/      # Auth, Families, Schemes, Applications, Complaints, Analytics
│   │   ├── core/            # Config, DB Session, Security (JWT & bcrypt)
│   │   ├── models/          # SQLAlchemy ORM definitions
│   │   ├── schemas/         # Pydantic request/response schemas with masking
│   │   ├── services/        # Business logic: Eligibility engine, Tag sync, State transitions
│   │   └── main.py          # FastAPI application entry point
│   ├── scripts/
│   │   ├── schema.sql       # Full PostgreSQL database schema
│   │   └── init_db.py       # Database creation and initialization script
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Header, Sidebar, Cards)
│   │   ├── pages/           # Citizen Dashboard, Officer Portal, etc.
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

## Phase 0: Setup & Foundation

- [x] Repository initialization & Git remote linkage
- [x] PostgreSQL database (`parivarsetu`) creation
- [x] Execution of complete 13-table schema with GIN & B-tree indexing
- [x] Backend architecture scaffolding with FastAPI & SQLAlchemy models
- [x] Frontend setup with UP Government Citizen Dashboard UI implementation
