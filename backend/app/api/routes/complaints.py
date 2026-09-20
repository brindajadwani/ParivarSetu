from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_payload, TokenPayload, require_officer
from app.models.complaint import Complaint
from app.models.application import Application
from app.models.scheme import Scheme
from app.models.audit import AuditLog
from app.schemas.complaint import ComplaintCreate, ComplaintResolve, ComplaintResponse

router = APIRouter()

@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def raise_complaint(
    req: ComplaintCreate,
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    """
    Citizen raises a grievance/complaint regarding an application.
    Automatically escalates application status to 'Escalated' if currently in 'Applied' or 'Under Review'.
    """
    app = db.query(Application).filter(Application.id == req.application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    complaint = Complaint(
        application_id=req.application_id,
        message=req.message,
        status="Open"
    )
    db.add(complaint)

    # Auto-flag status to 'Escalated' if in progress
    if app.status in ["Applied", "Under Review"]:
        prev_status = app.status
        app.status = "Escalated"
        app.updated_at = datetime.utcnow()

        db.add(AuditLog(
            user_id=user_payload.user_id if user_payload.role != "anonymous" else None,
            action=f"escalate_{prev_status}_via_complaint",
            entity="application",
            entity_id=str(app.id)
        ))

    db.add(AuditLog(
        user_id=user_payload.user_id if user_payload.role != "anonymous" else None,
        action="raise_complaint",
        entity="complaint",
        entity_id=str(req.application_id)
    ))
    db.commit()
    db.refresh(complaint)

    res = ComplaintResponse.model_validate(complaint)
    res.family_id = app.family_id
    if app.scheme:
        res.scheme_name = app.scheme.name
    return res

@router.get("", response_model=List[ComplaintResponse])
def list_complaints(
    dept_id: Optional[int] = None,
    status: Optional[str] = None,
    family_id: Optional[str] = None,
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    """
    List complaints.
    Officers are strictly isolated to complaints from their own department.
    """
    q = db.query(Complaint).join(Application, Complaint.application_id == Application.id).join(Scheme, Application.scheme_id == Scheme.id)

    # Server-side department isolation
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
        q = q.filter(Complaint.status.ilike(status))

    complaints = q.order_by(Complaint.created_at.desc()).all()
    results = []
    for c in complaints:
        item = ComplaintResponse.model_validate(c)
        if c.application:
            item.family_id = c.application.family_id
            if c.application.scheme:
                item.scheme_name = c.application.scheme.name
        results.append(item)
    return results

@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(
    complaint_id: int,
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    app = complaint.application
    if user_payload.role == "officer" and user_payload.dept_id and app.scheme.dept_id != user_payload.dept_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: This complaint belongs to another department."
        )

    res = ComplaintResponse.model_validate(complaint)
    if app:
        res.family_id = app.family_id
        if app.scheme:
            res.scheme_name = app.scheme.name
    return res

@router.put("/{complaint_id}/resolve", response_model=ComplaintResponse)
def resolve_complaint(
    complaint_id: int,
    req: ComplaintResolve,
    user_payload: TokenPayload = Depends(require_officer),
    db: Session = Depends(get_db)
):
    """
    Officer resolves complaint and provides official grievance response.
    Enforces department check and records audit log.
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    app = complaint.application
    if app.scheme.dept_id != user_payload.dept_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You cannot resolve complaints belonging to another department."
        )

    complaint.status = "Resolved"
    complaint.officer_response = req.officer_response
    complaint.resolved_at = datetime.utcnow()

    # If application was Escalated, return it to Under Review for normal processing
    if app.status == "Escalated":
        app.status = "Under Review"
        app.updated_at = datetime.utcnow()

    db.add(AuditLog(
        user_id=user_payload.user_id,
        action="resolve_complaint",
        entity="complaint",
        entity_id=str(complaint_id)
    ))
    db.commit()
    db.refresh(complaint)

    res = ComplaintResponse.model_validate(complaint)
    if app:
        res.family_id = app.family_id
        if app.scheme:
            res.scheme_name = app.scheme.name
    return res
