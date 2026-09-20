from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.family import Family, EducationInfo, BusinessInfo
from app.models.scheme import Scheme

def get_eligible_families(scheme_id: int, db: Session) -> List[Family]:
    """
    Generic Eligibility Engine.
    Dynamically builds queries from schemes table row fields.
    Works for any department without hardcoding.
    """
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme or not scheme.active:
        return []

    query = db.query(Family).filter(Family.status != "rejected")

    # Income bounds
    if scheme.min_income is not None:
        query = query.filter(Family.income >= scheme.min_income)
    if scheme.max_income is not None:
        query = query.filter(Family.income <= scheme.max_income)

    # Social Category filter
    if scheme.category:
        query = query.filter(Family.category.ilike(scheme.category))

    # Health condition rule (array contains check)
    if scheme.required_condition_tag:
        query = query.filter(Family.health_tags.any(scheme.required_condition_tag))

    # Education rule
    if scheme.required_class or scheme.min_percentage is not None:
        query = query.join(EducationInfo, EducationInfo.family_id == Family.family_id)
        if scheme.required_class:
            query = query.filter(EducationInfo.current_class.ilike(scheme.required_class))
        if scheme.min_percentage is not None:
            query = query.filter(EducationInfo.last_percentage >= scheme.min_percentage)

    # Business rule
    if scheme.business_category or scheme.min_business_age is not None:
        query = query.join(BusinessInfo, BusinessInfo.family_id == Family.family_id)
        if scheme.business_category:
            query = query.filter(BusinessInfo.business_type.ilike(scheme.business_category))
        if scheme.min_business_age is not None:
            query = query.filter(BusinessInfo.business_age_months >= scheme.min_business_age)

    return query.distinct().all()

def get_schemes_for_family(family_id: str, db: Session) -> List[Dict[str, Any]]:
    """
    Evaluates all active government schemes against a specific family.
    Returns matched schemes with eligibility reasons.
    """
    family = db.query(Family).filter(Family.family_id == family_id).first()
    if not family or family.status == "rejected":
        return []

    active_schemes = db.query(Scheme).filter(Scheme.active == True).all()
    eligible_schemes = []

    for scheme in active_schemes:
        # Check income
        if scheme.min_income is not None and family.income < scheme.min_income:
            continue
        if scheme.max_income is not None and family.income > scheme.max_income:
            continue

        # Check Category
        if scheme.category and family.category and scheme.category.lower() != family.category.lower():
            continue

        # Check Health tag
        if scheme.required_condition_tag:
            family_health = family.health_tags or []
            if scheme.required_condition_tag not in family_health:
                continue

        # Check Education criteria
        if scheme.required_class or scheme.min_percentage is not None:
            edu_records = db.query(EducationInfo).filter(EducationInfo.family_id == family_id).all()
            matched_edu = False
            for edu in edu_records:
                class_ok = True
                pct_ok = True
                if scheme.required_class:
                    class_ok = bool(edu.current_class and edu.current_class.lower() == scheme.required_class.lower())
                if scheme.min_percentage is not None:
                    pct_ok = bool(edu.last_percentage and edu.last_percentage >= scheme.min_percentage)
                if class_ok and pct_ok:
                    matched_edu = True
                    break
            if not matched_edu:
                continue

        # Check Business criteria
        if scheme.business_category or scheme.min_business_age is not None:
            biz_records = db.query(BusinessInfo).filter(BusinessInfo.family_id == family_id).all()
            matched_biz = False
            for biz in biz_records:
                cat_ok = True
                age_ok = True
                if scheme.business_category:
                    cat_ok = bool(biz.business_type and biz.business_type.lower() == scheme.business_category.lower())
                if scheme.min_business_age is not None:
                    age_ok = bool(biz.business_age_months and biz.business_age_months >= scheme.min_business_age)
                if cat_ok and age_ok:
                    matched_biz = True
                    break
            if not matched_biz:
                continue

        eligible_schemes.append({
            "id": scheme.id,
            "dept_id": scheme.dept_id,
            "department_name": scheme.department.name if scheme.department else None,
            "name": scheme.name,
            "description": scheme.description,
            "benefit_amount": float(scheme.benefit_amount or 0),
            "max_income": float(scheme.max_income) if scheme.max_income else None
        })

    return eligible_schemes
