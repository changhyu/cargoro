"""
결제 API 라우트 (간소화 버전)
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, date

from ..models import get_db
from ..models.enums import PaymentStatus, PaymentMethod
from ..schemas.payment import (
    PaymentCreate,
    PaymentUpdate,
    PaymentResponse,
    PaymentListResponse,
    PaymentProcessRequest,
    PaymentRefundRequest,
    PaymentStatistics,
    PaymentSummary,
    BulkPaymentCreate
)
from ..services.payment_service import PaymentService
from ..auth.utils import get_current_active_user, get_current_manager
from ..models.user import User

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/", response_model=PaymentResponse)
def create_payment(
    payment: PaymentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """결제 생성"""
    try:
        db_payment = PaymentService.create_payment(db, payment)
        return PaymentResponse.model_validate(db_payment)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=PaymentListResponse)
def get_payments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[PaymentStatus] = None,
    customer_id: Optional[str] = None,
    contract_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """결제 목록 조회"""
    skip = (page - 1) * page_size
    
    payments = PaymentService.get_payments(
        db, skip, page_size, status, customer_id, contract_type, start_date, end_date
    )
    
    # 결제 목록을 PaymentResponse로 변환
    items = [PaymentResponse.model_validate(p) for p in payments]
    
    # 전체 개수 (실제로는 count 쿼리 필요)
    total = len(payments)
    
    return PaymentListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/overdue", response_model=List[PaymentResponse])
def get_overdue_payments(
    days_overdue: int = Query(0, ge=0),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """연체 결제 조회"""
    payments = PaymentService.get_overdue_payments(db, days_overdue)
    return [PaymentResponse.model_validate(p) for p in payments]


@router.get("/statistics", response_model=PaymentStatistics)
def get_payment_statistics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """결제 통계 조회"""
    return PaymentService.get_payment_statistics(db)


@router.get("/summary/{year}/{month}", response_model=PaymentSummary)
def get_monthly_summary(
    year: int,
    month: int = Query(..., ge=1, le=12),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """월별 결제 요약"""
    return PaymentService.get_monthly_summary(db, year, month)


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """결제 상세 조회"""
    payment = PaymentService.get_payment(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="결제를 찾을 수 없습니다.")
    
    return PaymentResponse.model_validate(payment)


@router.post("/{payment_id}/process", response_model=PaymentResponse)
def process_payment(
    payment_id: str,
    process_data: PaymentProcessRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """결제 처리"""
    try:
        payment = PaymentService.process_payment(db, payment_id, process_data)
        return PaymentResponse.model_validate(payment)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{payment_id}/refund", response_model=PaymentResponse)
def refund_payment(
    payment_id: str,
    refund_data: PaymentRefundRequest,
    current_user: User = Depends(get_current_manager),
    db: Session = Depends(get_db)
):
    """결제 환불"""
    try:
        payment = PaymentService.refund_payment(db, payment_id, refund_data)
        return PaymentResponse.model_validate(payment)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/lease/{lease_contract_id}/generate-monthly")
def generate_monthly_lease_payments(
    lease_contract_id: str,
    months: int = Query(1, ge=1, le=12),
    current_user: User = Depends(get_current_manager),
    db: Session = Depends(get_db)
):
    """월별 리스료 결제 생성"""
    try:
        payments = PaymentService.create_monthly_lease_payments(
            db, lease_contract_id, months
        )
        
        return {
            "message": f"{len(payments)}개의 월별 리스료 결제가 생성되었습니다.",
            "payment_ids": [p.id for p in payments]
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{payment_id}/remind")
def send_payment_reminder(
    payment_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """결제 알림 발송"""
    success = PaymentService.send_payment_reminder(db, payment_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="결제 또는 고객을 찾을 수 없습니다.")
    
    return {"message": "결제 알림이 발송되었습니다."}
