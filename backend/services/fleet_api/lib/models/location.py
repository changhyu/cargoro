from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class LocationStatus(str, Enum):
    """차량 위치 상태 열거형"""

    ACTIVE = "active"  # 운행 중
    IDLE = "idle"  # 대기 중
    MAINTENANCE = "maintenance"  # 정비 중
    OUT_OF_SERVICE = "out_of_service"  # 운행 불가


class VehicleLocationCreate(BaseModel):
    """차량 위치 생성 모델"""

    vehicle_id: str = Field(..., description="차량 ID")
    latitude: float = Field(..., description="위도", ge=-90, le=90)
    longitude: float = Field(..., description="경도", ge=-180, le=180)
    altitude: Optional[float] = Field(None, description="고도 (미터)")
    heading: Optional[float] = Field(None, description="방향 (도)", ge=0, lt=360)
    speed: Optional[float] = Field(None, description="속도 (km/h)")
    accuracy: Optional[float] = Field(None, description="위치 정확도 (미터)")
    status: LocationStatus = Field(LocationStatus.ACTIVE, description="차량 상태")


class VehicleLocationUpdate(BaseModel):
    """차량 위치 업데이트 모델"""

    latitude: Optional[float] = Field(None, description="위도", ge=-90, le=90)
    longitude: Optional[float] = Field(None, description="경도", ge=-180, le=180)
    altitude: Optional[float] = Field(None, description="고도 (미터)")
    heading: Optional[float] = Field(None, description="방향 (도)", ge=0, lt=360)
    speed: Optional[float] = Field(None, description="속도 (km/h)")
    accuracy: Optional[float] = Field(None, description="위치 정확도 (미터)")
    status: Optional[LocationStatus] = Field(None, description="차량 상태")


class VehicleLocationResponse(BaseModel):
    """차량 위치 응답 모델"""

    id: str
    vehicle_id: str
    license_plate: Optional[str] = None
    latitude: float
    longitude: float
    altitude: Optional[float] = None
    heading: Optional[float] = None
    speed: Optional[float] = None
    accuracy: Optional[float] = None
    status: LocationStatus
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True  # Pydantic v2 형식 (v1의 orm_mode=True 대체)
    }

    @classmethod
    def model_validate_obj(cls, obj):
        """객체를 Pydantic 모델로 변환하는 메소드

        Pydantic v2 호환 메서드 (from_orm 대체)
        """
        # 객체에서 필드 추출
        data = {}
        for field in cls.model_fields:  # v2에서는 model_fields 사용
            if hasattr(obj, field):
                data[field] = getattr(obj, field)

        # 생성된 데이터로 모델 인스턴스 반환
        return cls.model_validate(data)  # v2에서는 model_validate 사용
