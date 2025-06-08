"""
인증 관련 Pydantic 스키마
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """사용자 기본 정보"""
    email: EmailStr
    name: str = Field(..., min_length=1)
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)
    role: str = Field(default="USER")  # USER, MANAGER, ADMIN


class UserCreate(UserBase):
    """사용자 생성"""
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    """사용자 업데이트"""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None


class UserInDB(UserBase):
    """DB에 저장된 사용자"""
    id: str
    created_at: datetime
    updated_at: datetime
    hashed_password: str

    class Config:
        from_attributes = True


class UserResponse(UserBase):
    """사용자 응답"""
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """토큰 응답"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    """토큰 데이터"""
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None


class LoginRequest(BaseModel):
    """로그인 요청"""
    email: EmailStr
    password: str


class ChangePasswordRequest(BaseModel):
    """비밀번호 변경 요청"""
    current_password: str
    new_password: str = Field(..., min_length=8)


class RefreshTokenRequest(BaseModel):
    """토큰 갱신 요청"""
    refresh_token: str
