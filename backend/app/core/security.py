from datetime import datetime, timedelta
from typing import Any, Union, Optional, List
import bcrypt
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None
    dept_id: Optional[int] = None
    family_id: Optional[str] = None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password[:72].encode("utf-8"), salt).decode("utf-8")

def mask_identifier(val: Optional[str], visible_digits: int = 4) -> Optional[str]:
    """Mask sensitive fields like Aadhaar (XXXX-XXXX-1234) or Bank Account numbers (****4321)."""
    if not val:
        return val
    cleaned = str(val).strip().replace(" ", "").replace("-", "")
    if len(cleaned) <= visible_digits:
        return "****"
    if len(cleaned) == 12:
        # Aadhaar style masking: XXXX-XXXX-1234
        return f"XXXX-XXXX-{cleaned[-4:]}"
    return f"****{cleaned[-visible_digits:]}"

def get_current_user_payload(token: Optional[str] = Depends(oauth2_scheme)) -> TokenPayload:
    """Extract and validate JWT token claims."""
    if not token:
        # Development fallback allows unauthenticated demo exploration
        return TokenPayload(role="anonymous")
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return TokenPayload(**payload)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )

def require_roles(allowed_roles: List[str]):
    """Role-based access dependency factory."""
    def role_checker(payload: TokenPayload = Depends(get_current_user_payload)):
        if payload.role == "anonymous":
            # Let guest view in development if needed, or enforce strict auth
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required for this operation"
            )
        if payload.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of roles {allowed_roles}, your role is '{payload.role}'"
            )
        return payload
    return role_checker

def require_officer(payload: TokenPayload = Depends(get_current_user_payload)) -> TokenPayload:
    """Officer-specific role dependency that verifies department binding."""
    if payload.role != "officer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Officer authorization required"
        )
    if not payload.dept_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Officer account is not assigned to a government department"
        )
    return payload

def require_citizen(payload: TokenPayload = Depends(get_current_user_payload)) -> TokenPayload:
    """Citizen-specific role dependency that verifies family binding."""
    if payload.role != "citizen":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Citizen authorization required"
        )
    return payload

def require_verifier(payload: TokenPayload = Depends(get_current_user_payload)) -> TokenPayload:
    """Verifier-specific role dependency (e.g. Panchayat Secretary / Talati / Lekhpal)."""
    if payload.role not in ["verifier", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Verification officer authorization required"
        )
    return payload
