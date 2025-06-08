"""
운전자 성능 관련 모델 정의
"""
from pydantic import BaseModel, Field, validator, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from ..models.contract import to_camel


class PerformancePeriod(str, Enum):
    """성능 데이터 집계 기간 유형"""

    DAILY = "daily"  # 일별
    WEEKLY = "weekly"  # 주별
    MONTHLY = "monthly"  # 월별
    QUARTERLY = "quarterly"  # 분기별
    YEARLY = "yearly"  # 연별
    CUSTOM = "custom"  # 사용자 정의


class DrivingRecordBase(BaseModel):
    """운행 기록 기본 모델"""

    driver_id: str = Field(..., description="운전자 ID")
    vehicle_id: str = Field(..., description="차량 ID")
    start_time: datetime = Field(..., description="운행 시작 시간")
    end_time: datetime = Field(..., description="운행 종료 시간")
    start_location: Optional[str] = Field(None, description="출발 위치")
    end_location: Optional[str] = Field(None, description="도착 위치")
    distance: float = Field(..., description="주행 거리(km)", ge=0)
    avg_speed: Optional[float] = Field(None, description="평균 속도(km/h)", ge=0)
    max_speed: Optional[float] = Field(None, description="최대 속도(km/h)", ge=0)
    fuel_consumption: Optional[float] = Field(None, description="연료 소비량(L)", ge=0)
    hard_brake_count: Optional[int] = Field(None, description="급제동 횟수", ge=0)
    hard_accel_count: Optional[int] = Field(None, description="급가속 횟수", ge=0)
    idling_duration: Optional[int] = Field(None, description="공회전 시간(분)", ge=0)
    route_data: Optional[Dict[str, Any]] = Field(
        None, description="경로 데이터(GeoJSON)"
    )
    notes: Optional[str] = Field(None, description="메모")

    @validator("end_time")
    def end_time_after_start_time(cls, v, values):
        """종료 시간이 시작 시간 이후인지 확인"""
        if v is not None and "start_time" in values and v < values["start_time"]:
            raise ValueError("종료 시간은 시작 시간 이후여야 합니다")
        return v


class DrivingRecordCreate(DrivingRecordBase):
    """운행 기록 생성 모델"""

    pass


class DrivingRecordUpdate(BaseModel):
    """운행 기록 업데이트 모델"""

    end_time: Optional[datetime] = None
    end_location: Optional[str] = None
    distance: Optional[float] = None
    avg_speed: Optional[float] = None
    max_speed: Optional[float] = None
    fuel_consumption: Optional[float] = None
    hard_brake_count: Optional[int] = None
    hard_accel_count: Optional[int] = None
    idling_duration: Optional[int] = None
    route_data: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class DrivingRecordResponse(DrivingRecordBase):
    """운행 기록 응답 모델"""

    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )


class DriverScoreCategory(str, Enum):
    """운전자 평가 카테고리"""

    SAFETY = "safety"  # 안전 운전
    EFFICIENCY = "efficiency"  # 효율적 운전
    COMPLIANCE = "compliance"  # 규정 준수
    MAINTENANCE = "maintenance"  # 차량 관리
    OVERALL = "overall"  # 종합 점수


class DriverPerformanceBase(BaseModel):
    """운전자 성과 기본 모델"""

    driver_id: str = Field(..., description="운전자 ID")
    period: PerformancePeriod = Field(..., description="데이터 집계 기간")
    start_date: datetime = Field(..., description="집계 시작일")
    end_date: datetime = Field(..., description="집계 종료일")
    total_distance: float = Field(..., description="총 주행 거리(km)", ge=0)
    fuel_efficiency: Optional[float] = Field(None, description="연비(km/L)", ge=0)
    avg_speed: Optional[float] = Field(None, description="평균 속도(km/h)", ge=0)
    driving_time: Optional[int] = Field(None, description="총 운전 시간(분)", ge=0)
    idle_time: Optional[int] = Field(None, description="총 공회전 시간(분)", ge=0)
    hard_brake_count: Optional[int] = Field(None, description="총 급제동 횟수", ge=0)
    hard_accel_count: Optional[int] = Field(None, description="총 급가속 횟수", ge=0)
    speeding_incidents: Optional[int] = Field(None, description="과속 사고 수", ge=0)
    safety_score: Optional[int] = Field(None, description="안전 점수(0-100)", ge=0, le=100)
    efficiency_score: Optional[int] = Field(None, description="효율성 점수(0-100)", ge=0, le=100)
    overall_score: Optional[int] = Field(None, description="종합 점수(0-100)", ge=0, le=100)
    score_details: Optional[Dict[str, Any]] = Field(None, description="점수 상세 내역")


class DriverPerformanceCreate(DriverPerformanceBase):
    """운전자 성과 생성 모델"""

    pass


class DriverPerformanceUpdate(BaseModel):
    """운전자 성과 업데이트 모델"""

    end_date: Optional[datetime] = None
    total_distance: Optional[float] = None
    fuel_efficiency: Optional[float] = None
    avg_speed: Optional[float] = None
    driving_time: Optional[int] = None
    idle_time: Optional[int] = None
    hard_brake_count: Optional[int] = None
    hard_accel_count: Optional[int] = None
    speeding_incidents: Optional[int] = None
    safety_score: Optional[int] = None
    efficiency_score: Optional[int] = None
    overall_score: Optional[int] = None
    score_details: Optional[Dict[str, Any]] = None


class DriverPerformanceResponse(DriverPerformanceBase):
    """운전자 성과 응답 모델"""

    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )
