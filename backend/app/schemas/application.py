from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ApplicationCreate(BaseModel):
    family_id: str
    member_id: Optional[int] = None
    scheme_id: int

class ApplicationStatusUpdate(BaseModel):
    status: str

class DisburseRequest(BaseModel):
    amount: float

class ApplicationResponse(BaseModel):
    id: int
    family_id: str
    member_id: Optional[int]
    scheme_id: int
    scheme_name: Optional[str] = None
    status: str
    disbursed_amount: Optional[float]
    txn_id: Optional[str]
    applied_on: Optional[datetime]
    updated_at: Optional[datetime]
    model_config = ConfigDict(from_attributes=True)

