from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_payload, TokenPayload
from app.models.complaint import Complaint
from app.models.application import Application
from app.models.scheme import Scheme
from app.models.audit import AuditLog
from app.schemas.complaint import ComplaintCreate, ComplaintResolve, ComplaintResponse

router = APIRouter()

@router.post("", response_model=ComplaintResponse)
def raise_complaint(
    req: ComplaintCreate,
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == req.application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    complaint = Complaint(
        application_id=req.application_id,
        message=req.message,
        status="Open"
    )
    db.add(complaint)

    # Automatically escalate application if under review or applied
    if app.status in ["Applied", "Under Review"]:
        app.status = "Escalated"
        app.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(complaint)
    return complaint

@router.get("", response_model=List[ComplaintResponse])
def list_complaints(
    dept_id: Optional[int] = None,
    status: Optional[str] = None,
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    q = db.query(Complaint).join(Application, Complaint.application_id == Application.id).join(Scheme, Application.scheme_id == Scheme.id)

    if user_payload.role == "officer" and user_payload.dept_id:
        q = q.filter(Scheme.dept_id == user_payload.dept_id)
    elif dept_id is not None:
        q = q.filter(Scheme.dept_id == dept_id)

    if status:
        q = q.filter(Complaint.status == status)

    return q.order_by(Complaint.created_at.desc()).all()

@router.put("/{complaint_id}/resolve", response_model=ComplaintResponse)
def resolve_complaint(
    complaint_id: int,
    req: ComplaintResolve,
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.status = "Resolved"
    complaint.officer_response = req.officer_response
    complaint.resolved_at = datetime.utcnow()

    audit_entry = AuditLog(
        user_id=user_payload.user_id,
        action="resolve_complaint",
        entity="complaint",
        entity_id=str(complaint_id)
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(complaint)
    return complaint
