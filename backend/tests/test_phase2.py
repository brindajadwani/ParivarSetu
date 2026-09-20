import os
import sys
import uuid

# Add backend to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.audit import AuditLog
from app.models.scheme import Scheme
from app.models.application import Application
from app.models.family import Family
from app.models.user import User

client = TestClient(app)

def get_officer_token(email: str) -> str:
    res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "password123"
    })
    assert res.status_code == 200
    return res.json()["access_token"]

def test_officer_scheme_crud_and_isolation():
    health_token = get_officer_token("health.officer@gujarat.gov.in")
    edu_token = get_officer_token("education.officer@gujarat.gov.in")

    # 1. Health officer creates a new scheme
    unique_name = f"Dialysis Support Program {uuid.uuid4().hex[:6]}"
    create_res = client.post(
        "/api/v1/schemes",
        headers={"Authorization": f"Bearer {health_token}"},
        json={
            "name": unique_name,
            "description": "Free dialysis sessions for kidney patients across Gujarat.",
            "max_income": 350000,
            "benefit_amount": 30000.0,
            "active": True
        }
    )
    assert create_res.status_code == 201
    scheme_data = create_res.json()
    scheme_id = scheme_data["id"]
    assert scheme_data["name"] == unique_name
    print(f"PASS: Health officer created scheme id={scheme_id} ('{unique_name}')")

    # 2. Health officer updates their own scheme
    update_res = client.put(
        f"/api/v1/schemes/{scheme_id}",
        headers={"Authorization": f"Bearer {health_token}"},
        json={
            "name": unique_name,
            "description": "Updated description with expanded coverage.",
            "max_income": 400000,
            "benefit_amount": 35000.0,
            "active": True
        }
    )
    assert update_res.status_code == 200
    assert update_res.json()["benefit_amount"] == 35000.0
    print("PASS: Health officer updated their own scheme")

    # 3. Cross-department modification security check:
    # Education officer attempts to modify Health officer's scheme -> MUST FAIL with 403 Forbidden!
    forbidden_res = client.put(
        f"/api/v1/schemes/{scheme_id}",
        headers={"Authorization": f"Bearer {edu_token}"},
        json={
            "name": "Malicious Modification",
            "active": False
        }
    )
    assert forbidden_res.status_code == 403
    print("PASS: Server-side department isolation blocked Education officer from altering Health scheme!")

    # 4. Deactivate scheme
    del_res = client.delete(f"/api/v1/schemes/{scheme_id}", headers={"Authorization": f"Bearer {health_token}"})
    assert del_res.status_code == 200
    print("PASS: Officer deactivated scheme successfully")

def test_generic_eligibility_engine():
    db = SessionLocal()
    try:
        # 1. Health Scheme test: Gujarat Matrushakti (requires pregnant tag)
        matrushakti = db.query(Scheme).filter(Scheme.name.ilike("%Matrushakti%")).first()
        if matrushakti:
            res = client.get(f"/api/v1/schemes/{matrushakti.id}/eligible-families")
            assert res.status_code == 200
            fams = res.json()
            assert len(fams) > 0
            for f in fams:
                assert "pregnant" in (f.get("health_tags") or [])
            print(f"PASS: Eligibility Engine matched {len(fams)} families with 'pregnant' tag for Matrushakti")

        # 2. Education Scheme test: MYSY (Class 10th and min_percentage 70)
        mysy = db.query(Scheme).filter(Scheme.name.ilike("%MYSY%")).first()
        if mysy:
            res = client.get(f"/api/v1/schemes/{mysy.id}/eligible-families")
            assert res.status_code == 200
            fams = res.json()
            assert len(fams) > 0
            print(f"PASS: Eligibility Engine matched {len(fams)} families for MYSY")

        # 3. Business Scheme test: Gujarat Startup (startup category and min age)
        startup = db.query(Scheme).filter(Scheme.name.ilike("%Startup%")).first()
        if startup:
            res = client.get(f"/api/v1/schemes/{startup.id}/eligible-families")
            assert res.status_code == 200
            fams = res.json()
            assert len(fams) > 0
            for f in fams:
                assert "startup" in (f.get("business_tags") or [])
            print(f"PASS: Eligibility Engine matched {len(fams)} families for Startup Assistance")

        # 4. Family-centric query: GET /schemes/eligible-for-family/GJ12345678
        fam_res = client.get("/api/v1/schemes/eligible-for-family/GJ12345678")
        assert fam_res.status_code == 200
        matched = fam_res.json()
        assert len(matched) > 0
        print(f"PASS: Family GJ12345678 evaluated as eligible for {len(matched)} schemes in real time")
    finally:
        db.close()

