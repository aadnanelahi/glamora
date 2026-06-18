from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TenantResponse(BaseModel):
    id: str
    company_name_en: str
    company_name_ar: Optional[str] = None
    subdomain: str
    custom_domain: Optional[str] = None
    email: str
    phone: Optional[str] = None
    plan: str
    is_active: bool
    locale: str
    created_at: datetime


class TenantListResponse(BaseModel):
    success: bool = True
    data: list[TenantResponse]
    meta: dict = {}
    error: Optional[str] = None
