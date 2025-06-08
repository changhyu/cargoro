"""
고객 관련 Pydantic 스키마
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr

from ..models.enums import CustomerType, VerificationStatus


class CustomerBase(BaseModel):
    """고객 기본 정보"""
    type: CustomerType = Field(..., description="고객 유형")
    name: str = Field(..., min_length=1, description="이름/회사명")
    email: EmailStr = Field(..., description="이메일")
    phone: str = Field(..., description="연락처")
    address: str = Field(..., description="주소")
    license_number: Optional[str] = Field(None, description="운전면허번호 (개인)")
    business_number: Optional[str] = Field(None, description="사업자등록번호 (법인)")


class CustomerCreate(CustomerBase):
    """고객 생성 스키마"""
    pass


class CustomerUpdate(BaseModel):
    """고객 업데이트 스키마"""
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    license_number: Optional[str] = None
    business_number: Optional[str] = None


class CustomerInDB(CustomerBase):
    """DB에 저장된 고객 정보"""
    id: str
    verification_status: VerificationStatus = Field(default=VerificationStatus.PENDING)
    credit_score: Optional[int] = Field(None, ge=0, le=1000)
    registered_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CustomerResponse(CustomerInDB):
    """고객 응답 스키마"""
    pass


class CustomerListResponse(BaseModel):
    """고객 목록 응답"""
    items: list[CustomerResponse]
    total: int
    page: int = 1
    page_size: int = 20


class CustomerVerification(BaseModel):
    """고객 검증"""
    verification_status: VerificationStatus
    verification_notes: Optional[str] = None
    credit_score: Optional[int] = Field(None, ge=0, le=1000)


class CustomerStatistics(BaseModel):
    """고객 통계"""
    total_customers: int = Field(..., description="전체 고객 수")
    individual_customers: int = Field(..., description="개인 고객 수")
    corporate_customers: int = Field(..., description="법인 고객 수")
    verified_customers: int = Field(..., description="검증 완료 고객 수")
    pending_verification: int = Field(..., description="검증 대기 고객 수")
    active_customers: int = Field(..., description="활성 계약 고객 수")


class CustomerContractSummary(BaseModel):
    """고객 계약 요약"""
    customer_id: str
    total_contracts: int = Field(..., description="총 계약 수")
    active_rentals: int = Field(..., description="활성 렌탈 계약")
    active_leases: int = Field(..., description="활성 리스 계약")
    total_revenue: float = Field(..., description="총 매출액")
    overdue_amount: float = Field(..., description="연체 금액")
