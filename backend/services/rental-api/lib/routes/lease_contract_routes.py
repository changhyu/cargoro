"""
리스 계약 API 라우트
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime

from ..models import get_db
from ..models.enums import LeaseContractStatus, LeaseType
from ..schemas.lease_contract import (
    LeaseContractCreate,
    LeaseContractUpdate,
    LeaseContractResponse,
    LeaseContractListResponse,
    LeaseContractCalculation,
    LeaseContractTermination
)
from ..services.lease_contract_service import LeaseContractService
from ..services.customer_service import CustomerService
from ..services.vehicle_service import VehicleService

router = APIRouter(prefix="/lease-contracts", tags=["lease-contracts"])


@router.post("/calculate", response_model=LeaseContractCalculation)
def calculate_lease_terms(
    start_date: datetime,
    end_date: datetime,
    monthly_payment: float,
    down_payment: float,
    residual_value: float,
    annual_mileage_limit: int
):
    """리스 조건 계산"""
    if start_date >= end_date:
        raise HTTPException(
            status_code=400,
            detail="종료일은 시작일보다 늦어야 합니다."
        )
    
    return LeaseContractService.calculate_lease_terms(
        start_date,
        end_date,
        monthly_payment,
        down_payment,
        residual_value,
        annual_mileage_limit
    )


@router.post("/", response_model=LeaseContractResponse)
def create_lease_contract(
    contract: LeaseContractCreate,
    db: Session = Depends(get_db)
):
    """새 리스 계약 생성"""
    # 고객 확인
    customer = CustomerService.get_customer(db, contract.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="고객을 찾을 수 없습니다.")
    
    # 법인 고객인 경우 추가 검증
    if customer.type == "INDIVIDUAL" and contract.lease_type == "FINANCIAL":
        raise HTTPException(
            status_code=400,
            detail="개인 고객은 금융리스를 이용할 수 없습니다."
        )
    
    try:
        db_contract = LeaseContractService.create_lease_contract(db, contract)
        
        # 응답 데이터 보강
        calculation = LeaseContractService.calculate_lease_terms(
            db_contract.start_date,
            db_contract.end_date,
            db_contract.monthly_payment,
            db_contract.down_payment,
            db_contract.residual_value,
            db_contract.mileage_limit
        )
        
        response = LeaseContractResponse.model_validate(db_contract)
        response.customer_name = customer.name
        response.total_payments = calculation.total_payments
        response.remaining_months = calculation.contract_months
        
        vehicle = VehicleService.get_vehicle(db, contract.vehicle_id)
        if vehicle:
            response.vehicle_info = f"{vehicle.make} {vehicle.model}"
        
        return response
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=LeaseContractListResponse)
def get_lease_contracts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[LeaseContractStatus] = None,
    lease_type: Optional[LeaseType] = None,
    customer_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """리스 계약 목록 조회"""
    skip = (page - 1) * page_size
    
    contracts = LeaseContractService.get_lease_contracts(
        db, skip, page_size, status, customer_id, lease_type
    )
    
    # 고객명과 차량 정보 추가
    items = []
    for contract in contracts:
        calculation = LeaseContractService.calculate_lease_terms(
            contract.start_date,
            contract.end_date,
            contract.monthly_payment,
            contract.down_payment,
            contract.residual_value,
            contract.mileage_limit
        )
        
        response = LeaseContractResponse.model_validate(contract)
        response.total_payments = calculation.total_payments
        response.remaining_months = max(0, calculation.contract_months - 
                                       relativedelta(datetime.now(), contract.start_date).months)
        
        customer = CustomerService.get_customer(db, contract.customer_id)
        if customer:
            response.customer_name = customer.name
        
        vehicle = VehicleService.get_vehicle(db, contract.vehicle_id)
        if vehicle:
            response.vehicle_info = f"{vehicle.make} {vehicle.model}"
        
        items.append(response)
    
    total = 100  # 실제로는 count 쿼리 필요
    
    return LeaseContractListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/expiring", response_model=List[LeaseContractResponse])
def get_expiring_contracts(
    days_ahead: int = Query(30, ge=1, le=90),
    db: Session = Depends(get_db)
):
    """만료 예정 리스 계약 조회"""
    contracts = LeaseContractService.get_expiring_contracts(db, days_ahead)
    
    items = []
    for contract in contracts:
        calculation = LeaseContractService.calculate_lease_terms(
            contract.start_date,
            contract.end_date,
            contract.monthly_payment,
            contract.down_payment,
            contract.residual_value,
            contract.mileage_limit
        )
        
        response = LeaseContractResponse.model_validate(contract)
        response.total_payments = calculation.total_payments
        response.remaining_months = max(0, calculation.contract_months - 
                                       relativedelta(datetime.now(), contract.start_date).months)
        
        customer = CustomerService.get_customer(db, contract.customer_id)
        if customer:
            response.customer_name = customer.name
        
        vehicle = VehicleService.get_vehicle(db, contract.vehicle_id)
        if vehicle:
            response.vehicle_info = f"{vehicle.make} {vehicle.model}"
        
        items.append(response)
    
    return items


@router.get("/statistics")
def get_lease_statistics(db: Session = Depends(get_db)):
    """리스 통계 조회"""
    active_count = LeaseContractService.get_active_leases_count(db)
    monthly_revenue = LeaseContractService.get_monthly_lease_revenue(db)
    
    return {
        "active_contracts": active_count,
        "monthly_revenue": monthly_revenue,
        "annual_revenue_projection": monthly_revenue * 12
    }


@router.get("/{contract_id}", response_model=LeaseContractResponse)
def get_lease_contract(
    contract_id: str,
    db: Session = Depends(get_db)
):
    """리스 계약 상세 조회"""
    contract = LeaseContractService.get_lease_contract(db, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="계약을 찾을 수 없습니다.")
    
    calculation = LeaseContractService.calculate_lease_terms(
        contract.start_date,
        contract.end_date,
        contract.monthly_payment,
        contract.down_payment,
        contract.residual_value,
        contract.mileage_limit
    )
    
    response = LeaseContractResponse.model_validate(contract)
    response.total_payments = calculation.total_payments
    response.remaining_months = max(0, calculation.contract_months - 
                                   relativedelta(datetime.now(), contract.start_date).months)
    
    customer = CustomerService.get_customer(db, contract.customer_id)
    if customer:
        response.customer_name = customer.name
    
    vehicle = VehicleService.get_vehicle(db, contract.vehicle_id)
    if vehicle:
        response.vehicle_info = f"{vehicle.make} {vehicle.model}"
    
    return response


@router.put("/{contract_id}", response_model=LeaseContractResponse)
def update_lease_contract(
    contract_id: str,
    contract_update: LeaseContractUpdate,
    db: Session = Depends(get_db)
):
    """리스 계약 수정"""
    contract = LeaseContractService.update_lease_contract(
        db, contract_id, contract_update
    )
    if not contract:
        raise HTTPException(status_code=404, detail="계약을 찾을 수 없습니다.")
    
    calculation = LeaseContractService.calculate_lease_terms(
        contract.start_date,
        contract.end_date,
        contract.monthly_payment,
        contract.down_payment,
        contract.residual_value,
        contract.mileage_limit
    )
    
    response = LeaseContractResponse.model_validate(contract)
    response.total_payments = calculation.total_payments
    response.remaining_months = max(0, calculation.contract_months - 
                                   relativedelta(datetime.now(), contract.start_date).months)
    
    customer = CustomerService.get_customer(db, contract.customer_id)
    if customer:
        response.customer_name = customer.name
    
    vehicle = VehicleService.get_vehicle(db, contract.vehicle_id)
    if vehicle:
        response.vehicle_info = f"{vehicle.make} {vehicle.model}"
    
    return response


@router.post("/{contract_id}/terminate", response_model=LeaseContractResponse)
def terminate_lease_contract(
    contract_id: str,
    termination_data: LeaseContractTermination,
    db: Session = Depends(get_db)
):
    """리스 계약 중도 해지"""
    # 중도 해지 수수료 계산
    contract = LeaseContractService.get_lease_contract(db, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="계약을 찾을 수 없습니다.")
    
    early_termination_fee = LeaseContractService.calculate_early_termination_fee(
        contract,
        termination_data.termination_date
    )
    
    # 실제 해지 처리
    contract = LeaseContractService.terminate_lease_contract(
        db, contract_id, termination_data
    )
    
    calculation = LeaseContractService.calculate_lease_terms(
        contract.start_date,
        contract.end_date,
        contract.monthly_payment,
        contract.down_payment,
        contract.residual_value,
        contract.mileage_limit
    )
    
    response = LeaseContractResponse.model_validate(contract)
    response.total_payments = calculation.total_payments
    response.remaining_months = 0
    
    customer = CustomerService.get_customer(db, contract.customer_id)
    if customer:
        response.customer_name = customer.name
    
    vehicle = VehicleService.get_vehicle(db, contract.vehicle_id)
    if vehicle:
        response.vehicle_info = f"{vehicle.make} {vehicle.model}"
    
    return response


@router.get("/{contract_id}/mileage-check")
def check_mileage_excess(
    contract_id: str,
    current_mileage: int,
    vehicle_initial_mileage: int,
    db: Session = Depends(get_db)
):
    """주행거리 초과 확인"""
    is_excess, excess_charge = LeaseContractService.check_mileage_excess(
        db,
        contract_id,
        current_mileage,
        vehicle_initial_mileage
    )
    
    return {
        "is_excess": is_excess,
        "excess_charge": excess_charge,
        "current_mileage": current_mileage,
        "driven_mileage": current_mileage - vehicle_initial_mileage
    }


# dateutil 임포트 추가 필요
from dateutil.relativedelta import relativedelta
