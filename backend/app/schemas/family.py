from pydantic import BaseModel, ConfigDict, field_validator
from typing import List, Optional
from datetime import datetime

class MemberCreate(BaseModel):
    name: str
    age: int
    gender: str
    relation: str
    occupation: Optional[str] = None

class MemberResponse(MemberCreate):
    id: int
    family_id: str
    model_config = ConfigDict(from_attributes=True)

class HealthInfoCreate(BaseModel):
    member_id: Optional[int] = None
    condition_tags: List[str] = []
    bpl_health_card: bool = False

class EducationInfoCreate(BaseModel):
    member_id: Optional[int] = None
    current_class: Optional[str] = None
    school_or_college: Optional[str] = None
    last_percentage: Optional[float] = None
    enrollment_status: Optional[str] = "enrolled"

class BusinessInfoCreate(BaseModel):
    member_id: Optional[int] = None
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    registration_status: Optional[str] = "unregistered"
    business_age_months: Optional[int] = None
    annual_turnover: Optional[float] = None

class BankInfoCreate(BaseModel):
    account_number: str
    ifsc: str
    bank_name: str
    account_holder: str

class BankInfoResponse(BaseModel):
    id: int
    family_id: str
    account_number_masked: str
    ifsc: str
    bank_name: str
    account_holder: str
    model_config = ConfigDict(from_attributes=True)

class FamilyRegisterRequest(BaseModel):
    head_name: str
    income: float
    category: str
    district: str
    ration_card_no: Optional[str] = None
    aadhaar_no: Optional[str] = None  # Will be masked on intake

class FamilyResponse(BaseModel):
    family_id: str
    head_name: str
    income: float
    category: Optional[str]
    district: Optional[str]
    ration_card_no: Optional[str]
    aadhaar_ref_masked: Optional[str]
    status: str
    health_tags: List[str] = []
    education_tags: List[str] = []
    business_tags: List[str] = []
    created_at: Optional[datetime] = None
    members: List[MemberResponse] = []
    bank_info: Optional[BankInfoResponse] = None
    model_config = ConfigDict(from_attributes=True)

