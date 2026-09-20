from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    family_id = Column(String(20), ForeignKey("families.family_id"), nullable=False)
    member_id = Column(Integer, ForeignKey("family_members.id"), nullable=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=False)
    status = Column(String(20), default="Notified")
    # Notified -> Applied -> Under Review -> Approved -> Disbursed
    #                                     \-> Rejected
    # Applied/Under Review -> Escalated (via complaint)
    disbursed_amount = Column(Numeric(12, 2))
    txn_id = Column(String(50))
    applied_on = Column(DateTime)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("family_id", "member_id", "scheme_id", name="uq_app_family_member_scheme"),
    )

    family = relationship("Family", back_populates="applications")
    member = relationship("FamilyMember")
    scheme = relationship("Scheme", back_populates="applications")
    complaints = relationship("Complaint", back_populates="application")
