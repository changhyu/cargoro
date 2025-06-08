from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
from prisma.enums import UserRole


# 사용자 모델
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    profile_image: Optional[str] = None


class UserCreate(UserBase):
    password_hash: str
    role: Optional[UserRole] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

    model_config = ConfigDict(extra="forbid")


class UserResponse(UserBase):
    id: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime
    organization_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# 권한이 포함된 사용자 모델
class UserWithPermissions(UserResponse):
    permissions: List[str] = []

    model_config = ConfigDict(from_attributes=True)


# 권한 모델
class PermissionBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None


class PermissionCreate(PermissionBase):
    pass


class PermissionUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

    model_config = ConfigDict(extra="forbid")


class PermissionResponse(PermissionBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# 역할-권한 모델
class RolePermissionCreate(BaseModel):
    role: UserRole
    permission_id: str


# 사용자-권한 모델
class UserPermissionCreate(BaseModel):
    user_id: str
    permission_id: str
    granted: bool = True


# 인증 모델
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenResponse(Token):
    expires_in: int
    user: UserResponse


class TokenData(BaseModel):
    sub: str  # 사용자 ID
    email: Optional[str] = None
    role: Optional[UserRole] = None
    permissions: List[str] = []
    exp: Optional[datetime] = None


# 조직 모델
class OrganizationBase(BaseModel):
    name: str
    description: Optional[str] = None
    business_number: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    business_number: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None

    model_config = ConfigDict(extra="forbid")


class OrganizationResponse(OrganizationBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# 조직 멤버 모델
class OrganizationMemberResponse(BaseModel):
    id: str
    user_id: str
    organization_id: str
    role: UserRole
    is_active: bool
    joined_at: datetime
    user: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
