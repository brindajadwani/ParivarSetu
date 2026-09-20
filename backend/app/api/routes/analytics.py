from fastapi import APIRouter, Depends, Query
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user_payload, TokenPayload
from app.models.family import Family
from app.models.scheme import Scheme
from app.models.application import Application
from app.models.complaint import Complaint
from app.models.notification import Notification
from app.services.workflow import flag_delayed_applications

router = APIRouter()

@router.get("/summary")
def get_analytics_summary(
    dept_id: Optional[int] = None,
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    # Dept filter
    target_dept = user_payload.dept_id if (user_payload.role == "officer" and user_payload.dept_id) else dept_id

    total_families = db.query(Family).count()

    # Notifications count
    notif_q = db.query(Notification)
    if target_dept:
        notif_q = notif_q.join(Scheme, Notification.scheme_id == Scheme.id).filter(Scheme.dept_id == target_dept)
    total_notifications = notif_q.count()

    # Applications by status
    app_q = db.query(Application.status, func.count(Application.id))
    if target_dept:
        app_q = app_q.join(Scheme, Application.scheme_id == Scheme.id).filter(Scheme.dept_id == target_dept)
    status_counts = dict(app_q.group_by(Application.status).all())

    # Disbursed amount
    disbursed_q = db.query(func.coalesce(func.sum(Application.disbursed_amount), 0)).filter(Application.status == "Disbursed")
    if target_dept:
        disbursed_q = disbursed_q.join(Scheme, Application.scheme_id == Scheme.id).filter(Scheme.dept_id == target_dept)
    total_disbursed = float(disbursed_q.scalar() or 0)

    # Open complaints
    comp_q = db.query(Complaint).filter(Complaint.status == "Open")
    if target_dept:
        comp_q = comp_q.join(Application, Complaint.application_id == Application.id).join(Scheme, Application.scheme_id == Scheme.id).filter(Scheme.dept_id == target_dept)
    open_complaints = comp_q.count()

    # Delayed applications (> 3 days)
    delayed_apps = len(flag_delayed_applications(db, days=3))

    return {
        "total_families": total_families,
        "total_eligible_notifications_sent": total_notifications,
        "applications_by_status": {
            "Notified": status_counts.get("Notified", 0),
            "Applied": status_counts.get("Applied", 0),
            "Under Review": status_counts.get("Under Review", 0),
            "Approved": status_counts.get("Approved", 0),
            "Disbursed": status_counts.get("Disbursed", 0),
            "Rejected": status_counts.get("Rejected", 0),
            "Escalated": status_counts.get("Escalated", 0)
        },
        "total_disbursed_amount": total_disbursed,
        "open_complaints": open_complaints,
        "delayed_applications": delayed_apps
    }

@router.get("/by-scheme")
def get_analytics_by_scheme(
    dept_id: Optional[int] = None,
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    q = db.query(Scheme)
    if dept_id:
        q = q.filter(Scheme.dept_id == dept_id)
    schemes = q.all()

    results = []
    for s in schemes:
        applied_cnt = db.query(Application).filter(Application.scheme_id == s.id).count()
        disbursed_cnt = db.query(Application).filter(Application.scheme_id == s.id, Application.status == "Disbursed").count()
        disbursed_sum = db.query(func.coalesce(func.sum(Application.disbursed_amount), 0)).filter(
            Application.scheme_id == s.id,
            Application.status == "Disbursed"
        ).scalar()

        results.append({
            "scheme_id": s.id,
            "scheme_name": s.name,
            "applied_count": applied_cnt,
            "disbursed_count": disbursed_cnt,
            "total_disbursed_amount": float(disbursed_sum or 0)
        })
    return results

@router.get("/by-district")
def get_analytics_by_district(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    rows = db.query(
        Family.district,
        func.count(Family.family_id).label("families_count")
    ).group_by(Family.district).all()

    return [{"district": r[0] or "Unassigned", "families_count": r[1]} for r in rows]
