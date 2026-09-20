from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DepartmentResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class SchemeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    min_income: Optional[float] = None
    max_income: Optional[float] = None
    category: Optional[str] = None
    required_condition_tag: Optional[str] = None
    required_class: Optional[str] = None
    min_percentage: Optional[float] = None
    business_category: Optional[str] = None
    min_business_age: Optional[int] = None
    benefit_amount: Optional[float] = None
    active: bool = True

class SchemeResponse(SchemeCreate):
    id: int
    dept_id: Optional[int]
    created_at: Optional[datetime]
    department_name: Optional[str] = None

    class Config:
        from_attributes = True
