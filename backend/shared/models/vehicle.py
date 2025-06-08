"""
Vehicle 관련 모델 정의

차량 정보와 관련된 데이터 모델들을 정의합니다.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class VehicleStatus(str, Enum):
    """차량 상태"""

    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    MAINTENANCE = "MAINTENANCE"
    RETIRED = "RETIRED"


class VehicleType(str, Enum):
    """차량 타입"""

    SEDAN = "SEDAN"
    SUV = "SUV"
    TRUCK = "TRUCK"
    VAN = "VAN"
    MOTORCYCLE = "MOTORCYCLE"
    OTHER = "OTHER"


class FuelType(str, Enum):
    """연료 타입"""

    GASOLINE = "GASOLINE"
    DIESEL = "DIESEL"
    ELECTRIC = "ELECTRIC"
    HYBRID = "HYBRID"
    LPG = "LPG"


class Vehicle(BaseModel):
    """차량 모델"""

    id: Optional[str] = None
    license_plate: str = Field(..., description="차량 번호판")
    user_id: Optional[str] = Field(None, description="소유자 ID")
    organization_id: Optional[str] = Field(None, description="조직 ID")

    # 차량 기본 정보
    make: Optional[str] = Field(None, description="제조사")
    model: Optional[str] = Field(None, description="모델명")
    year: Optional[int] = Field(None, description="연식")
    color: Optional[str] = Field(None, description="색상")
    vin: Optional[str] = Field(None, description="차대번호")

    # 차량 분류
    vehicle_type: Optional[VehicleType] = Field(None, description="차량 타입")
    fuel_type: Optional[FuelType] = Field(None, description="연료 타입")

    # 차량 상태
    status: VehicleStatus = Field(default=VehicleStatus.ACTIVE, description="차량 상태")
    mileage: Optional[int] = Field(None, description="주행거리 (km)")

    # 보험 및 등록 정보
    insurance_company: Optional[str] = Field(None, description="보험사")
    insurance_policy_number: Optional[str] = Field(None, description="보험증권번호")
    insurance_expiry_date: Optional[datetime] = Field(None, description="보험 만료일")
    registration_expiry_date: Optional[datetime] = Field(
        None, description="등록 만료일"
    )

    # 추가 정보
    notes: Optional[str] = Field(None, description="비고")
    tags: List[str] = Field(default_factory=list, description="태그")

    # 메타데이터
    created_at: Optional[datetime] = Field(None, description="생성일시")
    updated_at: Optional[datetime] = Field(None, description="수정일시")

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat() if v else None}
        use_enum_values = True


class VehicleCreate(BaseModel):
    """차량 생성 요청 모델"""

    license_plate: str = Field(..., description="차량 번호판")
    user_id: Optional[str] = Field(None, description="소유자 ID")
    organization_id: Optional[str] = Field(None, description="조직 ID")
    make: Optional[str] = Field(None, description="제조사")
    model: Optional[str] = Field(None, description="모델명")
    year: Optional[int] = Field(None, description="연식")
    color: Optional[str] = Field(None, description="색상")
    vin: Optional[str] = Field(None, description="차대번호")
    vehicle_type: Optional[VehicleType] = Field(None, description="차량 타입")
    fuel_type: Optional[FuelType] = Field(None, description="연료 타입")
    mileage: Optional[int] = Field(None, description="주행거리 (km)")
    notes: Optional[str] = Field(None, description="비고")
    tags: List[str] = Field(default_factory=list, description="태그")


class VehicleUpdate(BaseModel):
    """차량 수정 요청 모델"""

    license_plate: Optional[str] = Field(None, description="차량 번호판")
    make: Optional[str] = Field(None, description="제조사")
    model: Optional[str] = Field(None, description="모델명")
    year: Optional[int] = Field(None, description="연식")
    color: Optional[str] = Field(None, description="색상")
    vin: Optional[str] = Field(None, description="차대번호")
    vehicle_type: Optional[VehicleType] = Field(None, description="차량 타입")
    fuel_type: Optional[FuelType] = Field(None, description="연료 타입")
    status: Optional[VehicleStatus] = Field(None, description="차량 상태")
    mileage: Optional[int] = Field(None, description="주행거리 (km)")
    insurance_company: Optional[str] = Field(None, description="보험사")
    insurance_policy_number: Optional[str] = Field(None, description="보험증권번호")
    insurance_expiry_date: Optional[datetime] = Field(None, description="보험 만료일")
    registration_expiry_date: Optional[datetime] = Field(
        None, description="등록 만료일"
    )
    notes: Optional[str] = Field(None, description="비고")
    tags: List[str] = Field(default_factory=list, description="태그")


class VehicleResponse(BaseModel):
    """차량 응답 모델"""

    id: str
    license_plate: str
    user_id: Optional[str] = None
    organization_id: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    color: Optional[str] = None
    vin: Optional[str] = None
    vehicle_type: Optional[VehicleType] = None
    fuel_type: Optional[FuelType] = None
    status: VehicleStatus
    mileage: Optional[int] = None
    insurance_company: Optional[str] = None
    insurance_policy_number: Optional[str] = None
    insurance_expiry_date: Optional[datetime] = None
    registration_expiry_date: Optional[datetime] = None
    notes: Optional[str] = None
    tags: List[str] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
