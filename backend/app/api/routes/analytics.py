from fastapi import APIRouter, Depends, Query
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user_payload, TokenPayload
from app.models.family import Family
from app.models.scheme import Scheme, Department
from app.models.application import Application
from app.models.complaint import Complaint
from app.models.notification import Notification
from app.services.workflow import flag_delayed_applications
from app.services.eligibility import get_eligible_families

router = APIRouter()

@router.get("/summary")
def get_analytics_summary(
    dept_id: Optional[int] = None,
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Department-scoped or statewide executive dashboard analytics summary.
    Officers are strictly isolated to their department via JWT token claims.
    """
    # Department isolation: if caller is officer, prioritize JWT claim
    target_dept = user_payload.dept_id if (user_payload.role == "officer" and user_payload.dept_id) else dept_id

    total_families = db.query(Family).count()

    # Department metadata
    dept_name = None
    if target_dept:
        d = db.query(Department).filter(Department.id == target_dept).first()
        dept_name = d.name if d else None

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
    delayed_apps = len(flag_delayed_applications(db, dept_id=target_dept, days=3))

    return {
        "dept_id": target_dept,
        "department_name": dept_name or "All Departments (Statewide)",
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
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Funnel analytics per scheme: eligible families, applications, approvals, and total disbursal amounts.
    """
    target_dept = user_payload.dept_id if (user_payload.role == "officer" and user_payload.dept_id) else dept_id

    q = db.query(Scheme)
    if target_dept:
        q = q.filter(Scheme.dept_id == target_dept)
    schemes = q.all()

    results = []
    for s in schemes:
        eligible_count = len(get_eligible_families(s.id, db))
        applied_cnt = db.query(Application).filter(Application.scheme_id == s.id).count()
        approved_cnt = db.query(Application).filter(Application.scheme_id == s.id, Application.status == "Approved").count()
        disbursed_cnt = db.query(Application).filter(Application.scheme_id == s.id, Application.status == "Disbursed").count()
        disbursed_sum = db.query(func.coalesce(func.sum(Application.disbursed_amount), 0)).filter(
            Application.scheme_id == s.id,
            Application.status == "Disbursed"
        ).scalar()

        results.append({
            "scheme_id": s.id,
            "scheme_name": s.name,
            "department_name": s.department.name if s.department else None,
            "eligible_count": eligible_count,
            "applied_count": applied_cnt,
            "approved_count": approved_cnt,
            "disbursed_count": disbursed_cnt,
            "total_disbursed_amount": float(disbursed_sum or 0)
        })
    return results

@router.get("/by-district")
def get_analytics_by_district(
    dept_id: Optional[int] = None,
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Geographical analytics across Gujarat districts with family counts and disbursed welfare funds.
    """
    target_dept = user_payload.dept_id if (user_payload.role == "officer" and user_payload.dept_id) else dept_id

    # Family counts per district
    fam_rows = db.query(
        Family.district,
        func.count(Family.family_id).label("families_count")
    ).group_by(Family.district).all()

    # Disbursals per district
    disb_q = db.query(
        Family.district,
        func.coalesce(func.sum(Application.disbursed_amount), 0).label("total_disbursed")
    ).join(Application, Application.family_id == Family.family_id).filter(Application.status == "Disbursed")

    if target_dept:
        disb_q = disb_q.join(Scheme, Application.scheme_id == Scheme.id).filter(Scheme.dept_id == target_dept)

    disb_rows = dict(disb_q.group_by(Family.district).all())

    results = []
    for district, count in fam_rows:
        dist_name = district or "Unassigned"
        results.append({
            "district": dist_name,
            "families_count": count,
            "total_disbursed": float(disb_rows.get(district, 0.0))
        })

    # Sort descending by families count
    results.sort(key=lambda x: x["families_count"], reverse=True)
    return results

@router.get("/delayed-applications")
def get_delayed_applications(
    dept_id: Optional[int] = None,
    days: int = 3,
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Returns specific applications that have been stuck in 'Applied' or 'Under Review' without progress.
    """
    target_dept = user_payload.dept_id if (user_payload.role == "officer" and user_payload.dept_id) else dept_id
    delayed = flag_delayed_applications(db, dept_id=target_dept, days=days)

    results = []
    for app in delayed:
        results.append({
            "application_id": app.id,
            "family_id": app.family_id,
            "scheme_id": app.scheme_id,
            "scheme_name": app.scheme.name if app.scheme else None,
            "status": app.status,
            "applied_on": app.applied_on,
            "last_updated": app.updated_at
        })
    return results
