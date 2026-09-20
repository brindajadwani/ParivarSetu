from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_payload, TokenPayload
from app.models.scheme import Scheme, Department
from app.models.family import Family
from app.schemas.scheme import SchemeCreate, SchemeResponse
from app.schemas.family import FamilyResponse
from app.services.eligibility import get_eligible_families
from app.services.workflow import create_notification

router = APIRouter()

@router.post("", response_model=SchemeResponse)
def create_scheme(
    req: SchemeCreate,
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    """
    Officer creates scheme.
    Crucial security: If user has a dept_id assigned, enforce dept_id from token.
    """
    dept_id = user_payload.dept_id if user_payload.dept_id else 1

    scheme = Scheme(
        dept_id=dept_id,
        name=req.name,
        description=req.description,
        min_income=req.min_income,
        max_income=req.max_income,
        category=req.category,
        required_condition_tag=req.required_condition_tag,
        required_class=req.required_class,
        min_percentage=req.min_percentage,
        business_category=req.business_category,
        min_business_age=req.min_business_age,
        benefit_amount=req.benefit_amount,
        active=req.active
    )
    db.add(scheme)
    db.commit()
    db.refresh(scheme)
    return scheme

@router.get("", response_model=List[SchemeResponse])
def list_schemes(
    dept_id: Optional[int] = None,
    active_only: bool = True,
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    """
    List schemes. Officers are scoped to their department automatically.
    """
    q = db.query(Scheme)
    # Server-side department isolation
    if user_payload.role == "officer" and user_payload.dept_id:
        q = q.filter(Scheme.dept_id == user_payload.dept_id)
    elif dept_id is not None:
        q = q.filter(Scheme.dept_id == dept_id)

    if active_only:
        q = q.filter(Scheme.active == True)

    schemes = q.all()
    # Populate department_name
    res = []
    for s in schemes:
        item = SchemeResponse.model_validate(s)
        if s.department:
            item.department_name = s.department.name
        res.append(item)
    return res

@router.get("/{scheme_id}/eligible-families", response_model=List[FamilyResponse])
def eligible_families_endpoint(scheme_id: int, db: Session = Depends(get_db)):
    """Runs the generic eligibility engine for this scheme."""
    families = get_eligible_families(scheme_id, db)
    return families

@router.post("/{scheme_id}/notify-eligible")
def notify_eligible_families(
    scheme_id: int,
    custom_message: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Bulk notify all eligible families for this scheme."""
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    eligible = get_eligible_families(scheme_id, db)
    notified_count = 0
    msg = custom_message or f"Your family is eligible to apply for {scheme.name} with benefits up to ₹{scheme.benefit_amount or 0:,.2f}."

    for family in eligible:
        notif = create_notification(family.family_id, scheme_id, msg, db)
        if notif:
            notified_count += 1

    return {
        "scheme_id": scheme_id,
        "scheme_name": scheme.name,
        "eligible_families_found": len(eligible),
        "new_notifications_sent": notified_count
    }
