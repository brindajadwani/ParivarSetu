from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_payload, TokenPayload, mask_identifier
from app.models.family import Family, FamilyMember, HealthInfo, EducationInfo, BusinessInfo, BankInfo
from app.models.audit import AuditLog
from app.services.family import generate_family_id, sync_family_tags
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

@router.post("/register", response_model=FamilyResponse)
def register_family(
    req: FamilyRegisterRequest,
    db: Session = Depends(get_db),
    user_payload: TokenPayload = Depends(get_current_user_payload)
):
    """Register family, generate provisional 12-digit Family ID."""
    family_id = generate_family_id(db)
    masked_aadhaar = mask_identifier(req.aadhaar_no, visible_digits=4)

    family = Family(
        family_id=family_id,
        head_name=req.head_name,
        income=req.income,
        category=req.category,
        district=req.district,
        ration_card_no=req.ration_card_no,
        aadhaar_ref_masked=masked_aadhaar,
        status="provisional"
    )
    db.add(family)
    db.commit()

    # Automatically add head as first family member
    head_member = FamilyMember(
        family_id=family_id,
        name=req.head_name,
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
