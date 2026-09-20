from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)

    schemes = relationship("Scheme", back_populates="department")
    officers = relationship("User", back_populates="department")


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dept_id = Column(Integer, ForeignKey("departments.id"))
    name = Column(String(100), nullable=False)
    description = Column(Text)
    min_income = Column(Numeric(12, 2))
    max_income = Column(Numeric(12, 2))
    category = Column(String(30))  # BPL, SC, ST, etc.
    required_condition_tag = Column(String(30))  # health rule
    required_class = Column(String(20))          # education rule
    min_percentage = Column(Float)               # education rule
    business_category = Column(String(30))       # business rule
    min_business_age = Column(Integer)           # business rule
    benefit_amount = Column(Numeric(12, 2))
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department", back_populates="schemes")
    applications = relationship("Application", back_populates="scheme")
    notifications = relationship("Notification", back_populates="scheme")
