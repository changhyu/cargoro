"""
고객 관리 API 라우트
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..models import get_db
from ..models.enums import CustomerType, VerificationStatus
from ..schemas.customer import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
    CustomerListResponse,
    CustomerVerification,
    CustomerStatistics,
    CustomerContractSummary
)
from ..services.customer_service import CustomerService

router = APIRouter(prefix="/customers", tags=["customers"])


@router.post("/", response_model=CustomerResponse)
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db)
):
    """새 고객 등록"""
    # 중복 이메일 확인
    existing_customer = CustomerService.get_customer_by_email(db, customer.email)
    if existing_customer:
        raise HTTPException(
            status_code=400,
            detail="이미 등록된 이메일입니다."
        )
    
    db_customer = CustomerService.create_customer(db, customer)
    return CustomerResponse.model_validate(db_customer)


@router.get("/", response_model=CustomerListResponse)
def get_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    customer_type: Optional[CustomerType] = None,
    verification_status: Optional[VerificationStatus] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """고객 목록 조회"""
    skip = (page - 1) * page_size
    
    if search:
        customers = CustomerService.search_customers(db, search, skip, page_size)
        total = len(customers)  # 실제로는 count 쿼리 필요
    else:
        customers = CustomerService.get_customers(
            db, skip, page_size, customer_type, verification_status
        )
        total = 100  # 실제로는 count 쿼리 필요
    
    items = [CustomerResponse.model_validate(c) for c in customers]
    
    return CustomerListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/statistics", response_model=CustomerStatistics)
def get_customer_statistics(db: Session = Depends(get_db)):
    """고객 통계 조회"""
    return CustomerService.get_customer_statistics(db)


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: str, db: Session = Depends(get_db)):
    """고객 상세 조회"""
    customer = CustomerService.get_customer(db, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="고객을 찾을 수 없습니다.")
    return CustomerResponse.model_validate(customer)


@router.get("/{customer_id}/contracts", response_model=CustomerContractSummary)
def get_customer_contracts(customer_id: str, db: Session = Depends(get_db)):
    """고객 계약 요약 조회"""
    customer = CustomerService.get_customer(db, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="고객을 찾을 수 없습니다.")
    
    return CustomerService.get_customer_contracts(db, customer_id)


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: str,
    customer_update: CustomerUpdate,
    db: Session = Depends(get_db)
):
    """고객 정보 수정"""
    customer = CustomerService.update_customer(db, customer_id, customer_update)
    if not customer:
        raise HTTPException(status_code=404, detail="고객을 찾을 수 없습니다.")
    return CustomerResponse.model_validate(customer)


@router.post("/{customer_id}/verify", response_model=CustomerResponse)
def verify_customer(
    customer_id: str,
    verification: CustomerVerification,
    db: Session = Depends(get_db)
):
    """고객 검증"""
    customer = CustomerService.verify_customer(db, customer_id, verification)
    if not customer:
        raise HTTPException(status_code=404, detail="고객을 찾을 수 없습니다.")
    return CustomerResponse.model_validate(customer)


@router.delete("/{customer_id}")
def delete_customer(customer_id: str, db: Session = Depends(get_db)):
    """고객 삭제"""
    success = CustomerService.delete_customer(db, customer_id)
    if not success:
        raise HTTPException(status_code=404, detail="고객을 찾을 수 없습니다.")
    return {"message": "고객이 성공적으로 삭제되었습니다."}
