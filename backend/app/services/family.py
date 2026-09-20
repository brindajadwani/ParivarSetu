import random
import string
from sqlalchemy.orm import Session
from app.models.family import Family, HealthInfo, EducationInfo, BusinessInfo

def generate_family_id(db: Session = None, prefix: str = "GJ") -> str:
    """Generate a unique 12-character Family ID (e.g., GJ1234567890)."""
    while True:
        digits = "".join(random.choices(string.digits, k=10))
        candidate_id = f"{prefix}{digits}"
        if db is None:
            return candidate_id
        exists = db.query(Family).filter(Family.family_id == candidate_id).first()
        if not exists:
            return candidate_id

def sync_family_tags(family_id: str, db: Session) -> Family:
    """Recompute denormalized health_tags, education_tags, and business_tags on the family record."""
    family = db.query(Family).filter(Family.family_id == family_id).first()
    if not family:
        return None

    # Collect health tags
    health_records = db.query(HealthInfo).filter(HealthInfo.family_id == family_id).all()
    health_tags = set()
    for h in health_records:
        if h.condition_tags:
            health_tags.update(h.condition_tags)
        if h.bpl_health_card:
            health_tags.add("bpl_health_card")

    # Collect education tags
    edu_records = db.query(EducationInfo).filter(EducationInfo.family_id == family_id).all()
    edu_tags = set()
    for e in edu_records:
        if e.current_class:
            edu_tags.add(f"class:{e.current_class.lower()}")
        if e.enrollment_status:
            edu_tags.add(f"status:{e.enrollment_status.lower()}")

    # Collect business tags
    biz_records = db.query(BusinessInfo).filter(BusinessInfo.family_id == family_id).all()
    biz_tags = set()
    for b in biz_records:
        if b.business_type:
            biz_tags.add(b.business_type.lower())
        if b.registration_status:
            biz_tags.add(b.registration_status.lower())

    family.health_tags = list(health_tags)
    family.education_tags = list(edu_tags)
    family.business_tags = list(biz_tags)
    db.commit()
    db.refresh(family)
    return family
