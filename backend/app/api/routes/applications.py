from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.core.database import get_db
from app.core.security import get_current_user_payload, TokenPayload
from app.models.application import Application
from app.models.scheme import Scheme
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
    DisburseRequest
)
from app.services.workflow import update_application_status, disburse_amount

router = APIRouter()

@router.post("", response_model=ApplicationResponse)
def apply_to_scheme(
    req: ApplicationCreate,
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    """Citizen applies for a scheme. Database unique constraint prevents duplicates."""
    scheme = db.query(Scheme).filter(Scheme.id == req.scheme_id, Scheme.active == True).first()
    if not scheme:
        raise HTTPException(status_code=400, detail="Scheme not found or inactive")

    app = Application(
        family_id=req.family_id,
        member_id=req.member_id,
        scheme_id=req.scheme_id,
        status="Applied",
        applied_on=datetime.utcnow()
    )
    try:
        db.add(app)
        db.commit()
        db.refresh(app)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Duplicate application: This family/member has already applied for this scheme."
        )

    res = ApplicationResponse.model_validate(app)
    res.scheme_name = scheme.name
    return res

@router.get("", response_model=List[ApplicationResponse])
def list_applications(
    family_id: Optional[str] = None,
    dept_id: Optional[int] = None,
    status: Optional[str] = None,
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    """List applications. Officers are isolated to their department; citizens can filter by their family_id."""
    q = db.query(Application).join(Scheme, Application.scheme_id == Scheme.id)

    # Department isolation for officers
    if user_payload.role == "officer" and user_payload.dept_id:
        q = q.filter(Scheme.dept_id == user_payload.dept_id)
    elif dept_id is not None:
        q = q.filter(Scheme.dept_id == dept_id)

    # Citizen isolation
    if family_id:
        q = q.filter(Application.family_id == family_id)
    elif user_payload.role == "citizen" and user_payload.family_id:
        q = q.filter(Application.family_id == user_payload.family_id)

    if status:
        q = q.filter(Application.status == status)

    apps = q.order_by(Application.updated_at.desc()).all()
    results = []
    for a in apps:
        item = ApplicationResponse.model_validate(a)
        if a.scheme:
            item.scheme_name = a.scheme.name
        results.append(item)
    return results

@router.put("/{app_id}/status", response_model=ApplicationResponse)
def change_status(
    app_id: int,
    req: ApplicationStatusUpdate,
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    """Update application status with strict state-transition enforcement and audit logging."""
    updated = update_application_status(
        app_id=app_id,
        new_status=req.status,
        officer_id=user_payload.user_id,
        db=db
    )
    res = ApplicationResponse.model_validate(updated)
    if updated.scheme:
        res.scheme_name = updated.scheme.name
    return res

@router.put("/{app_id}/disburse", response_model=ApplicationResponse)
def disburse_funds(
    app_id: int,
    req: DisburseRequest,
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    """Disburse benefit amount. Requires status == 'Approved' and amount <= scheme limit."""
    updated = disburse_amount(
        app_id=app_id,
        amount=req.amount,
        officer_id=user_payload.user_id,
        db=db
    )
    res = ApplicationResponse.model_validate(updated)
    if updated.scheme:
        res.scheme_name = updated.scheme.name
    return res
