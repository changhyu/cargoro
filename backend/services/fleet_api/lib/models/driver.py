from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class DriverStatus(str, Enum):
    """운전자 상태"""

    ACTIVE = "active"  # 활성
    INACTIVE = "inactive"  # 비활성
    SUSPENDED = "suspended"  # 정지
    ON_LEAVE = "on_leave"  # 휴가
    TRAINING = "training"  # 교육중
    TERMINATED = "terminated"  # 퇴사


class LicenseType(str, Enum):
    """운전면허 종류"""

    CLASS1 = "1종보통"  # 1종보통 (테스트에서 사용)
    CLASS2 = "2종보통"  # 2종보통 (테스트에서 사용)
    TYPE_1_REGULAR = "1종보통"  # 1종보통
    TYPE_1_LARGE = "1종대형"  # 1종대형
    TYPE_1_SPECIAL = "1종특수"  # 1종특수
    TYPE_2_REGULAR = "2종보통"  # 2종보통
    TYPE_2_SMALL = "2종소형"  # 2종소형
    TYPE_2_MOTORCYCLE = "2종원동기"  # 2종원동기
    CONSTRUCTION_MACHINERY = "건설기계"  # 건설기계


class EmergencyContact(BaseModel):
    """비상 연락처 모델"""

    name: str = Field(..., description="비상 연락처 이름")
    phone: str = Field(..., description="비상 연락처 전화번호")
    relationship: str = Field(..., description="비상 연락처 관계")


class DriverBase(BaseModel):
    """운전자 기본 모델"""

    name: str = Field(..., description="운전자 이름")
    email: EmailStr = Field(..., description="운전자 이메일")
    phone: str = Field(..., description="운전자 전화번호")
    license_number: str = Field(..., description="운전 면허 번호")
    license_type: Optional[str] = Field(None, description="운전 면허 종류")
    license_expiry: datetime = Field(..., description="운전 면허 만료일")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "홍길동",
                    "email": "driver@example.com",
                    "phone": "010-1234-5678",
                    "license_number": "123-45-678900",
                    "license_type": "1종보통",
                    "license_expiry": "2025-12-31T00:00:00Z",
                }
            ]
        }
    }


class DriverCreate(DriverBase):
    """운전자 생성 모델"""

    organization_id: str = Field(..., description="소속 조직 ID")
    is_active: bool = Field(True, description="활성 상태 여부")
    restrictions: Optional[List[str]] = Field(None, description="운전 제한사항")
    notes: Optional[str] = Field(None, description="비고")
    emergency_contact: Optional[EmergencyContact] = Field(
        None, description="비상 연락처"
    )
    address: Optional[str] = Field(None, description="주소")
    birth_date: Optional[datetime] = Field(None, description="생년월일")
    hire_date: Optional[datetime] = Field(None, description="입사일")
    department: Optional[str] = Field(None, description="부서")
    position: Optional[str] = Field(None, description="직책")
    profile_image_url: Optional[str] = Field(None, description="프로필 이미지 URL")


class DriverUpdate(BaseModel):
    """운전자 업데이트 모델"""

    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    license_number: Optional[str] = None
    license_type: Optional[str] = None
    license_expiry: Optional[datetime] = None
    is_active: Optional[bool] = None
    restrictions: Optional[List[str]] = None
    notes: Optional[str] = None
    emergency_contact: Optional[EmergencyContact] = None
    address: Optional[str] = None
    birth_date: Optional[datetime] = None
    hire_date: Optional[datetime] = None
    department: Optional[str] = None
    position: Optional[str] = None
    profile_image_url: Optional[str] = None
    organization_id: Optional[str] = None


class DriverResponse(DriverBase):
    """운전자 응답 모델"""

    id: str
    organization_id: str
    is_active: bool
    restrictions: Optional[List[str]] = None
    notes: Optional[str] = None
    assigned_vehicles: Optional[List[str]] = None
    emergency_contact: Optional[EmergencyContact] = None
    address: Optional[str] = None
    birth_date: Optional[datetime] = None
    hire_date: Optional[datetime] = None
    department: Optional[str] = None
    position: Optional[str] = None
    profile_image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}  # Pydantic v2 형식


class DriverFilters(BaseModel):
    """운전자 필터링 옵션"""

    name: Optional[str] = None
    email: Optional[str] = None
    license_number: Optional[str] = None
    is_active: Optional[bool] = None
    organization_id: Optional[str] = None
    license_expiry_before: Optional[datetime] = None
    license_expiry_after: Optional[datetime] = None
    page: int = Field(1, ge=1, description="페이지 번호")
    page_size: int = Field(10, ge=1, le=100, description="페이지 크기")


class DriverListResponse(BaseModel):
    """운전자 목록 응답"""

    items: List[DriverResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
