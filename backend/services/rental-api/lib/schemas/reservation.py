"""
예약 관련 Pydantic 스키마
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from ..models.enums import ReservationStatus, ReservationType


class ReservationBase(BaseModel):
    """예약 기본 정보"""
    customer_id: str = Field(..., description="고객 ID")
    vehicle_id: str = Field(..., description="차량 ID")
    reservation_type: ReservationType = Field(..., description="예약 유형")
    pickup_date: datetime = Field(..., description="픽업 날짜")
    pickup_time: str = Field(..., description="픽업 시간")
    pickup_location: str = Field(..., description="픽업 장소")
    return_date: Optional[datetime] = Field(None, description="반납 날짜")
    return_time: Optional[str] = Field(None, description="반납 시간")
    return_location: Optional[str] = Field(None, description="반납 장소")
    estimated_cost: float = Field(..., ge=0, description="예상 비용")
    notes: Optional[str] = Field(None, description="메모")


class ReservationCreate(ReservationBase):
    """예약 생성 스키마"""
    pass


class ReservationUpdate(BaseModel):
    """예약 업데이트 스키마"""
    status: Optional[ReservationStatus] = None
    pickup_date: Optional[datetime] = None
    pickup_time: Optional[str] = None
    pickup_location: Optional[str] = None
    return_date: Optional[datetime] = None
    return_time: Optional[str] = None
    return_location: Optional[str] = None
    notes: Optional[str] = None


class ReservationInDB(ReservationBase):
    """DB에 저장된 예약"""
    id: str
    status: ReservationStatus = Field(default=ReservationStatus.PENDING)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReservationResponse(ReservationInDB):
    """예약 응답 스키마"""
    customer_name: Optional[str] = Field(None, description="고객명")
    customer_phone: Optional[str] = Field(None, description="고객 연락처")
    vehicle_info: Optional[str] = Field(None, description="차량 정보")


class ReservationListResponse(BaseModel):
    """예약 목록 응답"""
    items: list[ReservationResponse]
    total: int
    page: int = 1
    page_size: int = 20


class ReservationCalendarResponse(BaseModel):
    """캘린더용 예약 응답"""
    date: str = Field(..., description="날짜 (YYYY-MM-DD)")
    reservations: list[ReservationResponse]
    total_count: int


class ReservationStatistics(BaseModel):
    """예약 통계"""
    total_reservations: int = Field(..., description="전체 예약 수")
    pending_reservations: int = Field(..., description="대기중 예약")
    confirmed_reservations: int = Field(..., description="확정된 예약")
    today_pickups: int = Field(..., description="오늘 픽업 예정")
    this_week_pickups: int = Field(..., description="이번 주 픽업 예정")
    cancellation_rate: float = Field(..., description="취소율 (%)")
