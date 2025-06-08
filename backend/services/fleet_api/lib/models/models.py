from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime, date
from enum import Enum


# 차량 상태 열거형
class VehicleStatus(str, Enum):
    AVAILABLE = "available"  # 사용 가능
    IN_USE = "in_use"  # 사용 중
    MAINTENANCE = "maintenance"  # 정비 중
    RESERVED = "reserved"  # 예약됨
    OUT_OF_SERVICE = "out_of_service"  # 운행 불가


# 차량 유형 열거형
class VehicleType(str, Enum):
    SEDAN = "sedan"  # 승용차
    SUV = "suv"  # 스포츠 유틸리티 차량
    TRUCK = "truck"  # 트럭
    VAN = "van"  # 밴
    BUS = "bus"  # 버스
    OTHER = "other"  # 기타


# 계약 유형 열거형
class ContractType(str, Enum):
    LEASE = "lease"  # 리스
    RENTAL = "rental"  # 렌트
    PURCHASE = "purchase"  # 구매
    SUBSCRIPTION = "subscription"  # 구독


# 계약 상태 열거형
class ContractStatus(str, Enum):
    ACTIVE = "active"  # 활성
    PENDING = "pending"  # 대기 중
    EXPIRED = "expired"  # 만료됨
    TERMINATED = "terminated"  # 해지됨


# 차량 모델
class VehicleBase(BaseModel):
    make: str  # 제조사
    model: str  # 모델명
    year: int  # 연식
    vehicle_type: VehicleType  # 차량 유형
    license_plate: str  # 번호판
    vin: str  # 차대번호


class VehicleCreate(VehicleBase):
    organization_id: str  # 소유 조직 ID
    color: Optional[str] = None  # 색상
    mileage: Optional[int] = None  # 주행거리
    fuel_type: Optional[str] = None  # 연료 유형
    transmission: Optional[str] = None  # 변속기 유형
    engine: Optional[str] = None  # 엔진 정보
    features: Optional[List[str]] = None  # 특징/옵션
    notes: Optional[str] = None  # 메모


