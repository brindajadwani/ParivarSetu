from datetime import datetime
from fastapi import APIRouter, Depends, Query
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user_payload, TokenPayload
from app.models.family import Family, FamilyMember
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

@router.get("/admin-dashboard")
def get_admin_dashboard_analytics(
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Comprehensive Statewide Executive Intelligence & Proactive Saturation Gap Analysis
    for State Administrators (Government of Gujarat).
    Includes:
      - Total registered families (Permanent vs Provisional) & Citizen counts
      - Total amount disbursed / deducted department-wise
      - Pending applications caseload & SLA breaches (> 3 days)
      - Proactive Gap Analysis: Eligible families vs actually applied families per scheme
      - District performance saturation
    """
    # 1. Families counts
    total_families = db.query(Family).count()
    permanent_families = db.query(Family).filter(Family.status == "permanent").count()
    provisional_families = db.query(Family).filter(Family.status == "provisional").count()
    total_citizens = db.query(FamilyMember).count()

    # 2. Financial Disbursals
    total_disbursed = float(db.query(func.coalesce(func.sum(Application.disbursed_amount), 0)).filter(
        Application.status == "Disbursed"
    ).scalar() or 0)

    # 3. Application Caseload
    all_apps = db.query(Application).all()
    total_applications = len(all_apps)
    pending_statuses = {"Applied", "Under Review", "Escalated"}
    pending_applications = sum(1 for a in all_apps if a.status in pending_statuses)
    approved_applications = sum(1 for a in all_apps if a.status in {"Approved", "Disbursed"})
    disbursed_applications = sum(1 for a in all_apps if a.status == "Disbursed")
    rejected_applications = sum(1 for a in all_apps if a.status == "Rejected")

    # 4. Grievances & SLA
    open_complaints = db.query(Complaint).filter(Complaint.status == "Open").count()
    total_complaints = db.query(Complaint).count()
    delayed_apps = flag_delayed_applications(db, dept_id=None, days=3)
    delayed_count = len(delayed_apps)

    # 5. Schemes & Proactive Saturation Gap Analysis
    active_schemes = db.query(Scheme).filter(Scheme.active == True).all()
    all_depts = db.query(Department).all()

    schemes_gap = []
    total_eligible_instances = 0
    total_eligible_not_applied = 0

    # Cache application counts per scheme
    app_by_scheme = {}
    for a in all_apps:
        app_by_scheme.setdefault(a.scheme_id, []).append(a)

    for s in active_schemes:
        eligible_fams = get_eligible_families(s.id, db)
        eligible_count = len(eligible_fams)
        s_apps = app_by_scheme.get(s.id, [])
        applied_count = len(s_apps)
        
        # Eligible but not yet applied
        gap_count = max(0, eligible_count - applied_count)
        saturation_pct = round((applied_count / eligible_count * 100), 1) if eligible_count > 0 else (100.0 if applied_count > 0 else 0.0)
        
        s_pending = sum(1 for a in s_apps if a.status in pending_statuses)
        s_approved = sum(1 for a in s_apps if a.status == "Approved")
        s_disbursed = sum(1 for a in s_apps if a.status == "Disbursed")
        s_disbursed_amt = sum(float(a.disbursed_amount or 0) for a in s_apps if a.status == "Disbursed")
        unclaimed_outlay = gap_count * float(s.benefit_amount or 0)

        total_eligible_instances += eligible_count
        total_eligible_not_applied += gap_count

        schemes_gap.append({
            "scheme_id": s.id,
            "scheme_name": s.name,
            "department_id": s.dept_id,
            "department_name": s.department.name if s.department else "General",
            "benefit_amount": float(s.benefit_amount or 0),
            "eligible_count": eligible_count,
            "applied_count": applied_count,
            "eligible_not_applied": gap_count,
            "saturation_rate": saturation_pct,
            "pending_count": s_pending,
            "approved_count": s_approved,
            "disbursed_count": s_disbursed,
            "total_disbursed_amount": s_disbursed_amt,
            "unclaimed_outlay": unclaimed_outlay
        })

    # Sort schemes by gap descending (top unreached first)
    schemes_gap.sort(key=lambda x: x["eligible_not_applied"], reverse=True)

    # 6. Department-wise Breakdown
    dept_analysis = []
    for d in all_depts:
        d_schemes = [s for s in active_schemes if s.dept_id == d.id]
        d_scheme_ids = {s.id for s in d_schemes}
        d_apps = [a for a in all_apps if a.scheme_id in d_scheme_ids]

        d_total_apps = len(d_apps)
        d_pending = sum(1 for a in d_apps if a.status in pending_statuses)
        d_approved = sum(1 for a in d_apps if a.status == "Approved")
        d_disbursed = sum(1 for a in d_apps if a.status == "Disbursed")
        d_rejected = sum(1 for a in d_apps if a.status == "Rejected")
        d_disbursed_amt = sum(float(a.disbursed_amount or 0) for a in d_apps if a.status == "Disbursed")

        d_gaps = [sg for sg in schemes_gap if sg["department_id"] == d.id]
        d_eligible_count = sum(sg["eligible_count"] for sg in d_gaps)
        d_gap_count = sum(sg["eligible_not_applied"] for sg in d_gaps)
        d_saturation = round((d_total_apps / d_eligible_count * 100), 1) if d_eligible_count > 0 else (100.0 if d_total_apps > 0 else 0.0)

        # Department delayed apps
        d_delayed = sum(1 for app in delayed_apps if app.scheme and app.scheme.dept_id == d.id)

        # Department complaints
        d_open_complaints = db.query(Complaint).join(
            Application, Complaint.application_id == Application.id
        ).join(
            Scheme, Application.scheme_id == Scheme.id
        ).filter(
            Scheme.dept_id == d.id,
            Complaint.status == "Open"
        ).count()

        dept_analysis.append({
            "dept_id": d.id,
            "department_name": d.name,
            "schemes_count": len(d_schemes),
            "total_applications": d_total_apps,
            "pending_applications": d_pending,
            "approved_applications": d_approved,
            "disbursed_applications": d_disbursed,
            "rejected_applications": d_rejected,
            "total_disbursed_amount": d_disbursed_amt,
            "eligible_instances": d_eligible_count,
            "eligible_not_applied": d_gap_count,
            "saturation_rate": d_saturation,
            "delayed_count": d_delayed,
            "open_complaints_count": d_open_complaints
        })

    # Sort departments by total disbursed amount descending
    dept_analysis.sort(key=lambda x: x["total_disbursed_amount"], reverse=True)

    # 7. District Saturation
    fam_rows = db.query(
        Family.district,
        func.count(Family.family_id).label("families_count")
    ).group_by(Family.district).all()

    district_analysis = []
    for dist, count in fam_rows:
        dist_name = dist or "Unassigned"
        dist_apps = [a for a in all_apps if a.family and a.family.district == dist]
        dist_disbursed = sum(float(a.disbursed_amount or 0) for a in dist_apps if a.status == "Disbursed")
        dist_pending = sum(1 for a in dist_apps if a.status in pending_statuses)
        district_analysis.append({
            "district": dist_name,
            "families_count": count,
            "total_applications": len(dist_apps),
            "total_disbursed": dist_disbursed,
            "pending_applications": dist_pending
        })
    district_analysis.sort(key=lambda x: x["families_count"], reverse=True)

    # 8. Delayed Bottlenecks List
    delayed_bottlenecks = []
    for app in delayed_apps:
        delayed_bottlenecks.append({
            "application_id": app.id,
            "family_id": app.family_id,
            "scheme_name": app.scheme.name if app.scheme else "N/A",
            "department_name": app.scheme.department.name if app.scheme and app.scheme.department else "N/A",
            "status": app.status,
            "applied_on": app.applied_on.isoformat() if app.applied_on else None,
            "days_pending": (datetime.utcnow() - app.applied_on).days if app.applied_on else 3
        })

    overall_sat = round((total_applications / total_eligible_instances * 100), 1) if total_eligible_instances > 0 else 0.0

    return {
        "executive_summary": {
            "total_registered_families": total_families,
            "permanent_families": permanent_families,
            "provisional_families": provisional_families,
            "total_citizens_count": total_citizens,
            "total_disbursed_amount": total_disbursed,
            "total_applications": total_applications,
            "total_pending_applications": pending_applications,
            "total_approved_applications": approved_applications,
            "total_disbursed_applications": disbursed_applications,
            "total_rejected_applications": rejected_applications,
            "total_eligible_instances": total_eligible_instances,
            "total_eligible_not_applied": total_eligible_not_applied,
            "overall_saturation_rate": overall_sat,
            "delayed_sla_breaches": delayed_count,
            "total_open_grievances": open_complaints,
            "total_grievances": total_complaints
        },
        "department_wise_analysis": dept_analysis,
        "proactive_gap_analysis": schemes_gap,
        "district_saturation": district_analysis,
        "delayed_bottlenecks": delayed_bottlenecks
    }
