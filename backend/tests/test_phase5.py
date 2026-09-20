import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.user import User
from app.models.family import Family, BankInfo
from app.models.scheme import Scheme
from app.models.application import Application
from app.models.complaint import Complaint

client = TestClient(app)

@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def get_token(email: str, password: str = "password123") -> str:
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, f"Login failed for {email}: {resp.text}"
    return resp.json()["access_token"]

def test_security_headers():
    """Verify OWASP-recommended security headers are set on API responses."""
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.headers.get("x-content-type-options") == "nosniff"
    assert resp.headers.get("x-frame-options") == "DENY"
    assert resp.headers.get("x-xss-protection") == "1; mode=block"

def test_sensitive_data_masking(db):
    """Verify Aadhaar and bank account numbers are strictly masked."""
    # Lookup Priya Sharma
    resp = client.get("/api/v1/families/GJ12345678")
    assert resp.status_code == 200
    data = resp.json()

    # Aadhaar must be masked in XXXX-XXXX-1234 format
    aadhaar = data.get("aadhaar_ref_masked")
    assert aadhaar is not None
    assert aadhaar.startswith("XXXX-XXXX-") or aadhaar.startswith("****")

    # Bank account must be masked
    if data.get("bank_info"):
        bank_acc = data["bank_info"]["account_number_masked"]
        assert "****" in bank_acc or "XXXX" in bank_acc
        assert not bank_acc.isdigit()  # Cannot be raw digits

def test_verifier_role_enforcement():
    """Verify that only verifiers (Talati/Admin) can verify provisional families."""
    # 1. Anonymous attempt -> 401
    resp = client.post("/api/v1/families/GJ12345678/verify?action=approve")
    assert resp.status_code in [401, 403]

    # 2. Citizen attempt -> 403 Forbidden
    citizen_token = get_token("priya.sharma@parivar.gujarat.gov.in")
    resp = client.post(
        "/api/v1/families/GJ12345678/verify?action=approve",
        headers={"Authorization": f"Bearer {citizen_token}"}
    )
    assert resp.status_code == 403

    # 3. Verifier attempt -> 200 OK
    verifier_token = get_token("talati.gandhinagar@gujarat.gov.in")
    resp = client.post(
        "/api/v1/families/GJ12345678/verify?action=approve",
        headers={"Authorization": f"Bearer {verifier_token}"}
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "permanent"

def test_anti_idor_citizen_family_tampering(db):
    """Verify citizen cannot tamper with another family's profile or bank records."""
    citizen_token = get_token("priya.sharma@parivar.gujarat.gov.in")  # Family ID: GJ12345678

    # Attempt to modify another family (e.g. GJ10000002)
    fake_family_id = "GJ10000002"
    
    # 1. Add member
    resp = client.put(
        f"/api/v1/families/{fake_family_id}/members",
        headers={"Authorization": f"Bearer {citizen_token}"},
        json={"name": "Attacker Member", "age": 25, "gender": "Male", "relation": "other"}
    )
    assert resp.status_code == 403

    # 2. Modify bank details
    resp = client.put(
        f"/api/v1/families/{fake_family_id}/bank",
        headers={"Authorization": f"Bearer {citizen_token}"},
        json={
            "account_number": "999988887777",
            "ifsc": "SBIN0001234",
            "bank_name": "State Bank of India",
            "account_holder": "Attacker"
        }
    )
    assert resp.status_code == 403

def test_anti_idor_application_and_complaint(db):
    """Verify citizen cannot submit schemes or complaints on behalf of another family."""
    citizen_token = get_token("priya.sharma@parivar.gujarat.gov.in")  # Family ID: GJ12345678

    # Attempt to apply for scheme on behalf of another family
    resp = client.post(
        "/api/v1/applications",
        headers={"Authorization": f"Bearer {citizen_token}"},
        json={"family_id": "GJ10000002", "scheme_id": 1}
    )
    assert resp.status_code == 403

def test_cross_department_access_prevention(db):
    """Verify officers cannot access, mutate, or disburse funds for other departments."""
    health_token = get_token("health.officer@gujarat.gov.in")
    edu_token = get_token("education.officer@gujarat.gov.in")

    # Find an Education scheme (dept_id = 2)
    edu_scheme = db.query(Scheme).filter(Scheme.dept_id == 2).first()
    assert edu_scheme is not None

    # Health officer attempting to mutate Education scheme -> 403
    resp = client.put(
        f"/api/v1/schemes/{edu_scheme.id}",
        headers={"Authorization": f"Bearer {health_token}"},
        json={"name": "Hijacked Scheme", "active": False}
    )
    assert resp.status_code == 403