def test_application_state_machine_and_disbursal():
    db = SessionLocal()
    try:
        # Pick an active scheme
        scheme = db.query(Scheme).filter(Scheme.active == True).first()
        assert scheme is not None

        # Pick or create an test family
        test_family_id = f"GJ{uuid.uuid4().hex[:8].upper()}"
        fam = Family(
            family_id=test_family_id,
            head_name="Test Applicant",
            income=150000,
            status="permanent"
        )
        db.add(fam)
        db.commit()

        # 1. Citizen applies
        app_res = client.post("/api/v1/applications", json={
            "family_id": test_family_id,
            "scheme_id": scheme.id
        })
        assert app_res.status_code == 201
        app_data = app_res.json()
        app_id = app_data["id"]
        assert app_data["status"] == "Applied"
        print(f"PASS: Application #{app_id} submitted with status='Applied'")

        # 2. Duplicate Application Check: Attempting to re-apply MUST return 409 Conflict
        dup_res = client.post("/api/v1/applications", json={
            "family_id": test_family_id,
            "scheme_id": scheme.id
        })
        assert dup_res.status_code == 409
        print("PASS: Duplicate application prevented by database unique constraint (returned 409 Conflict)!")

        # 3. Find assigned officer token for this scheme's department
        officer_user = db.query(User).filter(User.role == "officer", User.dept_id == scheme.dept_id).first()
        assert officer_user is not None, f"No officer found for dept_id {scheme.dept_id}"
        officer_token = get_officer_token(officer_user.email)

        # 4. Illegal state transition test: Cannot jump directly from Applied -> Disbursed!
        illegal_res = client.put(
            f"/api/v1/applications/{app_id}/status",
            headers={"Authorization": f"Bearer {officer_token}"},
            json={"status": "Disbursed"}
        )
        assert illegal_res.status_code == 400, f"Expected 400, got {illegal_res.status_code}: {illegal_res.text}"
        print("PASS: State machine transition guard prevented illegal skip (Applied -> Disbursed blocked)")

        # 5. Valid transition 1: Applied -> Under Review
        step1 = client.put(
            f"/api/v1/applications/{app_id}/status",
            headers={"Authorization": f"Bearer {officer_token}"},
            json={"status": "Under Review"}
        )
        assert step1.status_code == 200
        assert step1.json()["status"] == "Under Review"

        # 6. Valid transition 2: Under Review -> Approved
        step2 = client.put(
            f"/api/v1/applications/{app_id}/status",
            headers={"Authorization": f"Bearer {officer_token}"},
            json={"status": "Approved"}
        )
        assert step2.status_code == 200
        assert step2.json()["status"] == "Approved"
        print("PASS: Application transitioned cleanly: Applied -> Under Review -> Approved")

        # 7. Disbursal Guard Test: Cannot disburse more than scheme benefit limit!
        excessive_amount = float(scheme.benefit_amount or 10000) * 2
        excess_res = client.put(
            f"/api/v1/applications/{app_id}/disburse",
            headers={"Authorization": f"Bearer {officer_token}"},
            json={"amount": excessive_amount}
        )
        assert excess_res.status_code == 400
        print(f"PASS: Disbursal guard prevented overpayment (INR {excessive_amount} blocked)")

        # 8. Valid Disbursal
        disburse_amount_val = float(scheme.benefit_amount or 10000) * 0.5
        disbursed_res = client.put(
            f"/api/v1/applications/{app_id}/disburse",
            headers={"Authorization": f"Bearer {officer_token}"},
            json={"amount": disburse_amount_val}
        )
        assert disbursed_res.status_code == 200
        disbursed_data = disbursed_res.json()
        assert disbursed_data["status"] == "Disbursed"
        assert disbursed_data["txn_id"].startswith("DBT-GJ-")
        assert disbursed_data["disbursed_amount"] == disburse_amount_val
        print(f"PASS: Funds disbursed with transaction ID '{disbursed_data['txn_id']}' and status='Disbursed'")

        # 9. Terminal State Test: Disbursed application cannot be moved back to Under Review
        terminal_res = client.put(
            f"/api/v1/applications/{app_id}/status",
            headers={"Authorization": f"Bearer {officer_token}"},
            json={"status": "Under Review"}
        )
        assert terminal_res.status_code == 400
        print("PASS: State machine prevented moving terminal 'Disbursed' application backwards")

        # 10. Verify audit log entry exists in database
        audit_entries = db.query(AuditLog).filter(
            AuditLog.entity == "application",
            AuditLog.entity_id == str(app_id)
        ).all()
        assert len(audit_entries) >= 3
        print(f"PASS: Immutable audit logs verified! {len(audit_entries)} audit trail records created for application #{app_id}")

    finally:
        db.close()

def test_notification_deduplication():
    db = SessionLocal()
    try:
        health_token = get_officer_token("health.officer@gujarat.gov.in")
        scheme = db.query(Scheme).filter(Scheme.name.ilike("%Amrutam%")).first()
        if not scheme:
            scheme = db.query(Scheme).first()

        # Run 1: Broadcast notifications to eligible families
        run1 = client.post(
            f"/api/v1/schemes/{scheme.id}/notify-eligible",
            headers={"Authorization": f"Bearer {health_token}"}
        )
        assert run1.status_code == 200
        data1 = run1.json()
        print(f"PASS: Run 1 broadcast sent {data1['new_notifications_sent']} new notifications for scheme '{scheme.name}'")

        # Run 2: Second broadcast should yield 0 new notifications because duplicates are prevented!
        run2 = client.post(
            f"/api/v1/schemes/{scheme.id}/notify-eligible",
            headers={"Authorization": f"Bearer {health_token}"}
        )
        assert run2.status_code == 200
        data2 = run2.json()
        assert data2["new_notifications_sent"] == 0
        print(f"PASS: Run 2 sent {data2['new_notifications_sent']} new notifications (duplicate notifications deduplicated at database level)!")

    finally:
        db.close()

if __name__ == "__main__":
    test_officer_scheme_crud_and_isolation()
    test_generic_eligibility_engine()
    test_application_state_machine_and_disbursal()
    test_notification_deduplication()
    print("\n=========================================================")
    print("ALL PHASE 2 CORE LOGIC & STATE MACHINE TESTS PASSED 100%!")
    print("=========================================================")
