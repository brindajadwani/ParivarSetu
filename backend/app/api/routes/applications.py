from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.core.database import get_db
from app.core.security import (
    get_current_user_payload, 
    TokenPayload, 
    require_officer, 
    require_citizen
)
from app.models.application import Application
from app.models.scheme import Scheme
from app.models.family import Family
from app.models.audit import AuditLog
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
    DisburseRequest
)
from app.services.workflow import update_application_status, disburse_amount

router = APIRouter()

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_to_scheme(
    req: ApplicationCreate,
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    """
    Citizen applies for a scheme.
    Database unique constraint (family_id, member_id, scheme_id) prevents duplicate applications.
    """
    scheme = db.query(Scheme).filter(Scheme.id == req.scheme_id, Scheme.active == True).first()
    if not scheme:
        raise HTTPException(status_code=400, detail="Scheme not found or currently inactive")

    family = db.query(Family).filter(Family.family_id == req.family_id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")

    if family.status == "rejected":
        raise HTTPException(status_code=400, detail="Rejected family registrations cannot apply for welfare schemes")

    # Explicit duplicate check (handles PostgreSQL NULL != NULL unique constraint semantics)
    existing_app = db.query(Application).filter(
        Application.family_id == req.family_id,
        Application.member_id == req.member_id,
        Application.scheme_id == req.scheme_id
    ).first()
    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Duplicate application: This family or member has already applied for this scheme."
        )

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
            status_code=status.HTTP_409_CONFLICT,
            detail="Duplicate application: This family or member has already applied for this scheme."
        )

    # Log application submission
    db.add(AuditLog(
        user_id=user_payload.user_id if user_payload.role != "anonymous" else None,
        action="apply_scheme",
        entity="application",
        entity_id=str(app.id)
    ))
    db.commit()

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
    """
    List applications.
    Officers are strictly isolated to their department via JWT token server-side.
    """
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

@router.get("/{app_id}", response_model=ApplicationResponse)
def get_application(
    app_id: int,
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # If officer, verify dept
    if user_payload.role == "officer" and user_payload.dept_id and app.scheme.dept_id != user_payload.dept_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: This application belongs to another department."
        )

    res = ApplicationResponse.model_validate(app)
    if app.scheme:
        res.scheme_name = app.scheme.name
    return res

@router.put("/{app_id}/status", response_model=ApplicationResponse)
def change_status(
    app_id: int,
    req: ApplicationStatusUpdate,
    user_payload: TokenPayload = Depends(require_officer),
    db: Session = Depends(get_db)
):
    """
    Officer updates application status.
    Enforces server-side department check, VALID_TRANSITIONS state machine, and audit log.
    """
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if app.scheme.dept_id != user_payload.dept_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You cannot change status for applications of another department."
        )

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
    user_payload: TokenPayload = Depends(require_officer),
    db: Session = Depends(get_db)
):
    """
    Officer disburses benefit funds.
    Guards:
    1. Application must belong to officer's department.
    2. Status must be 'Approved'.
    3. Amount <= scheme limit.
    4. Generates DBT-GJ-XXXX and writes to audit_logs.
    """
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if app.scheme.dept_id != user_payload.dept_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You cannot disburse funds for applications of another department."
        )

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
