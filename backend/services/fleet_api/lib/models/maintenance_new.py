"""
차량 유지보수 관련 모델 정의
"""
from pydantic import BaseModel, Field, validator, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from ..models.contract import to_camel


class MaintenanceStatus(str, Enum):
    """유지보수 상태 열거형"""

    SCHEDULED = "SCHEDULED"  # 예정됨
    IN_PROGRESS = "IN_PROGRESS"  # 진행중
    COMPLETED = "COMPLETED"  # 완료됨
    CANCELLED = "CANCELLED"  # 취소됨


class MaintenanceType(str, Enum):
    """유지보수 유형 열거형"""

    REGULAR = "REGULAR"  # 정기점검
    REPAIR = "REPAIR"  # 수리
    INSPECTION = "INSPECTION"  # 검사
    TIRE_CHANGE = "TIRE_CHANGE"  # 타이어 교체
    OIL_CHANGE = "OIL_CHANGE"  # 오일 교체
    EMERGENCY = "EMERGENCY"  # 긴급 수리
    OTHER = "OTHER"  # 기타


class MaintenancePartBase(BaseModel):
    """유지보수 부품 기본 모델"""

    name: str = Field(..., description="부품 이름")
    part_number: Optional[str] = Field(None, description="부품 번호")
    quantity: int = Field(..., description="수량", gt=0)
    unit_price: Optional[float] = Field(None, description="단가", ge=0)
    total_price: Optional[float] = Field(None, description="총 금액", ge=0)

    @validator("total_price", pre=True, always=False)
    def calculate_total_price(cls, v, values):
        """단가와 수량으로 총 금액 계산"""
        if v is not None:
            return v

        unit_price = values.get("unit_price")
        quantity = values.get("quantity")

        if unit_price is not None and quantity is not None:
            return unit_price * quantity

        return None


class MaintenanceBase(BaseModel):
    """유지보수 기본 모델"""

    vehicle_id: str = Field(..., description="차량 ID")
    maintenance_type: MaintenanceType = Field(..., description="유지보수 유형")
    description: str = Field(..., description="설명")
    scheduled_date: datetime = Field(..., description="예정 날짜")
    odometer_reading: Optional[int] = Field(None, description="주행 거리계(km)")
    estimated_cost: Optional[float] = Field(None, description="예상 비용", ge=0)
    service_provider: Optional[str] = Field(None, description="서비스 제공자")
    notes: Optional[str] = Field(None, description="메모")


class MaintenanceCreate(MaintenanceBase):
    """유지보수 생성 모델"""

    parts: Optional[List[MaintenancePartBase]] = Field(None, description="교체/수리된 부품 목록")


class MaintenanceUpdate(BaseModel):
    """유지보수 업데이트 모델"""

    maintenance_type: Optional[MaintenanceType] = None
    description: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    actual_date: Optional[datetime] = None
    status: Optional[MaintenanceStatus] = None
    odometer_reading: Optional[int] = None
    estimated_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    service_provider: Optional[str] = None
    parts: Optional[List[MaintenancePartBase]] = None
    invoice_number: Optional[str] = None
    warranty_info: Optional[str] = None
    notes: Optional[str] = None


class MaintenancePartResponse(MaintenancePartBase):
    """유지보수 부품 응답 모델"""

    id: str
    maintenance_id: str

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )


class MaintenanceResponse(MaintenanceBase):
    """유지보수 응답 모델"""

    id: str
    status: MaintenanceStatus
    actual_date: Optional[datetime] = None
    actual_cost: Optional[float] = None
    invoice_number: Optional[str] = None
    warranty_info: Optional[str] = None
    parts: List[MaintenancePartResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )


class MaintenanceScheduleSettings(BaseModel):
    """유지보수 일정 설정 모델"""

    regular_service_interval_km: int = Field(..., description="정기 점검 간격(km)", ge=0)
    regular_service_interval_days: int = Field(..., description="정기 점검 간격(일)", ge=0)
    oil_change_interval_km: int = Field(..., description="오일 교체 간격(km)", ge=0)
    oil_change_interval_days: int = Field(..., description="오일 교체 간격(일)", ge=0)
    tire_rotation_interval_km: int = Field(..., description="타이어 위치 교환 간격(km)", ge=0)
    brake_check_interval_km: int = Field(..., description="브레이크 점검 간격(km)", ge=0)
    notification_days_before: int = Field(7, description="사전 알림 일수", ge=0)
    vehicle_id: Optional[str] = Field(None, description="특정 차량 ID(없으면 기본 설정)")

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )
