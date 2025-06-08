"""
렌탈 계약 관련 Pydantic 스키마
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

from ..models.enums import (
    ContractType,
    RentalContractStatus,
    InsuranceType
)


class AdditionalOption(BaseModel):
    """추가 옵션"""
    id: str = Field(..., description="옵션 ID")
    name: str = Field(..., description="옵션명")
    price: float = Field(..., ge=0, description="가격")
    unit: str = Field(..., pattern="^(DAY|TOTAL)$", description="단위 (DAY/TOTAL)")


class RentalContractBase(BaseModel):
    """렌탈 계약 기본 정보"""
    customer_id: str = Field(..., description="고객 ID")
    vehicle_id: str = Field(..., description="차량 ID")
    contract_type: ContractType = Field(..., description="계약 유형")
    start_date: datetime = Field(..., description="시작일")
    end_date: datetime = Field(..., description="종료일")
    pickup_location: str = Field(..., description="픽업 장소")
    return_location: str = Field(..., description="반납 장소")
    daily_rate: float = Field(..., ge=0, description="일일 대여료")
    deposit: float = Field(..., ge=0, description="보증금")
    insurance_type: InsuranceType = Field(..., description="보험 유형")
    additional_options: List[AdditionalOption] = Field(default_factory=list, description="추가 옵션")


class RentalContractCreate(RentalContractBase):
    """렌탈 계약 생성 스키마"""
    pass


class RentalContractUpdate(BaseModel):
    """렌탈 계약 업데이트 스키마"""
    status: Optional[RentalContractStatus] = None
    end_date: Optional[datetime] = None
    return_location: Optional[str] = None
    additional_options: Optional[List[AdditionalOption]] = None


class RentalContractInDB(RentalContractBase):
    """DB에 저장된 렌탈 계약"""
    id: str
    contract_number: str = Field(..., description="계약 번호")
    status: RentalContractStatus = Field(default=RentalContractStatus.DRAFT)
    total_amount: float = Field(..., ge=0, description="총 금액")
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RentalContractResponse(RentalContractInDB):
    """렌탈 계약 응답 스키마"""
    customer_name: Optional[str] = Field(None, description="고객명")
    vehicle_info: Optional[str] = Field(None, description="차량 정보")


class RentalContractListResponse(BaseModel):
    """렌탈 계약 목록 응답"""
    items: List[RentalContractResponse]
    total: int
    page: int = 1
    page_size: int = 20


class RentalContractCalculation(BaseModel):
    """렌탈 계약 요금 계산"""
    days: int = Field(..., description="대여 일수")
    daily_rate: float = Field(..., description="일일 요금")
    subtotal: float = Field(..., description="기본 요금")
    options_total: float = Field(..., description="옵션 요금")
    insurance_cost: float = Field(..., description="보험료")
    deposit: float = Field(..., description="보증금")
    total_amount: float = Field(..., description="총 금액")


class RentalContractTermination(BaseModel):
    """렌탈 계약 종료"""
    actual_return_date: datetime = Field(..., description="실제 반납일")
    actual_return_location: str = Field(..., description="실제 반납 장소")
    final_mileage: int = Field(..., ge=0, description="최종 주행거리")
    damage_report: Optional[str] = Field(None, description="손상 보고")
    additional_charges: float = Field(default=0, ge=0, description="추가 요금")
    refund_amount: float = Field(default=0, ge=0, description="환불 금액")
