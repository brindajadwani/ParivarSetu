from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    get_current_user_payload,
    TokenPayload
)
from app.models.user import User
from app.models.scheme import Department
from app.models.family import Family

router = APIRouter()

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: str  # citizen / officer / verifier / admin
    dept_id: Optional[int] = None
    family_id: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    dept_id: Optional[int] = None
    department_name: Optional[str] = None
    family_id: Optional[str] = None
    email: str

class UserProfileResponse(BaseModel):
    id: int
    email: str
    role: str
    dept_id: Optional[int] = None
    department_name: Optional[str] = None
    family_id: Optional[str] = None
    created_at: Optional[Any] = None

@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    role = req.role.lower().strip()
    valid_roles = ["citizen", "officer", "verifier", "admin"]
    if role not in valid_roles:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid role '{role}'. Allowed roles: {valid_roles}"
        )

    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already registered")

    # If officer, validate department exists
    dept_name = None
    if role == "officer":
        if not req.dept_id:
            raise HTTPException(status_code=400, detail="dept_id is required for government officer accounts")
        dept = db.query(Department).filter(Department.id == req.dept_id).first()
        if not dept:
            raise HTTPException(status_code=404, detail="Specified department does not exist")
        dept_name = dept.name

    # If citizen and family_id provided, validate family exists
    if role == "citizen" and req.family_id:
        family = db.query(Family).filter(Family.family_id == req.family_id).first()
        if not family:
            raise HTTPException(status_code=404, detail="Specified family_id does not exist")

    user = User(
        email=req.email,
        password_hash=get_password_hash(req.password),
        role=role,
        dept_id=req.dept_id,
        family_id=req.family_id
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({
        "sub": user.email,
        "user_id": user.id,
        "role": user.role,
        "dept_id": user.dept_id,
        "family_id": user.family_id
    })

    return TokenResponse(
        access_token=token,
        role=user.role,
        dept_id=user.dept_id,
        department_name=dept_name,
        family_id=user.family_id,
        email=user.email
    )

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )

    dept_name = user.department.name if user.department else None

    token = create_access_token({
        "sub": user.email,
        "user_id": user.id,
        "role": user.role,
        "dept_id": user.dept_id,
        "family_id": user.family_id
    })

    return TokenResponse(
        access_token=token,
        role=user.role,
        dept_id=user.dept_id,
        department_name=dept_name,
        family_id=user.family_id,
        email=user.email
    )

@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(
    user_payload: TokenPayload = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    if user_payload.role == "anonymous":
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db.query(User).filter(User.id == user_payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserProfileResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        dept_id=user.dept_id,
        department_name=user.department.name if user.department else None,
        family_id=user.family_id,
        created_at=user.created_at
    )
