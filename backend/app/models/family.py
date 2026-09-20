from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.core.database import Base

class Family(Base):
    __tablename__ = "families"

    family_id = Column(String(20), primary_key=True)
    head_name = Column(String(100), nullable=False)
    income = Column(Numeric(12, 2), nullable=False)
    category = Column(String(30))  # BPL/APL/SC/ST/OBC/General
    district = Column(String(50))
    ration_card_no = Column(String(30), unique=True)
    aadhaar_ref_masked = Column(String(20))
    status = Column(String(20), default="provisional")  # provisional/permanent/rejected
    health_tags = Column(ARRAY(String), default=list)
    education_tags = Column(ARRAY(String), default=list)
    business_tags = Column(ARRAY(String), default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    members = relationship("FamilyMember", back_populates="family", cascade="all, delete-orphan")
    health_records = relationship("HealthInfo", back_populates="family", cascade="all, delete-orphan")
    education_records = relationship("EducationInfo", back_populates="family", cascade="all, delete-orphan")
    business_records = relationship("BusinessInfo", back_populates="family", cascade="all, delete-orphan")
    bank_info = relationship("BankInfo", back_populates="family", uselist=False, cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="family")
    notifications = relationship("Notification", back_populates="family")


class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(Integer, primary_key=True, autoincrement=True)
    family_id = Column(String(20), ForeignKey("families.family_id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100))
    age = Column(Integer)
    gender = Column(String(10))
    relation = Column(String(30))  # head/spouse/child/parent
    occupation = Column(String(50))

    family = relationship("Family", back_populates="members")
    health_records = relationship("HealthInfo", back_populates="member", cascade="all, delete-orphan")
    education_records = relationship("EducationInfo", back_populates="member", cascade="all, delete-orphan")
    business_records = relationship("BusinessInfo", back_populates="member", cascade="all, delete-orphan")


class HealthInfo(Base):
    __tablename__ = "health_info"

    id = Column(Integer, primary_key=True, autoincrement=True)
    family_id = Column(String(20), ForeignKey("families.family_id", ondelete="CASCADE"), nullable=False)
    member_id = Column(Integer, ForeignKey("family_members.id", ondelete="CASCADE"))
    condition_tags = Column(ARRAY(String), default=list)  # ['pregnant','diabetic','disability']
    bpl_health_card = Column(Boolean, default=False)

    family = relationship("Family", back_populates="health_records")
    member = relationship("FamilyMember", back_populates="health_records")


class EducationInfo(Base):
    __tablename__ = "education_info"

    id = Column(Integer, primary_key=True, autoincrement=True)
    family_id = Column(String(20), ForeignKey("families.family_id", ondelete="CASCADE"), nullable=False)
    member_id = Column(Integer, ForeignKey("family_members.id", ondelete="CASCADE"))
    current_class = Column(String(20))
    school_or_college = Column(String(100))
    last_percentage = Column(Float)
    enrollment_status = Column(String(20), default="enrolled")

    family = relationship("Family", back_populates="education_records")
    member = relationship("FamilyMember", back_populates="education_records")


class BusinessInfo(Base):
    __tablename__ = "business_info"

    id = Column(Integer, primary_key=True, autoincrement=True)
    family_id = Column(String(20), ForeignKey("families.family_id", ondelete="CASCADE"), nullable=False)
    member_id = Column(Integer, ForeignKey("family_members.id", ondelete="CASCADE"))
    business_name = Column(String(100))
    business_type = Column(String(30))  # startup/MSME/small_business
    registration_status = Column(String(20))
    business_age_months = Column(Integer)
    annual_turnover = Column(Numeric(12, 2))

    family = relationship("Family", back_populates="business_records")
    member = relationship("FamilyMember", back_populates="business_records")


class BankInfo(Base):
    __tablename__ = "bank_info"

    id = Column(Integer, primary_key=True, autoincrement=True)
    family_id = Column(String(20), ForeignKey("families.family_id", ondelete="CASCADE"), unique=True, nullable=False)
    account_number_masked = Column(String(20))
    ifsc = Column(String(15))
    bank_name = Column(String(50))
    account_holder = Column(String(100))

    family = relationship("Family", back_populates="bank_info")
