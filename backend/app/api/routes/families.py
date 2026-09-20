from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_payload, TokenPayload, mask_identifier, require_roles, require_verifier
from app.models.family import Family, FamilyMember, HealthInfo, EducationInfo, BusinessInfo, BankInfo
from app.models.audit import AuditLog
from app.services.family import generate_family_id, sync_family_tags
from app.services.mock_registry import lookup_mock_pds_aadhaar
from app.schemas.family import (
    FamilyRegisterRequest,
    FamilyResponse,
    MemberCreate,
    MemberResponse,
    HealthInfoCreate,
    EducationInfoCreate,
    BusinessInfoCreate,
    BankInfoCreate,
    BankInfoResponse
)

router = APIRouter()

@router.get("/lookup")
def lookup_citizen_identity(identifier: str = Query(..., description="12-digit Aadhaar number or Gujarat Ration Card number")):
    """
    Simulated PDS / Aadhaar registry verification.
    Citizens can verify their identity to auto-populate family details.
    """
    match = lookup_mock_pds_aadhaar(identifier)
    if not match:
        return {
            "found": False,
            "message": "No registry record matched. You may continue with self-registration."
        }
    return {
        "found": True,
        "source": "Gujarat PDS & UIDAI Registry",
        "data": {
            "head_name": match["head_name"],
            "district": match["district"],
            "income": match["income"],
            "category": match["category"],
            "ration_card_no": match["ration_card_no"],
            "aadhaar_masked": match["aadhaar_masked"],
            "members": match["members"]
        }
    }

@router.post("/register", response_model=FamilyResponse)
def register_family(
    req: FamilyRegisterRequest,
    db: Session = Depends(get_db),
    user_payload: TokenPayload = Depends(get_current_user_payload)
):
    """
    Register family with provisional status.
    If Aadhaar / Ration card is recognized in mock registry, auto-populates family structure.
    """
    # 1. Check if Ration card already registered
    if req.ration_card_no:
        existing = db.query(Family).filter(Family.ration_card_no == req.ration_card_no).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Family with Ration Card '{req.ration_card_no}' is already registered with Family ID: {existing.family_id}"
            )

    # 2. Check mock PDS / Aadhaar registry
    pds_record = None
    if req.aadhaar_no:
        pds_record = lookup_mock_pds_aadhaar(req.aadhaar_no)
    elif req.ration_card_no:
        pds_record = lookup_mock_pds_aadhaar(req.ration_card_no)

    family_id = generate_family_id(db, prefix="GJ")
    
    # Priority to verified registry data or submitted data
    head_name = pds_record["head_name"] if pds_record else req.head_name
    income = pds_record["income"] if pds_record else req.income
    category = pds_record["category"] if pds_record else req.category
    district = pds_record["district"] if pds_record else req.district
    ration_card_no = pds_record["ration_card_no"] if pds_record else req.ration_card_no
    masked_aadhaar = pds_record["aadhaar_masked"] if pds_record else mask_identifier(req.aadhaar_no)

    family = Family(
        family_id=family_id,
        head_name=head_name,
        income=income,
        category=category,
        district=district,
        ration_card_no=ration_card_no,
        aadhaar_ref_masked=masked_aadhaar,
        status="provisional"
    )
    db.add(family)
    db.commit()

    # 3. Add members
    if pds_record and pds_record.get("members"):
        for m in pds_record["members"]:
            member_obj = FamilyMember(
                family_id=family_id,
                name=m["name"],
                age=m["age"],
                gender=m["gender"],
                relation=m["relation"],
                occupation=m.get("occupation", "Other")
            )
            db.add(member_obj)
        db.commit()
    else:
        # Default head member
        head_member = FamilyMember(
            family_id=family_id,
            name=head_name,
            age=35,
            gender="Other",
            relation="head",
            occupation="Self-employed"
        )
        db.add(head_member)
        db.commit()

    db.refresh(family)
    return family

