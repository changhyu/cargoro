"""
렌탈 계약 API 라우트
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime

from ..models import get_db
from ..models.enums import RentalContractStatus
from ..schemas.rental_contract import (
    RentalContractCreate,
    RentalContractUpdate,
    RentalContractResponse,
    RentalContractListResponse,
    RentalContractCalculation,
    RentalContractTermination
)
from ..services.rental_contract_service import RentalContractService
from ..services.customer_service import CustomerService
from ..services.vehicle_service import VehicleService

router = APIRouter(prefix="/rental-contracts", tags=["rental-contracts"])


@router.post("/calculate", response_model=RentalContractCalculation)
def calculate_rental_cost(
    start_date: datetime,
    end_date: datetime,
    daily_rate: float,
    additional_options: List[dict] = []
):
    """렌탈 비용 계산"""
    if start_date >= end_date:
        raise HTTPException(
            status_code=400,
            detail="종료일은 시작일보다 늦어야 합니다."
        )
    
    # 추가 옵션 객체 변환
    from ..schemas.rental_contract import AdditionalOption
    options = [AdditionalOption(**opt) for opt in additional_options]
    
    return RentalContractService.calculate_rental_cost(
        start_date, end_date, daily_rate, options
    )


@router.post("/", response_model=RentalContractResponse)
def create_rental_contract(
    contract: RentalContractCreate,
    db: Session = Depends(get_db)
):
    """새 렌탈 계약 생성"""
    # 고객 확인
    customer = CustomerService.get_customer(db, contract.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="고객을 찾을 수 없습니다.")
    
    try:
        db_contract = RentalContractService.create_rental_contract(db, contract)
        
        # 응답 데이터 보강
        response = RentalContractResponse.model_validate(db_contract)
        response.customer_name = customer.name
        
        vehicle = VehicleService.get_vehicle(db, contract.vehicle_id)
        if vehicle:
            response.vehicle_info = f"{vehicle.make} {vehicle.model}"
        
        return response
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=RentalContractListResponse)
def get_rental_contracts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[RentalContractStatus] = None,
    customer_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """렌탈 계약 목록 조회"""
    skip = (page - 1) * page_size
    
    contracts = RentalContractService.get_rental_contracts(
        db, skip, page_size, status, customer_id
    )
    
    # 고객명과 차량 정보 추가
    items = []
    for contract in contracts:
        response = RentalContractResponse.model_validate(contract)
        
        customer = CustomerService.get_customer(db, contract.customer_id)
        if customer:
            response.customer_name = customer.name
        
        vehicle = VehicleService.get_vehicle(db, contract.vehicle_id)
        if vehicle:
            response.vehicle_info = f"{vehicle.make} {vehicle.model}"
        
        items.append(response)
    
    total = 100  # 실제로는 count 쿼리 필요
    
    return RentalContractListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/expiring", response_model=List[RentalContractResponse])
def get_expiring_contracts(
    days_ahead: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db)
):
    """만료 예정 계약 조회"""
    contracts = RentalContractService.get_expiring_contracts(db, days_ahead)
    
    items = []
    for contract in contracts:
        response = RentalContractResponse.model_validate(contract)
        
        customer = CustomerService.get_customer(db, contract.customer_id)
        if customer:
            response.customer_name = customer.name
        
        vehicle = VehicleService.get_vehicle(db, contract.vehicle_id)
        if vehicle:
            response.vehicle_info = f"{vehicle.make} {vehicle.model}"
        
        items.append(response)
    
    return items


@router.get("/{contract_id}", response_model=RentalContractResponse)
def get_rental_contract(
    contract_id: str,
    db: Session = Depends(get_db)
):
    """렌탈 계약 상세 조회"""
    contract = RentalContractService.get_rental_contract(db, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="계약을 찾을 수 없습니다.")
    
    response = RentalContractResponse.model_validate(contract)
    
    customer = CustomerService.get_customer(db, contract.customer_id)
    if customer:
        response.customer_name = customer.name
    
    vehicle = VehicleService.get_vehicle(db, contract.vehicle_id)
    if vehicle:
        response.vehicle_info = f"{vehicle.make} {vehicle.model}"
    
    return response


@router.put("/{contract_id}", response_model=RentalContractResponse)
def update_rental_contract(
    contract_id: str,
    contract_update: RentalContractUpdate,
    db: Session = Depends(get_db)
):
    """렌탈 계약 수정"""
    contract = RentalContractService.update_rental_contract(
        db, contract_id, contract_update
    )
    if not contract:
        raise HTTPException(status_code=404, detail="계약을 찾을 수 없습니다.")
    
    response = RentalContractResponse.model_validate(contract)
    
    customer = CustomerService.get_customer(db, contract.customer_id)
    if customer:
        response.customer_name = customer.name
    
    vehicle = VehicleService.get_vehicle(db, contract.vehicle_id)
    if vehicle:
        response.vehicle_info = f"{vehicle.make} {vehicle.model}"
    
    return response


@router.post("/{contract_id}/terminate", response_model=RentalContractResponse)
def terminate_rental_contract(
    contract_id: str,
    termination_data: RentalContractTermination,
    db: Session = Depends(get_db)
):
    """렌탈 계약 종료"""
    contract = RentalContractService.terminate_rental_contract(
        db, contract_id, termination_data
    )
    if not contract:
        raise HTTPException(status_code=404, detail="계약을 찾을 수 없습니다.")
    
    response = RentalContractResponse.model_validate(contract)
    
    customer = CustomerService.get_customer(db, contract.customer_id)
    if customer:
        response.customer_name = customer.name
    
    vehicle = VehicleService.get_vehicle(db, contract.vehicle_id)
    if vehicle:
        response.vehicle_info = f"{vehicle.make} {vehicle.model}"
    
    return response


@router.get("/statistics/revenue")
def get_rental_revenue(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """렌탈 수익 조회"""
    revenue = RentalContractService.get_rental_revenue(db, start_date, end_date)
    active_count = RentalContractService.get_active_rentals_count(db)
    
    return {
        "revenue": revenue,
        "active_contracts": active_count,
        "period": {
            "start_date": start_date,
            "end_date": end_date
        }
    }
