import os
import sys
import uuid
from datetime import datetime, timedelta

# Add backend to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.audit import AuditLog
from app.models.scheme import Scheme
from app.models.application import Application
from app.models.complaint import Complaint
from app.models.family import Family
from app.models.user import User
from app.services.workflow import flag_delayed_applications

client = TestClient(app)

def get_token(email: str) -> str:
    res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "password123"
    })
    assert res.status_code == 200
    return res.json()["access_token"]

def test_complaints_lifecycle_and_auto_escalation():
    db = SessionLocal()
    try:
        # Find health officer and their department's scheme
        health_officer = db.query(User).filter(User.email == "health.officer@gujarat.gov.in").first()
        assert health_officer is not None
        health_scheme = db.query(Scheme).filter(Scheme.dept_id == health_officer.dept_id, Scheme.active == True).first()
        assert health_scheme is not None, f"No active scheme found for health dept {health_officer.dept_id}"

        # Create a test family and application in 'Applied' status
        test_fid = f"GJ{uuid.uuid4().hex[:8].upper()}"
        fam = Family(family_id=test_fid, head_name="Grievance Test Citizen", income=160000, status="permanent")
        db.add(fam)
        db.commit()

        app = Application(
            family_id=test_fid,
            scheme_id=health_scheme.id,
            status="Applied",
            applied_on=datetime.utcnow() - timedelta(days=5),
            updated_at=datetime.utcnow() - timedelta(days=5)
        )
        db.add(app)
        db.commit()
        db.refresh(app)
        app_id = app.id
        print(f"PASS: Created test application #{app_id} in 'Applied' status")

        # 1. Citizen raises complaint regarding application delay
        comp_res = client.post("/api/v1/complaints", json={
            "application_id": app_id,
            "message": "My application has been pending for over 5 days without any review."
        })
        assert comp_res.status_code == 201
        comp_data = comp_res.json()
        comp_id = comp_data["id"]
        assert comp_data["status"] == "Open"
        print(f"PASS: Complaint #{comp_id} created in 'Open' status")

        # 2. Verify automatic status escalation of application
        db.refresh(app)
        assert app.status == "Escalated"
        print(f"PASS: Application #{app_id} automatically transitioned to 'Escalated' status via complaint!")

        # 3. Department isolation on complaints list
        health_token = get_token("health.officer@gujarat.gov.in")
        edu_token = get_token("education.officer@gujarat.gov.in")

        health_list = client.get("/api/v1/complaints", headers={"Authorization": f"Bearer {health_token}"}).json()
        assert any(c["id"] == comp_id for c in health_list)
        print(f"PASS: Health officer sees complaint #{comp_id} in their department inbox")

        # 4. Cross-department resolution block: Education officer attempting to resolve Health complaint
        forbidden_res = client.put(
            f"/api/v1/complaints/{comp_id}/resolve",
            headers={"Authorization": f"Bearer {edu_token}"},
            json={"officer_response": "Unauthorized resolution attempt"}
        )
        assert forbidden_res.status_code == 403
        print("PASS: Education officer blocked from resolving Health complaint (returned 403 Forbidden)")

        # 5. Health officer resolves the complaint
        resolve_res = client.put(
            f"/api/v1/complaints/{comp_id}/resolve",
            headers={"Authorization": f"Bearer {health_token}"},
            json={"officer_response": "Your medical documents have been verified and expedited."}
        )
        assert resolve_res.status_code == 200
        resolved_data = resolve_res.json()
        assert resolved_data["status"] == "Resolved"
        assert resolved_data["officer_response"] is not None

        # 6. Verify application status un-escalated back to 'Under Review'
        db.refresh(app)
        assert app.status == "Under Review"
        print("PASS: Application returned to 'Under Review' upon complaint resolution")

        # 7. Verify audit log entry
        audit_entry = db.query(AuditLog).filter(
            AuditLog.entity == "complaint",
            AuditLog.entity_id == str(comp_id)
        ).first()
        assert audit_entry is not None
        print(f"PASS: Audit log verified for complaint resolution by officer (action='{audit_entry.action}')")

    finally:
        db.close()

def test_delayed_applications_detection():
    db = SessionLocal()
    try:
        # Check delayed applications
        delayed = flag_delayed_applications(db, days=3)
        print(f"PASS: flag_delayed_applications detected {len(delayed)} applications stuck for > 3 days")

        # Test endpoint
        res = client.get("/api/v1/analytics/delayed-applications?days=3")
        assert res.status_code == 200
        delayed_list = res.json()
        assert isinstance(delayed_list, list)
        print(f"PASS: /analytics/delayed-applications endpoint returned {len(delayed_list)} overdue applications")
    finally:
        db.close()

def test_analytics_summary_endpoint():
    # 1. Statewide summary (unfiltered)
    res = client.get("/api/v1/analytics/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_families" in data
    assert "applications_by_status" in data
    assert "total_disbursed_amount" in data
    assert "delayed_applications" in data
    assert data["total_families"] >= 25
    print(f"PASS: Statewide Analytics Summary: {data['total_families']} families, INR {data['total_disbursed_amount']:,.2f} disbursed")

    # 2. Department-scoped summary for Health Officer
    health_token = get_token("health.officer@gujarat.gov.in")
    h_res = client.get("/api/v1/analytics/summary", headers={"Authorization": f"Bearer {health_token}"})
    assert h_res.status_code == 200
    h_data = h_res.json()
    assert h_data["dept_id"] is not None
    assert "Health" in h_data["department_name"]
    print(f"PASS: Department-Scoped Analytics for '{h_data['department_name']}': {h_data['applications_by_status']['Approved']} approved applications")

def test_analytics_by_scheme():
    res = client.get("/api/v1/analytics/by-scheme")
    assert res.status_code == 200
    schemes_data = res.json()
    assert len(schemes_data) > 0
    for s in schemes_data:
        assert "scheme_id" in s
        assert "scheme_name" in s
        assert "eligible_count" in s
        assert "applied_count" in s
        assert "disbursed_count" in s
    print(f"PASS: /analytics/by-scheme returned funnel metrics for {len(schemes_data)} schemes")

def test_analytics_by_district():
    res = client.get("/api/v1/analytics/by-district")
    assert res.status_code == 200
    districts = res.json()
    assert len(districts) > 0
    # Must contain key Gujarat districts
    district_names = [d["district"] for d in districts]
    print(f"PASS: /analytics/by-district aggregated data across {len(districts)} districts: {district_names[:5]}...")
    assert "Ahmedabad" in district_names or "Gandhinagar" in district_names

if __name__ == "__main__":
    test_complaints_lifecycle_and_auto_escalation()
    test_delayed_applications_detection()
    test_analytics_summary_endpoint()
    test_analytics_by_scheme()
    test_analytics_by_district()
    print("\n=========================================================")
    print("ALL PHASE 3 COMPLAINTS & ANALYTICS TESTS PASSED 100%!")
    print("=========================================================")