@router.get("/{family_id}", response_model=FamilyResponse)
def get_family(family_id: str, db: Session = Depends(get_db)):
    family = db.query(Family).filter(Family.family_id == family_id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")
    return family

@router.get("", response_model=List[FamilyResponse])
def list_families(
    status: Optional[str] = None,
    district: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List families (useful for verifiers and officer analytics)."""
    q = db.query(Family)
    if status:
        q = q.filter(Family.status == status)
    if district:
        q = q.filter(Family.district.ilike(f"%{district}%"))
    return q.limit(limit).all()

@router.put("/{family_id}/members", response_model=MemberResponse)
def add_member(family_id: str, req: MemberCreate, db: Session = Depends(get_db)):
    family = db.query(Family).filter(Family.family_id == family_id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")

    member = FamilyMember(
        family_id=family_id,
        name=req.name,
        age=req.age,
        gender=req.gender,
        relation=req.relation,
        occupation=req.occupation
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member

@router.put("/{family_id}/health")
def add_health_info(family_id: str, req: HealthInfoCreate, db: Session = Depends(get_db)):
    family = db.query(Family).filter(Family.family_id == family_id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")

    h = HealthInfo(
        family_id=family_id,
        member_id=req.member_id,
        condition_tags=req.condition_tags,
        bpl_health_card=req.bpl_health_card
    )
    db.add(h)
    db.commit()
    # Trigger tag sync
    sync_family_tags(family_id, db)
    return {"status": "success", "message": "Health info added and tags synchronized"}

@router.put("/{family_id}/education")
def add_education_info(family_id: str, req: EducationInfoCreate, db: Session = Depends(get_db)):
    family = db.query(Family).filter(Family.family_id == family_id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")

    e = EducationInfo(
        family_id=family_id,
        member_id=req.member_id,
        current_class=req.current_class,
        school_or_college=req.school_or_college,
        last_percentage=req.last_percentage,
        enrollment_status=req.enrollment_status
    )
    db.add(e)
    db.commit()
    # Trigger tag sync
    sync_family_tags(family_id, db)
    return {"status": "success", "message": "Education info added and tags synchronized"}

@router.put("/{family_id}/business")
def add_business_info(family_id: str, req: BusinessInfoCreate, db: Session = Depends(get_db)):
    family = db.query(Family).filter(Family.family_id == family_id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")

    b = BusinessInfo(
        family_id=family_id,
        member_id=req.member_id,
        business_name=req.business_name,
        business_type=req.business_type,
        registration_status=req.registration_status,
        business_age_months=req.business_age_months,
        annual_turnover=req.annual_turnover
    )
    db.add(b)
    db.commit()
    # Trigger tag sync
    sync_family_tags(family_id, db)
    return {"status": "success", "message": "Business info added and tags synchronized"}

@router.put("/{family_id}/bank", response_model=BankInfoResponse)
def add_bank_info(family_id: str, req: BankInfoCreate, db: Session = Depends(get_db)):
    family = db.query(Family).filter(Family.family_id == family_id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")

    existing_bank = db.query(BankInfo).filter(BankInfo.family_id == family_id).first()
    masked_acc = mask_identifier(req.account_number, visible_digits=4)

    if existing_bank:
        existing_bank.account_number_masked = masked_acc
        existing_bank.ifsc = req.ifsc
        existing_bank.bank_name = req.bank_name
        existing_bank.account_holder = req.account_holder
        db.commit()
        db.refresh(existing_bank)
        return existing_bank
    else:
        bank = BankInfo(
            family_id=family_id,
            account_number_masked=masked_acc,
            ifsc=req.ifsc,
            bank_name=req.bank_name,
            account_holder=req.account_holder
        )
        db.add(bank)
        db.commit()
        db.refresh(bank)
        return bank

@router.post("/{family_id}/verify")
def verify_family(
    family_id: str,
    action: str = Query(..., pattern="^(approve|reject)$"),
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    """Verifier endpoint: transforms provisional family to permanent or rejected."""
    family = db.query(Family).filter(Family.family_id == family_id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")

    family.status = "permanent" if action == "approve" else "rejected"
    db.add(AuditLog(
        user_id=user_payload.user_id,
        action=f"verify_family_{family.status}",
        entity="family",
        entity_id=family_id
    ))
    db.commit()
    return {"family_id": family_id, "status": family.status}
