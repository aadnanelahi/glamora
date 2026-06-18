from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    tenant_subdomain: Optional[str] = None


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    name_en: str = Field(..., min_length=1, max_length=255)
    name_ar: Optional[str] = None
    phone: Optional[str] = None
    company_name_en: str = Field(..., min_length=1, max_length=255)
    company_name_ar: Optional[str] = None
    locale: str = "en"


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshRequest(BaseModel):
    refresh_token: str


class AuthUserResponse(BaseModel):
    id: str
    email: str
    name_en: str
    name_ar: Optional[str] = None
    role: str
    tenant_id: str
    locale: str
    is_active: bool


class LoginResponse(BaseModel):
    success: bool = True
    data: TokenResponse
    error: Optional[str] = None


class UserResponse(BaseModel):
    success: bool = True
    data: AuthUserResponse
    error: Optional[str] = None
