import os
import sys
from datetime import datetime, timedelta, timezone

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, engine
from app.models.family import Family, FamilyMember, HealthInfo, EducationInfo, BusinessInfo, BankInfo
from app.models.scheme import Department, Scheme
from app.models.application import Application
from app.models.notification import Notification
from app.models.complaint import Complaint
from app.models.user import User
from app.core.security import get_password_hash
from app.services.family import sync_family_tags

def init_seed_data():
    db = SessionLocal()
    try:
        print("Checking departments for Gujarat...")
        dept_names = [
            "Health & Family Welfare",
            "Education Department",
            "Industries & MSME",
            "Urban Development & Housing",
            "Social Justice & Empowerment"
        ]
        depts = {}
        for name in dept_names:
            d = db.query(Department).filter(Department.name == name).first()
            if not d:
                d = Department(name=name)
                db.add(d)
                db.commit()
                db.refresh(d)
            depts[name] = d

        print("Seeding foundational Government of Gujarat schemes...")
        schemes_data = [
            {
                "name": "MA Amrutam / PMJAY Health Scheme",
                "dept": "Health & Family Welfare",
                "description": "Comprehensive cashless medical treatment up to ₹10 Lakhs per family per year for secondary and tertiary healthcare.",
                "max_income": 400000,
                "category": None,
                "required_condition_tag": None,
                "benefit_amount": 1000000.0,
                "active": True
            },
            {
                "name": "MYSY (Mukhyamantri Yuva Swavalamban Yojana)",
                "dept": "Education Department",
                "description": "Financial assistance for higher education tuition fees, hostel, and book grants for bright Gujarat students.",
                "max_income": 600000,
                "category": None,
                "required_class": "10th",
                "min_percentage": 70.0,
                "benefit_amount": 25000.0,
                "active": True
            },
            {
                "name": "Gujarat Startup & Innovation Assistance",
                "dept": "Industries & MSME",
                "description": "Sustenance allowance of ₹20,000/month and seed funding up to ₹5 Lakhs for registered innovative ventures in Gujarat.",
                "max_income": 800000,
                "business_category": "startup",
                "min_business_age": 6,
                "benefit_amount": 50000.0,
                "active": True
            },
            {
                "name": "Mukhyamantri Awas Yojana (Urban & Rural)",
                "dept": "Urban Development & Housing",
                "description": "Affordable pucca housing assistance for EWS and lower-income families in Gujarat.",
                "max_income": 150000,
                "category": "BPL",
                "benefit_amount": 150000.0,
                "active": True
            },
            {
                "name": "Namo Lakshmi & Saraswati Yojana",
                "dept": "Education Department",
                "description": "Educational grant supporting secondary and higher secondary schooling for girl students across Gujarat.",
                "max_income": 300000,
                "required_class": "10th",
                "benefit_amount": 10000.0,
                "active": True
            }
        ]

        created_schemes = {}
        for s in schemes_data:
            existing = db.query(Scheme).filter(Scheme.name == s["name"]).first()
            if not existing:
                scheme_obj = Scheme(
                    dept_id=depts[s["dept"]].id,
                    name=s["name"],
                    description=s["description"],
                    max_income=s.get("max_income"),
                    category=s.get("category"),
                    required_condition_tag=s.get("required_condition_tag"),
                    required_class=s.get("required_class"),
                    min_percentage=s.get("min_percentage"),
                    business_category=s.get("business_category"),
                    min_business_age=s.get("min_business_age"),
                    benefit_amount=s.get("benefit_amount"),
                    active=s.get("active", True)
                )
                db.add(scheme_obj)
                db.commit()
                db.refresh(scheme_obj)
                created_schemes[s["name"]] = scheme_obj
            else:
                created_schemes[s["name"]] = existing

        print("Seeding demo citizen family matching dashboard UI (Priya Sharma / Patel: GJ12345678)...")
        demo_family_id = "GJ12345678"
        family = db.query(Family).filter(Family.family_id == demo_family_id).first()
        if not family:
            family = Family(
                family_id=demo_family_id,
                head_name="Priya Sharma",
                income=180000,
                category="OBC",
                district="Gandhinagar",
                ration_card_no="RC-GJ-0982341",
                aadhaar_ref_masked="XXXX-XXXX-4589",
                status="permanent",
                health_tags=["diabetes_care"],
                education_tags=["class:10th", "status:enrolled"],
                business_tags=["startup", "registered"]
            )
            db.add(family)
            db.commit()
            db.refresh(family)

            # Members: 4 family members
            members = [
                FamilyMember(family_id=demo_family_id, name="Priya Sharma", age=36, gender="Female", relation="head", occupation="Handicraft Entrepreneur"),
                FamilyMember(family_id=demo_family_id, name="Rajesh Sharma", age=39, gender="Male", relation="spouse", occupation="Agritech Technician"),
                FamilyMember(family_id=demo_family_id, name="Aarav Sharma", age=15, gender="Male", relation="child", occupation="Student (Class 10)"),
                FamilyMember(family_id=demo_family_id, name="Sunita Devi", age=64, gender="Female", relation="parent", occupation="Homemaker")
            ]
            for m in members:
                db.add(m)
            db.commit()

            # Education info
            aarav = db.query(FamilyMember).filter(FamilyMember.family_id == demo_family_id, FamilyMember.name == "Aarav Sharma").first()
            if aarav:
                db.add(EducationInfo(
                    family_id=demo_family_id,
                    member_id=aarav.id,
                    current_class="10th",
                    school_or_college="Gandhinagar Government Higher Secondary School",
                    last_percentage=78.5,
                    enrollment_status="enrolled"
                ))

            # Business info
            priya_mem = db.query(FamilyMember).filter(FamilyMember.family_id == demo_family_id, FamilyMember.name == "Priya Sharma").first()
            if priya_mem:
                db.add(BusinessInfo(
                    family_id=demo_family_id,
                    member_id=priya_mem.id,
                    business_name="Gujarat Heritage Handlooms",
                    business_type="startup",
                    registration_status="registered",
                    business_age_months=14,
                    annual_turnover=160000.0
                ))

            # Bank Info
            db.add(BankInfo(
                family_id=demo_family_id,
                account_number_masked="****4321",
                ifsc="SBIN0001234",
                bank_name="State Bank of India (Gandhinagar)",
                account_holder="Priya Sharma"
            ))
            db.commit()

            sync_family_tags(demo_family_id, db)

        # Seed Applications matching UI stats: 3 applications (2 in progress, 1 approved)
        ma_health = created_schemes.get("MA Amrutam / PMJAY Health Scheme")
        mysy = created_schemes.get("MYSY (Mukhyamantri Yuva Swavalamban Yojana)")
        startup_scheme = created_schemes.get("Gujarat Startup & Innovation Assistance")
        awas_scheme = created_schemes.get("Mukhyamantri Awas Yojana (Urban & Rural)")

        now = datetime.now(timezone.utc).replace(tzinfo=None)
        if ma_health and not db.query(Application).filter(Application.family_id == demo_family_id, Application.scheme_id == ma_health.id).first():
            db.add(Application(
                family_id=demo_family_id,
                scheme_id=ma_health.id,
                status="Approved",
                applied_on=now - timedelta(days=38),
                disbursed_amount=48000.0,
                txn_id="DBT-GJ-98214"
            ))

        if mysy and not db.query(Application).filter(Application.family_id == demo_family_id, Application.scheme_id == mysy.id).first():
            db.add(Application(
                family_id=demo_family_id,
                scheme_id=mysy.id,
                status="Under Review",
                applied_on=now - timedelta(days=22)
            ))

        if startup_scheme and not db.query(Application).filter(Application.family_id == demo_family_id, Application.scheme_id == startup_scheme.id).first():
            db.add(Application(
                family_id=demo_family_id,
                scheme_id=startup_scheme.id,
                status="Applied",
                applied_on=now - timedelta(days=17)
            ))

        # Seed Notifications
        if ma_health and mysy and startup_scheme and awas_scheme:
            notifications = [
                (ma_health.id, "Your MA Amrutam / PMJAY Health application has been approved.", True),
                (startup_scheme.id, "New scheme available: Gujarat Startup & Innovation Assistance.", True),
                (mysy.id, "Your application for MYSY Scholarship is under review.", False),
                (awas_scheme.id, "Complaint #CP0001234 regarding Mukhyamantri Awas Yojana has been resolved.", False)
            ]
            for s_id, msg, is_read in notifications:
                if not db.query(Notification).filter(Notification.family_id == demo_family_id, Notification.scheme_id == s_id).first():
                    db.add(Notification(
                        family_id=demo_family_id,
                        scheme_id=s_id,
                        message=msg,
                        read=is_read
                    ))
                    db.commit()

        # Seed users (Citizen Priya, Gujarat Officer, Verifier)
        default_users = [
            {"email": "priya.sharma@parivar.gujarat.gov.in", "password": "password123", "role": "citizen", "family_id": demo_family_id},
            {"email": "health.officer@gujarat.gov.in", "password": "password123", "role": "officer", "dept_id": depts["Health & Family Welfare"].id},
            {"email": "education.officer@gujarat.gov.in", "password": "password123", "role": "officer", "dept_id": depts["Education Department"].id},
            {"email": "talati.gandhinagar@gujarat.gov.in", "password": "password123", "role": "verifier"}
        ]
        for u in default_users:
            if not db.query(User).filter(User.email == u["email"]).first():
                db.add(User(
                    email=u["email"],
                    password_hash=get_password_hash(u["password"]),
                    role=u["role"],
                    dept_id=u.get("dept_id"),
                    family_id=u.get("family_id")
                ))

        db.commit()
        print("Gujarat Government initialization and seed completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_seed_data()
