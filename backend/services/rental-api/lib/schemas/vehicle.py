"""
차량 관련 Pydantic 스키마
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

from ..models.enums import (
    VehicleStatus,
    FuelType,
    TransmissionType,
    VehicleCategory
)


class VehicleBase(BaseModel):
    """차량 기본 정보"""
    registration_number: str = Field(..., description="차량 번호판")
    make: str = Field(..., description="제조사")
    model: str = Field(..., description="모델명")
    year: int = Field(..., ge=1900, le=2100, description="연식")
    color: str = Field(..., description="색상")
    vin: str = Field(..., description="차대번호")
    status: VehicleStatus = Field(default=VehicleStatus.AVAILABLE, description="차량 상태")
    mileage: int = Field(..., ge=0, description="주행거리(km)")
    fuel_type: FuelType = Field(..., description="연료 유형")
    transmission: TransmissionType = Field(..., description="변속기 유형")
    category: VehicleCategory = Field(..., description="차량 카테고리")
    features: List[str] = Field(default_factory=list, description="차량 옵션")
    images: List[str] = Field(default_factory=list, description="차량 이미지 URL")
    purchase_date: datetime = Field(..., description="구매일")
    purchase_price: float = Field(..., ge=0, description="구매가격")
    current_value: float = Field(..., ge=0, description="현재가치")
    last_maintenance_date: datetime = Field(..., description="최근 정비일")
    next_maintenance_date: datetime = Field(..., description="다음 정비 예정일")


class VehicleCreate(VehicleBase):
    """차량 생성 스키마"""
    pass


class VehicleUpdate(BaseModel):
    """차량 업데이트 스키마"""
    status: Optional[VehicleStatus] = None
    mileage: Optional[int] = Field(None, ge=0)
    current_value: Optional[float] = Field(None, ge=0)
    last_maintenance_date: Optional[datetime] = None
    next_maintenance_date: Optional[datetime] = None
    features: Optional[List[str]] = None
    images: Optional[List[str]] = None


class VehicleInDB(VehicleBase):
    """DB에 저장된 차량 정보"""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VehicleResponse(VehicleInDB):
    """차량 응답 스키마"""
    pass


class VehicleListResponse(BaseModel):
    """차량 목록 응답"""
    items: List[VehicleResponse]
    total: int
    page: int = 1
    page_size: int = 20


class VehicleStatusUpdate(BaseModel):
    """차량 상태 업데이트"""
    status: VehicleStatus


class VehicleMileageUpdate(BaseModel):
    """차량 주행거리 업데이트"""
    mileage: int = Field(..., ge=0)


class VehicleMaintenanceUpdate(BaseModel):
    """차량 정비 정보 업데이트"""
    last_maintenance_date: datetime
    next_maintenance_date: datetime
    maintenance_notes: Optional[str] = None


class VehicleStatistics(BaseModel):
    """차량 통계"""
    total_vehicles: int = Field(..., description="전체 차량 수")
    available_vehicles: int = Field(..., description="이용 가능 차량 수")
    rented_vehicles: int = Field(..., description="대여중 차량 수")
    maintenance_vehicles: int = Field(..., description="정비중 차량 수")
    reserved_vehicles: int = Field(..., description="예약된 차량 수")
    average_mileage: float = Field(..., description="평균 주행거리")
    total_value: float = Field(..., description="총 차량 가치")
