from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class VehicleStatus(str, Enum):
    """차량 상태 열거형"""

    AVAILABLE = "available"  # 이용 가능
    IN_USE = "in_use"  # 사용 중
    MAINTENANCE = "maintenance"  # 정비 중
    OUT_OF_SERVICE = "out_of_service"  # 운행 불가


class VehicleType(str, Enum):
    """차량 유형 열거형"""

    SEDAN = "sedan"  # 승용차
    SUV = "suv"  # SUV
    TRUCK = "truck"  # 트럭
    VAN = "van"  # 밴
    MOTORCYCLE = "motorcycle"  # 오토바이
    BUS = "bus"  # 버스
    OTHER = "other"  # 기타


class VehicleBase(BaseModel):
    """차량 기본 모델"""

    make: str = Field(..., description="제조사")
    model: str = Field(..., description="모델명")
    year: int = Field(..., description="연식", ge=1900, le=datetime.now().year + 1)
    vehicle_type: str = Field(..., description="차량 유형 (sedan, suv, truck 등)")
    license_plate: str = Field(..., description="번호판")
    vin: str = Field(..., description="차대번호")
    color: Optional[str] = Field(None, description="색상")
    mileage: int = Field(0, description="주행거리(km)", ge=0)
    fuel_type: Optional[str] = Field(None, description="연료 유형")
    transmission: Optional[str] = Field(None, description="변속기 유형")
    engine: Optional[str] = Field(None, description="엔진 정보")
    features: List[str] = Field([], description="차량 특징/옵션")
    notes: Optional[str] = Field(None, description="메모")
    status: str = Field(
        "available", description="상태 (available, in_use, maintenance, out_of_service)"
    )


class VehicleCreate(VehicleBase):
    """차량 생성 모델"""

    organization_id: str = Field(..., description="소속 조직 ID")
    purchase_date: Optional[datetime] = Field(None, description="구매일")
    purchase_price: Optional[float] = Field(None, description="구매 가격")
    registration_date: Optional[datetime] = Field(None, description="등록일")
    insurance_info: Optional[Dict[str, Any]] = Field(None, description="보험 정보")
    inspection_date: Optional[datetime] = Field(None, description="검사일")
    next_inspection_date: Optional[datetime] = Field(None, description="다음 검사일")
    is_active: bool = Field(True, description="활성 상태 여부")


class VehicleUpdate(BaseModel):
    """차량 업데이트 모델"""

    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    vehicle_type: Optional[str] = None
    license_plate: Optional[str] = None
    vin: Optional[str] = None
    color: Optional[str] = None
    mileage: Optional[int] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    engine: Optional[str] = None
    features: Optional[List[str]] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    organization_id: Optional[str] = None
    purchase_date: Optional[datetime] = None
    purchase_price: Optional[float] = None
    registration_date: Optional[datetime] = None
    insurance_info: Optional[Dict[str, Any]] = None
    inspection_date: Optional[datetime] = None
    next_inspection_date: Optional[datetime] = None
    is_active: Optional[bool] = None


class VehicleResponse(VehicleBase):
    """차량 응답 모델"""

    id: str
    organization_id: str
    purchase_date: Optional[datetime] = None
    purchase_price: Optional[float] = None
    registration_date: Optional[datetime] = None
    insurance_info: Optional[Dict[str, Any]] = None
    inspection_date: Optional[datetime] = None
    next_inspection_date: Optional[datetime] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class VehicleListResponse(BaseModel):
    """차량 목록 응답"""

    items: List[VehicleResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
