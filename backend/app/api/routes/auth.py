from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User

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
    family_id: Optional[str] = None
    email: str

@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already registered")

    user = User(
        email=req.email,
        password_hash=get_password_hash(req.password),
        role=req.role.lower(),
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
        family_id=user.family_id,
        email=user.email
    )

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

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
        family_id=user.family_id,
        email=user.email
    )
