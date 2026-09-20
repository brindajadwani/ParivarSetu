from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    get_current_user_payload, 
    TokenPayload, 
    require_officer, 
    require_roles
)
from app.models.scheme import Scheme, Department
from app.models.family import Family
from app.models.audit import AuditLog
from app.schemas.scheme import SchemeCreate, SchemeResponse
from app.schemas.family import FamilyResponse
from app.services.eligibility import get_eligible_families, get_schemes_for_family
from app.services.workflow import create_notification

router = APIRouter()

@router.post("", response_model=SchemeResponse, status_code=status.HTTP_201_CREATED)
def create_scheme(
    req: SchemeCreate,
    user_payload: TokenPayload = Depends(require_officer),
    db: Session = Depends(get_db)
):
    """
    Officer creates scheme.
    Crucial security: dept_id is strictly extracted from the officer's JWT token.
    """
    scheme = Scheme(
        dept_id=user_payload.dept_id,
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

    # Log action
    db.add(AuditLog(
        user_id=user_payload.user_id,
        action="create_scheme",
        entity="scheme",
        entity_id=str(scheme.id)
    ))
    db.commit()

    res = SchemeResponse.model_validate(scheme)
    if scheme.department:
        res.department_name = scheme.department.name
    return res

@router.get("", response_model=List[SchemeResponse])
def list_schemes(
    dept_id: Optional[int] = None,
    active_only: bool = True,
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    """
    List schemes.
    Officers are strictly scoped to their department automatically via JWT token.
    Public/citizens can view active schemes across departments.
    """
    q = db.query(Scheme)

    # Enforce server-side department isolation for officers
    if user_payload.role == "officer" and user_payload.dept_id:
        q = q.filter(Scheme.dept_id == user_payload.dept_id)
    elif dept_id is not None:
        q = q.filter(Scheme.dept_id == dept_id)

    if active_only:
        q = q.filter(Scheme.active == True)

    schemes = q.all()
    results = []
    for s in schemes:
        item = SchemeResponse.model_validate(s)
        if s.department:
            item.department_name = s.department.name
        results.append(item)
    return results

@router.get("/eligible-for-family/{family_id}")
def get_eligible_schemes_for_family(family_id: str, db: Session = Depends(get_db)):
    """
    Evaluates all active government schemes against a specific family.
    Returns matched schemes the household qualifies for.
    """
    return get_schemes_for_family(family_id, db)

@router.get("/{scheme_id}", response_model=SchemeResponse)
def get_scheme(
    scheme_id: int,
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    # Officers cannot view details of other departments' private schemes
    if user_payload.role == "officer" and user_payload.dept_id and scheme.dept_id != user_payload.dept_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: This scheme belongs to another government department."
        )

    res = SchemeResponse.model_validate(scheme)
    if scheme.department:
        res.department_name = scheme.department.name
    return res

@router.put("/{scheme_id}", response_model=SchemeResponse)
def update_scheme(
    scheme_id: int,
    req: SchemeCreate,
    user_payload: TokenPayload = Depends(require_officer),
    db: Session = Depends(get_db)
):
    """
    Officer updates existing scheme.
    Crucial security: Officer can only modify schemes belonging to their department.
    """
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    if scheme.dept_id != user_payload.dept_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You cannot modify a scheme belonging to another department."
        )

    scheme.name = req.name
    scheme.description = req.description
    scheme.min_income = req.min_income
    scheme.max_income = req.max_income
    scheme.category = req.category
    scheme.required_condition_tag = req.required_condition_tag
    scheme.required_class = req.required_class
    scheme.min_percentage = req.min_percentage
    scheme.business_category = req.business_category
    scheme.min_business_age = req.min_business_age
    scheme.benefit_amount = req.benefit_amount
    scheme.active = req.active

    db.add(AuditLog(
        user_id=user_payload.user_id,
        action="update_scheme",
        entity="scheme",
        entity_id=str(scheme.id)
    ))
    db.commit()
    db.refresh(scheme)

    res = SchemeResponse.model_validate(scheme)
    if scheme.department:
        res.department_name = scheme.department.name
    return res

@router.delete("/{scheme_id}")
def deactivate_scheme(
    scheme_id: int,
    user_payload: TokenPayload = Depends(require_officer),
    db: Session = Depends(get_db)
):
    """Deactivate scheme (soft-delete). Only accessible to department officer."""
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    if scheme.dept_id != user_payload.dept_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You cannot deactivate a scheme belonging to another department."
        )

    scheme.active = False
    db.add(AuditLog(
        user_id=user_payload.user_id,
        action="deactivate_scheme",
        entity="scheme",
        entity_id=str(scheme.id)
    ))
    db.commit()
    return {"status": "success", "message": f"Scheme '{scheme.name}' has been deactivated"}

@router.get("/{scheme_id}/eligible-families", response_model=List[FamilyResponse])
def eligible_families_endpoint(
    scheme_id: int, 
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    """
    Runs the generic data-driven eligibility engine for this scheme.
    Enforces Blind Review Policy: Anonymizes personal names for review officers to eliminate bias.
    """
    families = get_eligible_families(scheme_id, db)
    if user_payload.role == "officer":
        results = []
        for f in families:
            resp = FamilyResponse.model_validate(f)
            resp.head_name = f"Applicant Household ({f.family_id})"
            anonymized_members = []
            for idx, m in enumerate(resp.members, 1):
                m.name = f"Member #{idx} ({m.relation.capitalize()})"
                anonymized_members.append(m)
            resp.members = anonymized_members
            if resp.bank_info:
                resp.bank_info.account_holder = f"Beneficiary #{f.family_id}"
            results.append(resp)
        return results
    return families

@router.post("/{scheme_id}/notify-eligible")
def notify_eligible_families(
    scheme_id: int,
    custom_message: Optional[str] = None,
    user_payload: TokenPayload = Depends(require_officer),
    db: Session = Depends(get_db)
):
    """
    Bulk notify all eligible families for this scheme.
    Database unique constraint (family_id, scheme_id) prevents duplicate notifications.
    """
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    if scheme.dept_id != user_payload.dept_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only broadcast notifications for schemes in your department."
        )

    eligible = get_eligible_families(scheme_id, db)
    notified_count = 0
    msg = custom_message or f"Your family is eligible to apply for {scheme.name} with benefits up to ₹{scheme.benefit_amount or 0:,.2f}."

    for family in eligible:
        notif = create_notification(family.family_id, scheme_id, msg, db)
        if notif:
            notified_count += 1

    db.add(AuditLog(
        user_id=user_payload.user_id,
        action="notify_eligible_families",
        entity="scheme",
        entity_id=str(scheme_id)
    ))
    db.commit()

    return {
        "scheme_id": scheme_id,
        "scheme_name": scheme.name,
        "eligible_families_found": len(eligible),
        "new_notifications_sent": notified_count
    }
