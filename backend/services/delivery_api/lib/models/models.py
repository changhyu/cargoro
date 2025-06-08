from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, date, time
from enum import Enum


# 탁송 상태 열거형
class DeliveryStatus(str, Enum):
    PENDING = "pending"  # 대기 중
    ASSIGNED = "assigned"  # 할당됨
    IN_TRANSIT = "in_transit"  # 이동 중
    COMPLETED = "completed"  # 완료됨
    FAILED = "failed"  # 실패
    CANCELLED = "cancelled"  # 취소됨


# 탁송 유형 열거형
class DeliveryType(str, Enum):
    CUSTOMER_DELIVERY = "customer_delivery"  # 고객 인도
    WORKSHOP_TRANSFER = "workshop_transfer"  # 정비소 이동
    DEALER_TRANSFER = "dealer_transfer"  # 딜러 이동
    PURCHASE_PICKUP = "purchase_pickup"  # 구매 차량 픽업
    RETURN_DELIVERY = "return_delivery"  # 반납 차량 배송


# 우선순위 열거형
class PriorityLevel(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


# 탁송 모델
class DeliveryBase(BaseModel):
    vehicle_id: str  # 차량 ID
    delivery_type: DeliveryType  # 탁송 유형
    origin_location: str  # 출발지
    destination_location: str  # 도착지
    scheduled_date: date  # 예정일


class DeliveryCreate(DeliveryBase):
    scheduled_time: Optional[time] = None  # 예정 시간
    customer_id: Optional[str] = None  # 고객 ID (필요한 경우)
    contact_person: Optional[str] = None  # 연락처 사람
    contact_phone: Optional[str] = None  # 연락처 번호
    priority: PriorityLevel = PriorityLevel.NORMAL  # 우선순위
    notes: Optional[str] = None  # 메모
    estimated_distance: Optional[float] = None  # 예상 거리(km)
    estimated_duration: Optional[int] = None  # 예상 소요 시간(분)


class DeliveryUpdate(BaseModel):
    delivery_type: Optional[DeliveryType] = None
    origin_location: Optional[str] = None
    destination_location: Optional[str] = None
    scheduled_date: Optional[date] = None
    scheduled_time: Optional[time] = None
    driver_id: Optional[str] = None
    status: Optional[DeliveryStatus] = None
    actual_pickup_time: Optional[datetime] = None
    actual_delivery_time: Optional[datetime] = None
    customer_id: Optional[str] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    priority: Optional[PriorityLevel] = None
    notes: Optional[str] = None
    issues: Optional[List[str]] = None
    completed_by: Optional[str] = None
    customer_signature: Optional[str] = None


class DeliveryResponse(DeliveryBase):
    id: str
    status: DeliveryStatus
    driver_id: Optional[str] = None
    scheduled_time: Optional[time] = None
    actual_pickup_time: Optional[datetime] = None
    actual_delivery_time: Optional[datetime] = None
    customer_id: Optional[str] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    priority: PriorityLevel
    notes: Optional[str] = None
    issues: Optional[List[str]] = None
    completed_by: Optional[str] = None
    customer_signature: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# 일정 상태 열거형
class ScheduleStatus(str, Enum):
    PENDING = "PENDING"  # 대기 중
    CONFIRMED = "CONFIRMED"  # 확정됨
    IN_PROGRESS = "IN_PROGRESS"  # 진행 중
    COMPLETED = "COMPLETED"  # 완료됨
    CANCELLED = "CANCELLED"  # 취소됨


# 기사 일정 모델
class DriverScheduleBase(BaseModel):
    driver_id: str  # 기사 ID
    date: date  # 일정 날짜
    start_time: Optional[time] = None  # 시작 시간
    end_time: Optional[time] = None  # 종료 시간
    description: str  # 일정 설명
    location: Optional[str] = None  # 위치


class DriverScheduleCreate(DriverScheduleBase):
    status: Optional[ScheduleStatus] = ScheduleStatus.PENDING  # 상태
    priority: Optional[PriorityLevel] = PriorityLevel.NORMAL  # 우선순위
    notes: Optional[str] = None  # 메모


class DriverScheduleUpdate(BaseModel):
    date: Optional[date] = None  # 일정 날짜
    start_time: Optional[time] = None  # 시작 시간
    end_time: Optional[time] = None  # 종료 시간
    description: Optional[str] = None  # 일정 설명
    location: Optional[str] = None  # 위치
    status: Optional[ScheduleStatus] = None  # 상태
    priority: Optional[PriorityLevel] = None  # 우선순위
    notes: Optional[str] = None  # 메모
    model_config = ConfigDict(extra="ignore")


class DriverScheduleResponse(DriverScheduleBase):
    id: str  # 일정 ID
    status: ScheduleStatus  # 상태
    priority: PriorityLevel  # 우선순위
    notes: Optional[str] = None  # 메모
    created_at: datetime  # 생성 시간
    updated_at: datetime  # 업데이트 시간
    driver: Optional[Dict[str, Any]] = None  # 기사 정보


# 경로 포인트 모델
class RoutePointBase(BaseModel):
    latitude: float  # 위도
    longitude: float  # 경도
    location_name: Optional[str] = None  # 위치 이름
    sequence: Optional[int] = None  # 순서


class RoutePointCreate(RoutePointBase):
    arrival_time: Optional[datetime] = None  # 도착 예정 시간
    departure_time: Optional[datetime] = None  # 출발 예정 시간
    stop_duration: Optional[int] = None  # 정차 시간 (분)
    notes: Optional[str] = None  # 메모


class RoutePointUpdate(BaseModel):
    latitude: Optional[float] = None  # 위도
    longitude: Optional[float] = None  # 경도
    location_name: Optional[str] = None  # 위치 이름
    sequence: Optional[int] = None  # 순서
    arrival_time: Optional[datetime] = None  # 도착 예정 시간
    departure_time: Optional[datetime] = None  # 출발 예정 시간
    stop_duration: Optional[int] = None  # 정차 시간 (분)
    notes: Optional[str] = None  # 메모
    model_config = ConfigDict(extra="ignore")


class RoutePointResponse(RoutePointBase):
    id: str  # 포인트 ID
    delivery_id: str  # 탁송 ID
    arrival_time: Optional[datetime] = None  # 도착 예정 시간
    departure_time: Optional[datetime] = None  # 출발 예정 시간
    stop_duration: Optional[int] = None  # 정차 시간 (분)
    notes: Optional[str] = None  # 메모
    created_at: datetime  # 생성 시간
    updated_at: datetime  # 업데이트 시간


class RouteResponse(BaseModel):
    delivery_id: str  # 탁송 ID
    origin: str  # 출발지
    destination: str  # 도착지
    route_points: List[RoutePointResponse]  # 경로 포인트 목록


# 탁송 이력 로그 모델
class DeliveryLogBase(BaseModel):
    delivery_id: str  # 탁송 ID
    status: DeliveryStatus  # 상태
    logged_by: str  # 기록자
    details: Optional[str] = None  # 세부 내용


class DeliveryLogCreate(DeliveryLogBase):
    location: Optional[str] = None  # 위치
    gps_coordinates: Optional[Dict[str, float]] = None  # GPS 좌표


class DeliveryLogResponse(DeliveryLogBase):
    id: str
    timestamp: datetime  # 기록 시간
    location: Optional[str] = None
    gps_coordinates: Optional[Dict[str, float]] = None

    model_config = ConfigDict(from_attributes=True)
