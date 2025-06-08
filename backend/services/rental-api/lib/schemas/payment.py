"""
결제 관련 Pydantic 스키마
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

from ..models.enums import PaymentStatus, PaymentMethod


class PaymentBase(BaseModel):
    """결제 기본 정보"""
    customer_id: str = Field(..., description="고객 ID")
    contract_type: str = Field(..., pattern="^(RENTAL|LEASE)$", description="계약 유형")
    amount: float = Field(..., ge=0, description="결제 금액")
    payment_method: PaymentMethod = Field(..., description="결제 방법")
    due_date: datetime = Field(..., description="납부 예정일")


class PaymentCreate(PaymentBase):
    """결제 생성 스키마"""
    rental_contract_id: Optional[str] = Field(None, description="렌탈 계약 ID")
    lease_contract_id: Optional[str] = Field(None, description="리스 계약 ID")


class PaymentUpdate(BaseModel):
    """결제 업데이트 스키마"""
    status: Optional[PaymentStatus] = None
    paid_date: Optional[datetime] = None
    receipt_url: Optional[str] = None


class PaymentInDB(PaymentBase):
    """DB에 저장된 결제"""
    id: str
    rental_contract_id: Optional[str] = None
    lease_contract_id: Optional[str] = None
    status: PaymentStatus = Field(default=PaymentStatus.PENDING)
    paid_date: Optional[datetime] = None
    receipt_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaymentResponse(PaymentInDB):
    """결제 응답 스키마"""
    customer_name: Optional[str] = Field(None, description="고객명")
    contract_number: Optional[str] = Field(None, description="계약 번호")


class PaymentListResponse(BaseModel):
    """결제 목록 응답"""
    items: List[PaymentResponse]
    total: int
    page: int = 1
    page_size: int = 20


class PaymentProcessRequest(BaseModel):
    """결제 처리 요청"""
    payment_method: PaymentMethod
    transaction_id: Optional[str] = Field(None, description="거래 ID")
    card_number: Optional[str] = Field(None, description="카드 번호 (마스킹)")
    approval_number: Optional[str] = Field(None, description="승인 번호")


class PaymentRefundRequest(BaseModel):
    """환불 요청"""
    refund_amount: float = Field(..., ge=0, description="환불 금액")
    refund_reason: str = Field(..., description="환불 사유")


class PaymentStatistics(BaseModel):
    """결제 통계"""
    total_payments: int = Field(..., description="전체 결제 수")
    completed_payments: int = Field(..., description="완료된 결제")
    pending_payments: int = Field(..., description="대기중 결제")
    failed_payments: int = Field(..., description="실패한 결제")
    total_amount: float = Field(..., description="총 결제 금액")
    pending_amount: float = Field(..., description="미수금")
    overdue_payments: int = Field(..., description="연체 결제")
    overdue_amount: float = Field(..., description="연체 금액")


class PaymentSummary(BaseModel):
    """월별 결제 요약"""
    year: int
    month: int
    total_amount: float = Field(..., description="총 결제액")
    rental_amount: float = Field(..., description="렌탈 결제액")
    lease_amount: float = Field(..., description="리스 결제액")
    payment_count: int = Field(..., description="결제 건수")
    collection_rate: float = Field(..., description="수금률 (%)")


class BulkPaymentCreate(BaseModel):
    """대량 결제 생성"""
    contract_type: str = Field(..., pattern="^(RENTAL|LEASE)$")
    contract_ids: List[str] = Field(..., description="계약 ID 목록")
    due_date: datetime = Field(..., description="납부 예정일")
    payment_method: PaymentMethod = Field(default=PaymentMethod.BANK_TRANSFER)
