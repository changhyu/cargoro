from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any
from enum import Enum
from datetime import date, datetime


# snake_case를 camelCase로 변환하는 alias_generator
def to_camel(string: str) -> str:
    parts = string.split('_')
    return parts[0] + ''.join(word.capitalize() for word in parts[1:])


class ContractStatus(str, Enum):
    """계약 상태 열거형"""

    ACTIVE = "active"  # 활성 계약
    PENDING = "pending"  # 승인 대기 중
    EXPIRED = "expired"  # 만료됨
    TERMINATED = "terminated"  # 중도 해지


class ContractType(str, Enum):
    """계약 유형 열거형"""

    LEASE = "lease"  # 리스
    RENTAL = "rental"  # 렌트
    PURCHASE = "purchase"  # 구매
    OTHER = "other"  # 기타


class ContractCreate(BaseModel):
    """계약 생성 모델"""

    organization_id: str = Field(..., description="소속 조직 ID")
    vehicle_id: str = Field(..., description="차량 ID")
    contract_type: ContractType = Field(..., description="계약 유형")
    start_date: date = Field(..., description="계약 시작일")
    end_date: date = Field(..., description="계약 종료일")
    monthly_payment: float = Field(..., description="월 납입금액", ge=0)
    deposit: Optional[float] = Field(0, description="보증금", ge=0)
    insurance_info: Optional[Dict[str, Any]] = Field({}, description="보험 정보")
    additional_terms: Optional[str] = Field(None, description="추가 계약 조건")
    contract_file_url: Optional[str] = Field(None, description="계약서 파일 URL")


class ContractUpdate(BaseModel):
    """계약 업데이트 모델"""

    organization_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    contract_type: Optional[ContractType] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    monthly_payment: Optional[float] = Field(None, ge=0)
    deposit: Optional[float] = Field(None, ge=0)
    status: Optional[ContractStatus] = None
    insurance_info: Optional[Dict[str, Any]] = None
    additional_terms: Optional[str] = None
    contract_file_url: Optional[str] = None


class ContractResponse(BaseModel):
    """계약 응답 모델"""

    client_name: Optional[str] = None  # 조직명 매핑 (alias: clientName)
    id: str
    organization_id: str = Field(..., alias="clientId")  # organization_id를 clientId로 매핑
    vehicle_id: str = Field(..., alias="vehicleId")
    contract_type: ContractType = Field(..., alias="type")
    start_date: date = Field(..., alias="startDate")
    end_date: date = Field(..., alias="endDate")
    monthly_payment: float = Field(..., alias="monthlyPrice")
    deposit: float = Field(..., alias="deposit")
    status: ContractStatus
    insurance_info: Optional[Dict[str, Any]] = None
    additional_terms: Optional[str] = Field(None, alias="terms")
    notes: Optional[str] = Field(None, alias="notes")  # 추가 메모 필드
    contract_file_url: Optional[str] = None
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )


class ContractPaymentCreate(BaseModel):
    """계약 결제 생성 모델"""

    payment_date: date = Field(..., description="결제일")
    amount: float = Field(..., description="결제 금액", gt=0)
    payment_type: str = Field(..., description="결제 유형 (월납, 보증금, 기타 등)")
    reference_number: Optional[str] = Field(None, description="참조 번호")
    notes: Optional[str] = Field(None, description="비고")


class ContractPaymentUpdate(BaseModel):
    """계약 결제 업데이트 모델"""

    payment_date: Optional[date] = None
    amount: Optional[float] = Field(None, gt=0)
    payment_type: Optional[str] = None
    reference_number: Optional[str] = None
    notes: Optional[str] = None


class ContractPaymentResponse(BaseModel):
    """계약 결제 응답 모델"""

    id: str
    contract_id: str
    payment_date: date
    amount: float
    payment_type: str
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
