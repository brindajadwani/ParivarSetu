import os
import sys
from datetime import datetime, timedelta, timezone
import random

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
        print("1. Checking & seeding departments for Gujarat...")
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

        print("2. Seeding foundational Government of Gujarat schemes...")
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
            },
            {
                "name": "Gujarat Matrushakti Nutritional Support",
                "dept": "Health & Family Welfare",
                "description": "Nutritional grant and rations for pregnant women and lactating mothers for 1000 days.",
                "max_income": 250000,
                "required_condition_tag": "pregnant",
                "benefit_amount": 12000.0,
                "active": True
            },
            {
                "name": "Dr. Ambedkar Awas Yojana",
                "dept": "Social Justice & Empowerment",
                "description": "Financial assistance for house construction for economically weaker SC/ST families in Gujarat.",
                "max_income": 180000,
                "category": "SC",
                "benefit_amount": 120000.0,
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

        print("3. Seeding 28 diverse Gujarat families across districts...")
        districts = [
            "Gandhinagar", "Ahmedabad", "Surat", "Rajkot", "Vadodara",
            "Bhavnagar", "Jamnagar", "Junagadh", "Dahod", "Banaskantha",
            "Anand", "Mehsana", "Kutch", "Kheda", "Patan"
        ]

        family_specs = [
            # 1. Flagship demo family matching UI
            {
                "id": "GJ12345678",
                "head": "Priya Sharma",
                "district": "Gandhinagar",
                "income": 180000.0,
                "category": "OBC",
                "status": "permanent",
                "rc": "RC-GJ-0982341",
                "aadhaar": "XXXX-XXXX-4589",
                "members": [
                    ("Priya Sharma", 36, "Female", "head", "Handicraft Artisan"),
                    ("Rajesh Sharma", 39, "Male", "spouse", "Agritech Technician"),
                    ("Aarav Sharma", 15, "Male", "child", "Student (Class 10)"),
                    ("Sunita Devi", 64, "Female", "parent", "Homemaker")
                ],
                "edu": (2, "10th", 78.5),
                "biz": ("Gujarat Heritage Handlooms", "startup", "registered", 14, 160000.0),
                "health": ["diabetes_care"]
            },
            # 2. BPL family in Ahmedabad (PM Awas / Health eligible)
            {
                "id": "GJ20019281",
                "head": "Ramesh Patel",
                "district": "Ahmedabad",
                "income": 110000.0,
                "category": "BPL",
                "status": "permanent",
                "rc": "RC-GJ-1002931",
                "aadhaar": "XXXX-XXXX-1920",
                "members": [
                    ("Ramesh Patel", 42, "Male", "head", "Construction Worker"),
                    ("Geeta Patel", 38, "Female", "spouse", "Domestic Worker"),
                    ("Kavita Patel", 16, "Female", "child", "Student (Class 10)")
                ],
                "edu": (2, "10th", 72.0),
                "health": ["bpl_health_card"]
            },
            # 3. Pregnant Mother in Dahod (Health & Matrushakti eligible)
            {
                "id": "GJ31029384",
                "head": "Kailashben Baria",
                "district": "Dahod",
                "income": 95000.0,
                "category": "ST",
                "status": "permanent",
                "rc": "RC-GJ-3102948",
                "aadhaar": "XXXX-XXXX-8821",
                "members": [
                    ("Kailashben Baria", 24, "Female", "head", "Agricultural Worker"),
                    ("Sureshbhai Baria", 27, "Male", "spouse", "Farm Laborer")
                ],
                "health": ["pregnant"]
            },
            # 4. Bright High-Scorer in Rajkot (MYSY Eligible)
            {
                "id": "GJ41092837",
                "head": "Jignesh Vaghela",
                "district": "Rajkot",
                "income": 220000.0,
                "category": "SC",
                "status": "permanent",
                "rc": "RC-GJ-4109281",
                "aadhaar": "XXXX-XXXX-3342",
                "members": [
                    ("Jignesh Vaghela", 48, "Male", "head", "Electrician"),
                    ("Meenaben Vaghela", 44, "Female", "spouse", "Tailor"),
                    ("Bhavik Vaghela", 16, "Male", "child", "Student (Class 10)")
                ],
                "edu": (2, "10th", 89.4),
                "health": []
            },
            # 5. Innovative Tech Startup in Surat (Startup Assistance Eligible)
            {
                "id": "GJ52019283",
                "head": "Meera Desai",
                "district": "Surat",
                "income": 450000.0,
                "category": "General",
                "status": "permanent",
                "rc": "RC-GJ-5201948",
                "aadhaar": "XXXX-XXXX-9901",
                "members": [
                    ("Meera Desai", 29, "Female", "head", "Software Founder"),
                    ("Karan Desai", 31, "Male", "spouse", "Data Analyst")
                ],
                "biz": ("Surat Solar IoT Solutions", "startup", "registered", 18, 520000.0)
            },
            # 6. SC Housing & Welfare family in Vadodara
            {
                "id": "GJ63019284",
                "head": "Mansukhbhai Solanki",
                "district": "Vadodara",
                "income": 140000.0,
                "category": "SC",
                "status": "permanent",
                "rc": "RC-GJ-6301920",
                "aadhaar": "XXXX-XXXX-7721",
                "members": [
                    ("Mansukhbhai Solanki", 52, "Male", "head", "Auto Driver"),
                    ("Laxmiben Solanki", 48, "Female", "spouse", "Homemaker"),
                    ("Pooja Solanki", 15, "Female", "child", "Student (Class 10)")
                ],
                "edu": (2, "10th", 65.0)
            },
            # 7. Provisional Family waiting for Verifier
            {
                "id": "GJ74019285",
                "head": "Alpeshbhai Chauhan",
                "district": "Bhavnagar",
                "income": 175000.0,
                "category": "SEBC",
                "status": "provisional",
                "rc": "RC-GJ-7401938",
                "aadhaar": "XXXX-XXXX-6612",
                "members": [
                    ("Alpeshbhai Chauhan", 34, "Male", "head", "Carpenter"),
                    ("Niruben Chauhan", 31, "Female", "spouse", "Homemaker")
                ]
            }
        ]

        # Generate remaining families up to 28
        first_names_m = ["Bharat", "Nitin", "Pravin", "Deepak", "Chirag", "Hitesh", "Paresh", "Mukesh", "Vijay", "Ashok", "Sanjay"]
        first_names_f = ["Anilaben", "Jyotiben", "Hansaben", "Urmilaben", "Bhavanaben", "Dharmishtha", "Neelam", "Varsha", "Rekha"]
        surnames = ["Patel", "Shah", "Prajapati", "Parmar", "Gohil", "Chaudhary", "Makwana", "Joshi", "Rathod", "Thakor", "Zala"]
        categories_pool = ["BPL", "SEBC", "SC", "ST", "General"]

        current_count = len(family_specs)
        for i in range(current_count, 28):
            gender = "Male" if i % 2 == 0 else "Female"
            fn = random.choice(first_names_m if gender == "Male" else first_names_f)
            ln = random.choice(surnames)
            cat = random.choice(categories_pool)
            inc = 80000.0 if cat == "BPL" else random.choice([130000.0, 190000.0, 240000.0, 350000.0, 550000.0])
            dist = districts[i % len(districts)]
            f_id = f"GJ{random.randint(10000000, 99999999)}"

            has_student = (i % 2 == 0)
            has_biz = (i % 4 == 0)
            has_health = (i % 3 == 0)

            members_list = [
                (f"{fn} {ln}", random.randint(30, 55), gender, "head", "Self-employed"),
                (f"Spouse {ln}", random.randint(28, 52), "Female" if gender == "Male" else "Male", "spouse", "Homemaker")
            ]
            if has_student:
                members_list.append((f"Child {ln}", 15, "Male", "child", "Student"))

            spec = {
                "id": f_id,
                "head": f"{fn} {ln}",
                "district": dist,
                "income": inc,
                "category": cat,
                "status": "permanent" if i % 6 != 0 else "provisional",
                "rc": f"RC-GJ-{random.randint(1000000, 9999999)}",
                "aadhaar": f"XXXX-XXXX-{random.randint(1000, 9999)}",
                "members": members_list
            }
            if has_student:
                spec["edu"] = (2, "10th", round(random.uniform(55.0, 92.0), 1))
            if has_biz:
                spec["biz"] = (f"{ln} Enterprises", random.choice(["startup", "MSME", "small_business"]), "registered", random.randint(7, 36), inc * 1.5)
            if has_health:
                spec["health"] = random.choice([["diabetes_care"], ["hypertension"], ["pregnant"], ["bpl_health_card"]])

            family_specs.append(spec)

        for spec in family_specs:
            f = db.query(Family).filter(Family.family_id == spec["id"]).first()
            if not f:
                f = Family(
                    family_id=spec["id"],
                    head_name=spec["head"],
                    income=spec["income"],
                    category=spec["category"],
                    district=spec["district"],
                    ration_card_no=spec["rc"],
                    aadhaar_ref_masked=spec["aadhaar"],
                    status=spec["status"]
                )
                db.add(f)
                db.commit()

                # Add members
                mem_objs = []
                for m_name, m_age, m_gen, m_rel, m_occ in spec["members"]:
                    mem = FamilyMember(
                        family_id=spec["id"],
                        name=m_name,
                        age=m_age,
                        gender=m_gen,
                        relation=m_rel,
                        occupation=m_occ
                    )
                    db.add(mem)
                    db.commit()
                    db.refresh(mem)
                    mem_objs.append(mem)

                # Add bank info
                db.add(BankInfo(
                    family_id=spec["id"],
                    account_number_masked=f"****{random.randint(1000, 9999)}",
                    ifsc="SBIN0001234",
                    bank_name="State Bank of India",
                    account_holder=spec["head"]
                ))

                # Add Education if spec
                if "edu" in spec and len(mem_objs) > spec["edu"][0]:
                    target_m = mem_objs[spec["edu"][0]]
                    db.add(EducationInfo(
                        family_id=spec["id"],
                        member_id=target_m.id,
                        current_class=spec["edu"][1],
                        school_or_college=f"{spec['district']} Higher Secondary School",
                        last_percentage=spec["edu"][2],
                        enrollment_status="enrolled"
                    ))

                # Add Business if spec
                if "biz" in spec and len(mem_objs) > 0:
                    b_name, b_type, b_reg, b_age, b_turnover = spec["biz"]
                    db.add(BusinessInfo(
                        family_id=spec["id"],
                        member_id=mem_objs[0].id,
                        business_name=b_name,
                        business_type=b_type,
                        registration_status=b_reg,
                        business_age_months=b_age,
                        annual_turnover=b_turnover
                    ))

                # Add Health if spec
                if "health" in spec:
                    db.add(HealthInfo(
                        family_id=spec["id"],
                        member_id=mem_objs[0].id,
                        condition_tags=spec["health"],
                        bpl_health_card=("bpl_health_card" in spec["health"])
                    ))

                db.commit()
                # Run tag sync to populate GIN array columns
                sync_family_tags(spec["id"], db)

        print("4. Seeding applications and notifications for demo family GJ12345678...")
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        ayushman = created_schemes.get("MA Amrutam / PMJAY Health Scheme")
        mysy = created_schemes.get("MYSY (Mukhyamantri Yuva Swavalamban Yojana)")
        startup_scheme = created_schemes.get("Gujarat Startup & Innovation Assistance")
        awas_scheme = created_schemes.get("Mukhyamantri Awas Yojana (Urban & Rural)")

        demo_id = "GJ12345678"
        if ayushman and not db.query(Application).filter(Application.family_id == demo_id, Application.scheme_id == ayushman.id).first():
            db.add(Application(
                family_id=demo_id,
                scheme_id=ayushman.id,
                status="Approved",
                applied_on=now - timedelta(days=38),
                disbursed_amount=48000.0,
                txn_id="DBT-GJ-98214"
            ))

        if mysy and not db.query(Application).filter(Application.family_id == demo_id, Application.scheme_id == mysy.id).first():
            db.add(Application(
                family_id=demo_id,
                scheme_id=mysy.id,
                status="Under Review",
                applied_on=now - timedelta(days=22)
            ))

        if startup_scheme and not db.query(Application).filter(Application.family_id == demo_id, Application.scheme_id == startup_scheme.id).first():
            db.add(Application(
                family_id=demo_id,
                scheme_id=startup_scheme.id,
                status="Applied",
                applied_on=now - timedelta(days=17)
            ))

        # Seed notifications for demo
        if ayushman and mysy and startup_scheme and awas_scheme:
            notifs = [
                (ayushman.id, "Your MA Amrutam health application has been approved.", True),
                (startup_scheme.id, "New scheme available: Gujarat Startup & Innovation Assistance.", True),
                (mysy.id, "Your application for MYSY Scholarship is under review.", False),
                (awas_scheme.id, "Complaint #CP0001234 regarding Mukhyamantri Awas Yojana has been resolved.", False)
            ]
            for s_id, msg, is_read in notifs:
                if not db.query(Notification).filter(Notification.family_id == demo_id, Notification.scheme_id == s_id).first():
                    db.add(Notification(
                        family_id=demo_id,
                        scheme_id=s_id,
                        message=msg,
                        read=is_read
                    ))
                    db.commit()

        # Seed grievance complaints for each department
        print("4b. Seeding department-isolated grievance complaints...")
        mysy_app = db.query(Application).filter(Application.family_id == demo_id, Application.scheme_id == mysy.id).first() if mysy else None
        startup_app = db.query(Application).filter(Application.family_id == demo_id, Application.scheme_id == startup_scheme.id).first() if startup_scheme else None
        health_app = db.query(Application).filter(Application.family_id == demo_id, Application.scheme_id == ayushman.id).first() if ayushman else None

        if mysy_app and not db.query(Complaint).filter(Complaint.application_id == mysy_app.id).first():
            db.add(Complaint(
                application_id=mysy_app.id,
                message="12th marksheet and engineering college fee receipt submitted. Awaiting scholarship verification.",
                status="Open"
            ))
            mysy_app.status = "Escalated"

        if startup_app and not db.query(Complaint).filter(Complaint.application_id == startup_app.id).first():
            db.add(Complaint(
                application_id=startup_app.id,
                message="Startup prototype and DPIIT registration uploaded. Inquiring regarding technical committee evaluation date.",
                status="Open"
            ))
            startup_app.status = "Escalated"

        if health_app and not db.query(Complaint).filter(Complaint.application_id == health_app.id).first():
            db.add(Complaint(
                application_id=health_app.id,
                message="Civil Hospital Gandhinagar desk requested official Parivar verification letter for cashless surgery approval.",
                status="Open"
            ))
            health_app.status = "Escalated"
        db.commit()

        print("5. Seeding default role-based user accounts...")
        default_users = [
            {"email": "priya.sharma@parivar.gujarat.gov.in", "password": "Gujarat@2026", "role": "citizen", "family_id": demo_id},
            {"email": "health.officer@gujarat.gov.in", "password": "Gujarat@2026", "role": "officer", "dept_id": depts["Health & Family Welfare"].id},
            {"email": "education.officer@gujarat.gov.in", "password": "Gujarat@2026", "role": "officer", "dept_id": depts["Education Department"].id},
            {"email": "msme.officer@gujarat.gov.in", "password": "Gujarat@2026", "role": "officer", "dept_id": depts["Industries & MSME"].id},
            {"email": "talati.gandhinagar@gujarat.gov.in", "password": "Gujarat@2026", "role": "verifier"},
            {"email": "admin@gujarat.gov.in", "password": "Gujarat@2026", "role": "admin"}
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
        total_fam = db.query(Family).count()
        total_users = db.query(User).count()
        total_schemes = db.query(Scheme).count()
        print(f"Gujarat Government Seed Complete: {total_fam} families, {total_users} users, {total_schemes} schemes!")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_seed_data()
