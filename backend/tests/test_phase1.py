import os
import sys

# Add backend to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    print("PASS: Health endpoint ok")

def test_auth_and_me():
    # 1. Login with seeded citizen Priya Sharma
    res = client.post("/api/v1/auth/login", json={
        "email": "priya.sharma@parivar.gujarat.gov.in",
        "password": "password123"
    })
    assert res.status_code == 200
    token_data = res.json()
    assert "access_token" in token_data
    assert token_data["role"] == "citizen"
    assert token_data["family_id"] == "GJ12345678"
    print("PASS: Citizen login ok, JWT contains role='citizen', family_id='GJ12345678'")

    token = token_data["access_token"]
    # 2. Call /auth/me with Bearer token
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == "priya.sharma@parivar.gujarat.gov.in"
    assert me_data["role"] == "citizen"
    assert me_data["family_id"] == "GJ12345678"
    print("PASS: /auth/me authenticated profile returns claims")

def test_officer_login_and_dept_isolation():
    # Login as Health Officer
    res = client.post("/api/v1/auth/login", json={
        "email": "health.officer@gujarat.gov.in",
        "password": "password123"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "officer"
    assert data["dept_id"] is not None
    print(f"PASS: Health officer logged in with dept_id={data['dept_id']} ({data['department_name']})")

    # Call schemes list as Health Officer
    token = data["access_token"]
    schemes_res = client.get("/api/v1/schemes", headers={"Authorization": f"Bearer {token}"})
    assert schemes_res.status_code == 200
    schemes = schemes_res.json()
    assert len(schemes) > 0
    # Every scheme must belong to the officer's department!
    for s in schemes:
        assert s["dept_id"] == data["dept_id"]
    print(f"PASS: Server-side department isolation verified! Officer only retrieved {len(schemes)} schemes from their department.")

def test_mock_pds_aadhaar_lookup():
    # Lookup simulated Aadhaar 987654321012
    res = client.get("/api/v1/families/lookup?identifier=987654321012")
    assert res.status_code == 200
    data = res.json()
    assert data["found"] is True
    assert data["data"]["head_name"] == "Priya Sharma"
    assert data["data"]["district"] == "Gandhinagar"
    assert data["data"]["aadhaar_masked"] == "XXXX-XXXX-1012"
    print("PASS: Mock PDS / Aadhaar registry lookup returns verified Gujarat citizen data")

def test_family_registration_with_mock_aadhaar():
    # Register a new family using simulated Ration card RC-GJ-4481920 (Ramesh Patel)
    # Check if duplicate or new
    unique_rc = f"RC-GJ-TEST-{os.urandom(3).hex()}"
    res = client.post("/api/v1/families/register", json={
        "head_name": "New Applicant",
        "income": 125000,
        "category": "BPL",
        "district": "Ahmedabad",
        "ration_card_no": unique_rc,
        "aadhaar_no": "234567890123"  # Recognized mock aadhaar
    })
    assert res.status_code == 200
    fam = res.json()
    assert fam["family_id"].startswith("GJ")
    assert fam["status"] == "provisional"
    assert fam["aadhaar_ref_masked"] == "XXXX-XXXX-0123"
    print(f"PASS: Registered family {fam['family_id']} with masked Aadhaar {fam['aadhaar_ref_masked']} and status {fam['status']}")

def test_eligibility_engine_against_seeded_schemes():
    # Fetch schemes
    schemes = client.get("/api/v1/schemes").json()
    assert len(schemes) >= 5

    # Run eligibility engine on Health scheme (scheme 1: MA Amrutam)
    health_scheme = next((s for s in schemes if "Health" in s["name"] or "Amrutam" in s["name"]), schemes[0])
    eligible_res = client.get(f"/api/v1/schemes/{health_scheme['id']}/eligible-families")
    assert eligible_res.status_code == 200
    eligible_families = eligible_res.json()
    assert len(eligible_families) > 0
    print(f"PASS: Eligibility Engine matched {len(eligible_families)} eligible families for '{health_scheme['name']}'")

if __name__ == "__main__":
    test_health()
    test_auth_and_me()
    test_officer_login_and_dept_isolation()
    test_mock_pds_aadhaar_lookup()
    test_family_registration_with_mock_aadhaar()
    test_eligibility_engine_against_seeded_schemes()
    print("\nALL PHASE 1 BACKEND FOUNDATION TESTS PASSED SUCCESSFULLY!")
