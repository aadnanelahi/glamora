from enum import Enum
from functools import wraps
from fastapi import HTTPException, status, Depends
from typing import Callable


class Role(str, Enum):
    SUPER_ADMIN = "super_admin"
    TENANT_OWNER = "tenant_owner"
    BRANCH_MANAGER = "branch_manager"
    RECEPTIONIST = "receptionist"
    STYLIST = "stylist"
    CASHIER = "cashier"
    CUSTOMER = "customer"


PERMISSIONS_MATRIX = {
    Role.SUPER_ADMIN: [
        "tenant:create", "tenant:read", "tenant:update", "tenant:delete",
        "tenant:suspend", "tenant:reactivate",
        "user:impersonate",
        "billing:read", "billing:manage",
        "plan:create", "plan:update", "plan:delete",
        "system:health", "system:configure",
        "analytics:platform",
        "notification:broadcast",
    ],
    Role.TENANT_OWNER: [
        "branch:create", "branch:read", "branch:update", "branch:delete",
        "staff:create", "staff:read", "staff:update", "staff:delete",
        "appointment:create", "appointment:read", "appointment:update", "appointment:delete",
        "appointment:cancel", "appointment:reschedule",
        "client:create", "client:read", "client:update", "client:delete",
        "inventory:create", "inventory:read", "inventory:update", "inventory:delete",
        "report:read", "report:export",
        "finance:read", "finance:manage",
        "settings:read", "settings:update",
        "loyalty:configure", "loyalty:manage",
        "notification:configure",
        "payment:refund",
    ],
    Role.BRANCH_MANAGER: [
        "branch:read",
        "staff:read", "staff:update",
        "appointment:create", "appointment:read", "appointment:update", "appointment:cancel",
        "client:create", "client:read", "client:update",
        "inventory:read", "inventory:update",
        "report:read",
        "finance:read",
        "payment:refund",
    ],
    Role.RECEPTIONIST: [
        "appointment:create", "appointment:read", "appointment:update", "appointment:cancel",
        "client:create", "client:read", "client:update",
        "payment:process",
    ],
    Role.STYLIST: [
        "appointment:read", "appointment:update",
        "client:read",
    ],
    Role.CASHIER: [
        "appointment:read",
        "client:read",
        "payment:process",
        "payment:refund",
        "inventory:read",
    ],
    Role.CUSTOMER: [
        "appointment:create", "appointment:read", "appointment:cancel",
        "client:read",
        "loyalty:read",
    ],
}


def require_permission(permission: str):
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request = kwargs.get("request")
            if not request:
                for arg in args:
                    if hasattr(arg, "state") and hasattr(arg.state, "user_role"):
                        request = arg
                        break
            user_role = getattr(request.state, "user_role", None) if request else None
            if not user_role:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Authentication required")
            allowed = PERMISSIONS_MATRIX.get(Role(user_role), [])
            if permission not in allowed:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_roles(roles: list[Role]):
    async def role_checker(request: Request):
        user_role = getattr(request.state, "user_role", None)
        if not user_role or Role(user_role) not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return role_checker
