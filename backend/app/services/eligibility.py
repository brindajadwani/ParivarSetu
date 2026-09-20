from typing import List
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
