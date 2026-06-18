from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.tenant import Tenant
from app.models.user import User, UserSession
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, AuthUserResponse
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from passlib.hash import bcrypt


async def register_tenant_and_owner(db: AsyncSession, req: RegisterRequest) -> AuthUserResponse:
    existing = await db.execute(select(Tenant).where(Tenant.subdomain == req.company_name_en.lower().replace(" ", "-")))
    if existing.scalar_one_or_none():
        raise ValueError("Company subdomain already exists")

    existing_user = await db.execute(select(User).where(User.email == req.email))
    if existing_user.scalar_one_or_none():
        raise ValueError("Email already registered")

    subdomain = req.company_name_en.lower().replace(" ", "-").replace("&", "and")[:100]

    tenant = Tenant(
        company_name_en=req.company_name_en,
        company_name_ar=req.company_name_ar,
        subdomain=subdomain,
        email=req.email,
        phone=req.phone,
        plan="starter",
        is_active=True,
        locale=req.locale,
    )
    db.add(tenant)
    await db.flush()

    user = User(
        tenant_id=tenant.id,
        email=req.email,
        phone=req.phone,
        password_hash=hash_password(req.password),
        name_en=req.name_en,
        name_ar=req.name_ar,
        role="tenant_owner",
        is_active=True,
        locale=req.locale,
    )
    db.add(user)
    await db.flush()

    return AuthUserResponse(
        id=str(user.id),
        email=user.email,
        name_en=user.name_en,
        name_ar=user.name_ar,
        role=user.role,
        tenant_id=str(tenant.id),
        locale=user.locale,
        is_active=user.is_active,
    )


async def authenticate_user(db: AsyncSession, req: LoginRequest) -> tuple[User, Tenant]:
    stmt = select(User).join(Tenant).where(User.email == req.email, User.is_active == True)
    if req.tenant_subdomain:
        stmt = stmt.where(Tenant.subdomain == req.tenant_subdomain)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user or not verify_password(req.password, user.password_hash):
        raise ValueError("Invalid email or password")
    tenant = await db.get(Tenant, user.tenant_id)
    if not tenant or not tenant.is_active:
        raise ValueError("Tenant account is inactive")
    return user, tenant


async def create_user_session(db: AsyncSession, user: User, ip_address: str = None, user_agent: str = None) -> TokenResponse:
    now = datetime.now(timezone.utc)
    access_token = create_access_token(subject=str(user.id), tenant_id=str(user.tenant_id), extra_claims={"role": user.role, "locale": user.locale})
    refresh_token = create_refresh_token(subject=str(user.id), tenant_id=str(user.tenant_id))
    refresh_hash = bcrypt.hash(refresh_token)

    session = UserSession(
        user_id=user.id,
        refresh_token_hash=refresh_hash,
        expires_at=now.replace(year=now.year + 1),
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.add(session)
    user.last_login_at = now
    await db.flush()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=30 * 60,
    )


async def refresh_user_session(db: AsyncSession, refresh_token: str) -> TokenResponse:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise ValueError("Invalid refresh token")

    user_id = payload.get("sub")
    user = await db.get(User, user_id)
    if not user or not user.is_active:
        raise ValueError("User not found or inactive")

    access_token = create_access_token(subject=str(user.id), tenant_id=str(user.tenant_id), extra_claims={"role": user.role, "locale": user.locale})
    new_refresh_token = create_refresh_token(subject=str(user.id), tenant_id=str(user.tenant_id))

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        expires_in=30 * 60,
    )


async def get_current_user(db: AsyncSession, user_id: str) -> AuthUserResponse:
    user = await db.get(User, user_id)
    if not user or not user.is_active:
        raise ValueError("User not found")
    return AuthUserResponse(
        id=str(user.id),
        email=user.email,
        name_en=user.name_en,
        name_ar=user.name_ar,
        role=user.role,
        tenant_id=str(user.tenant_id),
        locale=user.locale,
        is_active=user.is_active,
    )
