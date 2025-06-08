"""
리스 계약 관련 Pydantic 스키마
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from ..models.enums import LeaseType, LeaseContractStatus


class LeaseContractBase(BaseModel):
    """리스 계약 기본 정보"""
    customer_id: str = Field(..., description="고객 ID")
    vehicle_id: str = Field(..., description="차량 ID")
    lease_type: LeaseType = Field(..., description="리스 유형")
    start_date: datetime = Field(..., description="시작일")
    end_date: datetime = Field(..., description="종료일")
    monthly_payment: float = Field(..., ge=0, description="월 납입금")
    down_payment: float = Field(..., ge=0, description="선납금")
    residual_value: float = Field(..., ge=0, description="잔존가치")
    mileage_limit: int = Field(..., ge=0, description="연간 주행거리 제한(km)")
    excess_mileage_rate: float = Field(..., ge=0, description="초과 주행 요금(원/km)")
    maintenance_included: bool = Field(default=False, description="정비 포함 여부")
    insurance_included: bool = Field(default=False, description="보험 포함 여부")


class LeaseContractCreate(LeaseContractBase):
    """리스 계약 생성 스키마"""
    pass


class LeaseContractUpdate(BaseModel):
    """리스 계약 업데이트 스키마"""
    status: Optional[LeaseContractStatus] = None
    monthly_payment: Optional[float] = Field(None, ge=0)
    mileage_limit: Optional[int] = Field(None, ge=0)
    excess_mileage_rate: Optional[float] = Field(None, ge=0)


class LeaseContractInDB(LeaseContractBase):
    """DB에 저장된 리스 계약"""
    id: str
    contract_number: str = Field(..., description="계약 번호")
    status: LeaseContractStatus = Field(default=LeaseContractStatus.DRAFT)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LeaseContractResponse(LeaseContractInDB):
    """리스 계약 응답 스키마"""
    customer_name: Optional[str] = Field(None, description="고객명")
    vehicle_info: Optional[str] = Field(None, description="차량 정보")
    total_payments: float = Field(..., description="총 납입 예정액")
    remaining_months: int = Field(..., description="잔여 개월수")


class LeaseContractListResponse(BaseModel):
    """리스 계약 목록 응답"""
    items: list[LeaseContractResponse]
    total: int
    page: int = 1
    page_size: int = 20


class LeaseContractCalculation(BaseModel):
    """리스 계약 계산"""
    contract_months: int = Field(..., description="계약 개월수")
    monthly_payment: float = Field(..., description="월 납입금")
    down_payment: float = Field(..., description="선납금")
    total_payments: float = Field(..., description="총 납입액")
    residual_value: float = Field(..., description="잔존가치")
    annual_mileage_limit: int = Field(..., description="연간 주행거리 제한")
    total_mileage_limit: int = Field(..., description="총 주행거리 제한")


class LeaseContractTermination(BaseModel):
    """리스 계약 중도 해지"""
    termination_date: datetime = Field(..., description="해지일")
    reason: str = Field(..., description="해지 사유")
    current_mileage: int = Field(..., ge=0, description="현재 주행거리")
    early_termination_fee: float = Field(..., ge=0, description="중도 해지 수수료")
    excess_mileage_charge: float = Field(default=0, ge=0, description="초과 주행 요금")
    damage_charge: float = Field(default=0, ge=0, description="손상 청구금")
    total_settlement: float = Field(..., description="총 정산금액")
