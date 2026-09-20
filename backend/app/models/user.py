from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(200), nullable=False)
    role = Column(String(20), nullable=False)  # citizen / officer / verifier / admin
    dept_id = Column(Integer, ForeignKey("departments.id"), nullable=True)  # only for officers
    family_id = Column(String(20), ForeignKey("families.family_id"), nullable=True)  # only for citizens
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department", back_populates="officers")
    audit_logs = relationship("AuditLog", back_populates="user")
