from datetime import datetime, timedelta
import uuid
from typing import Optional, List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.application import Application
from app.models.scheme import Scheme
from app.models.notification import Notification
from app.models.audit import AuditLog

VALID_TRANSITIONS = {
    "Notified": ["Applied"],
    "Applied": ["Under Review", "Rejected"],
    "Under Review": ["Approved", "Rejected", "Escalated"],
    "Escalated": ["Under Review", "Approved", "Rejected"],
    "Approved": ["Disbursed"],
    "Rejected": [],
    "Disbursed": []
}

def update_application_status(app_id: int, new_status: str, officer_id: Optional[int], db: Session) -> Application:
    """Enforces valid state transitions and writes to audit_logs."""
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    allowed = VALID_TRANSITIONS.get(app.status, [])
    if new_status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid state transition: Cannot move from '{app.status}' to '{new_status}'. Allowed: {allowed}"
        )

    prev_status = app.status
    app.status = new_status
    app.updated_at = datetime.utcnow()

    # Log audit trail
    audit_entry = AuditLog(
        user_id=officer_id,
        action=f"status_{prev_status}_to_{new_status}",
        entity="application",
        entity_id=str(app_id)
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(app)
    return app

def disburse_amount(app_id: int, amount: float, officer_id: Optional[int], db: Session) -> Application:
    """Guards: status must be Approved, amount <= scheme benefit amount."""
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if app.status != "Approved":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot disburse funds: Application must be in 'Approved' status, currently '{app.status}'."
        )

    scheme = db.query(Scheme).filter(Scheme.id == app.scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    if scheme.benefit_amount is not None and amount > float(scheme.benefit_amount):
        raise HTTPException(
            status_code=400,
            detail=f"Disbursement amount (₹{amount}) exceeds scheme maximum benefit (₹{scheme.benefit_amount})."
        )

    txn_id = f"DBT-GJ-{uuid.uuid4().hex[:8].upper()}"
    app.status = "Disbursed"
    app.disbursed_amount = amount
    app.txn_id = txn_id
    app.updated_at = datetime.utcnow()

    audit_entry = AuditLog(
        user_id=officer_id,
        action="disburse_funds",
        entity="application",
        entity_id=str(app_id)
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(app)
    return app

def create_notification(family_id: str, scheme_id: int, message: str, db: Session) -> Optional[Notification]:
    """Insert notification safely with deduplication check."""
    try:
        notif = Notification(
            family_id=family_id,
            scheme_id=scheme_id,
            message=message
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif
    except IntegrityError:
        db.rollback()
        return None

def flag_delayed_applications(db: Session, dept_id: Optional[int] = None, days: int = 3) -> List[Application]:
    """Flag applications stuck in 'Applied' or 'Under Review' for more than specified days."""
    cutoff = datetime.utcnow() - timedelta(days=days)
    q = db.query(Application).join(Scheme, Application.scheme_id == Scheme.id).filter(
        Application.status.in_(["Applied", "Under Review"]),
        Application.updated_at < cutoff
    )
    if dept_id is not None:
        q = q.filter(Scheme.dept_id == dept_id)
    return q.all()