class VehicleUpdate(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    vehicle_type: Optional[VehicleType] = None
    license_plate: Optional[str] = None
    color: Optional[str] = None
    mileage: Optional[int] = None
    status: Optional[VehicleStatus] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    engine: Optional[str] = None
    features: Optional[List[str]] = None
    notes: Optional[str] = None


class VehicleResponse(VehicleBase):
    id: str
    organization_id: str
    status: VehicleStatus
    color: Optional[str] = None
    mileage: Optional[int] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    engine: Optional[str] = None
    features: Optional[List[str]] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# 계약 모델
class ContractBase(BaseModel):
    organization_id: str  # 조직 ID
    vehicle_id: str  # 차량 ID
    contract_type: ContractType  # 계약 유형
    start_date: date  # 계약 시작일
    end_date: date  # 계약 종료일
    monthly_payment: float  # 월 납입금
    provider: Optional[str] = None  # 계약 제공업체 (리스/렌트 회사)


class ContractCreate(ContractBase):
    deposit: Optional[float] = None  # 보증금
    insurance_info: Optional[Dict[str, Any]] = None  # 보험 정보
    additional_terms: Optional[str] = None  # 추가 계약 조건
    contract_file_url: Optional[str] = None  # 계약서 파일 URL
    total_cost: Optional[float] = None  # 총 계약 비용


class ContractUpdate(BaseModel):
    contract_type: Optional[ContractType] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    monthly_payment: Optional[float] = None
    deposit: Optional[float] = None
    status: Optional[ContractStatus] = None
    insurance_info: Optional[Dict[str, Any]] = None
    additional_terms: Optional[str] = None
    contract_file_url: Optional[str] = None
    provider: Optional[str] = None
    total_cost: Optional[float] = None


class ContractResponse(ContractBase):
    id: str
    status: ContractStatus
    deposit: Optional[float] = None
    insurance_info: Optional[Dict[str, Any]] = None
    additional_terms: Optional[str] = None
    contract_file_url: Optional[str] = None
    total_cost: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# 계약 결제 모델 추가
class ContractPaymentBase(BaseModel):
    contract_id: str  # 계약 ID
    payment_date: date  # 결제일
    amount: float  # 결제 금액
    payment_type: str  # 결제 유형 (월 납부금, 보증금, 기타 등)


class ContractPaymentCreate(ContractPaymentBase):
    reference_number: Optional[str] = None  # 결제 참조 번호
    notes: Optional[str] = None  # 비고


class ContractPaymentUpdate(BaseModel):
    payment_date: Optional[date] = None
    amount: Optional[float] = None
    payment_type: Optional[str] = None
    reference_number: Optional[str] = None
    notes: Optional[str] = None


class ContractPaymentResponse(ContractPaymentBase):
    id: str
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# 운전자 모델
class DriverBase(BaseModel):
    organization_id: str  # 조직 ID
    user_id: str  # 사용자 ID
    license_number: str  # 운전면허 번호
    license_expiry: date  # 운전면허 만료일


class DriverCreate(DriverBase):
    license_type: Optional[str] = None  # 면허 유형
    restrictions: Optional[List[str]] = None  # 제한 사항
    notes: Optional[str] = None  # 메모


class DriverUpdate(BaseModel):
    license_number: Optional[str] = None
    license_expiry: Optional[date] = None
    license_type: Optional[str] = None
    restrictions: Optional[List[str]] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class DriverResponse(DriverBase):
    id: str
    license_type: Optional[str] = None
    restrictions: Optional[List[str]] = None
    is_active: bool
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# 주행 기록 모델
class MileageLogBase(BaseModel):
    vehicle_id: str  # 차량 ID
    driver_id: str  # 운전자 ID
    date: date  # 기록 날짜
    odometer_start: int  # 주행 시작 계기판 값
    odometer_end: int  # 주행 종료 계기판 값


class MileageLogCreate(MileageLogBase):
    trip_purpose: Optional[str] = None  # 주행 목적
    route_info: Optional[str] = None  # 경로 정보
    fuel_added: Optional[float] = None  # 추가된 연료량
    fuel_cost: Optional[float] = None  # 연료 비용
    notes: Optional[str] = None  # 메모


class MileageLogUpdate(BaseModel):
    date: Optional[date] = None
    odometer_start: Optional[int] = None
    odometer_end: Optional[int] = None
    trip_purpose: Optional[str] = None
    route_info: Optional[str] = None
    fuel_added: Optional[float] = None
    fuel_cost: Optional[float] = None
    notes: Optional[str] = None


class MileageLogResponse(MileageLogBase):
    id: str
    distance: int  # 주행 거리 (종료 - 시작)
    trip_purpose: Optional[str] = None
    route_info: Optional[str] = None
    fuel_added: Optional[float] = None
    fuel_cost: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# 차량 할당 모델
class VehicleAssignmentBase(BaseModel):
    vehicle_id: str  # 차량 ID
    driver_id: str  # 운전자 ID
    start_date: date  # 할당 시작일
    end_date: Optional[date] = None  # 할당 종료일 (없으면 무기한)


class VehicleAssignmentCreate(VehicleAssignmentBase):
    assignment_purpose: Optional[str] = None  # 할당 목적
    authorized_uses: Optional[List[str]] = None  # 승인된 사용 목적
    notes: Optional[str] = None  # 메모


class VehicleAssignmentUpdate(BaseModel):
    end_date: Optional[date] = None
    assignment_purpose: Optional[str] = None
    authorized_uses: Optional[List[str]] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class VehicleAssignmentResponse(VehicleAssignmentBase):
    id: str
    assignment_purpose: Optional[str] = None
    authorized_uses: Optional[List[str]] = None
    is_active: bool
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
