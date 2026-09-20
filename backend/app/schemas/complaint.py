from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ComplaintCreate(BaseModel):
    application_id: int
    message: str

class ComplaintResolve(BaseModel):
    officer_response: str

class ComplaintResponse(BaseModel):
    id: int
    application_id: int
    message: str
    status: str
    officer_response: Optional[str] = None
    created_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    family_id: str
    scheme_id: int
    scheme_name: Optional[str] = None
    message: str
    read: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
