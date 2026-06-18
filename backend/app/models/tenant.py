from sqlalchemy import Column, String, Boolean, JSON
from app.models.base import BaseModel


class Tenant(BaseModel):
    __tablename__ = "tenants"

    company_name_en = Column(String(255), nullable=False)
    company_name_ar = Column(String(255), nullable=True)
    subdomain = Column(String(100), unique=True, nullable=False, index=True)
    custom_domain = Column(String(255), nullable=True, unique=True)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    plan = Column(String(50), default="starter", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    locale = Column(String(10), default="en", nullable=False)
    features = Column(JSON, default=dict, nullable=True)
    settings = Column(JSON, default=dict, nullable=True)
