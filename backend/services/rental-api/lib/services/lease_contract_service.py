"""
리스 계약 관리 서비스
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

from ..models.database import LeaseContract, Vehicle, Customer
from ..models.enums import LeaseContractStatus, VehicleStatus
from ..schemas.lease_contract import (
    LeaseContractCreate,
    LeaseContractUpdate,
    LeaseContractCalculation,
    LeaseContractTermination
)


class LeaseContractService:
    """리스 계약 관리 서비스"""

    @staticmethod
    def calculate_lease_terms(
        start_date: datetime,
        end_date: datetime,
        monthly_payment: float,
        down_payment: float,
        residual_value: float,
        annual_mileage_limit: int
    ) -> LeaseContractCalculation:
        """리스 조건 계산"""
        # 계약 개월수 계산
        months_diff = relativedelta(end_date, start_date)
        contract_months = months_diff.years * 12 + months_diff.months
        
        # 총 납입액 계산
        total_payments = down_payment + (monthly_payment * contract_months)
        
        # 총 주행거리 제한 계산
        total_mileage_limit = annual_mileage_limit * (contract_months // 12)
        if contract_months % 12:
            total_mileage_limit += int(annual_mileage_limit * (contract_months % 12) / 12)
        
        return LeaseContractCalculation(
            contract_months=contract_months,
            monthly_payment=monthly_payment,
            down_payment=down_payment,
            total_payments=total_payments,
            residual_value=residual_value,
            annual_mileage_limit=annual_mileage_limit,
            total_mileage_limit=total_mileage_limit
        )

    @staticmethod
    def generate_contract_number() -> str:
        """계약 번호 생성"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        return f"LEASE-{timestamp}"

    @staticmethod
    def create_lease_contract(
        db: Session,
        contract_data: LeaseContractCreate
    ) -> LeaseContract:
        """리스 계약 생성"""
        # 차량 상태 확인
        vehicle = db.query(Vehicle).filter(
            Vehicle.id == contract_data.vehicle_id
        ).first()
        
        if not vehicle:
            raise ValueError("차량을 찾을 수 없습니다.")
        
        if vehicle.status != VehicleStatus.AVAILABLE:
            raise ValueError("이용 가능한 차량이 아닙니다.")
        
        # 계약 생성
        db_contract = LeaseContract(
            **contract_data.model_dump(),
            contract_number=LeaseContractService.generate_contract_number(),
            status=LeaseContractStatus.ACTIVE
        )
        
        # 차량 상태 업데이트
        vehicle.status = VehicleStatus.RENTED
        
        db.add(db_contract)
        db.commit()
        db.refresh(db_contract)
        
        return db_contract

    @staticmethod
    def get_lease_contract(
        db: Session,
        contract_id: str
    ) -> Optional[LeaseContract]:
        """리스 계약 조회"""
        return db.query(LeaseContract).filter(
            LeaseContract.id == contract_id
        ).first()

    @staticmethod
    def get_lease_contracts(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        status: Optional[LeaseContractStatus] = None,
        customer_id: Optional[str] = None,
        lease_type: Optional[str] = None
    ) -> List[LeaseContract]:
        """리스 계약 목록 조회"""
        query = db.query(LeaseContract)
        
        if status:
            query = query.filter(LeaseContract.status == status)
        if customer_id:
            query = query.filter(LeaseContract.customer_id == customer_id)
        if lease_type:
            query = query.filter(LeaseContract.lease_type == lease_type)
            
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def update_lease_contract(
        db: Session,
        contract_id: str,
        contract_update: LeaseContractUpdate
    ) -> Optional[LeaseContract]:
        """리스 계약 업데이트"""
        db_contract = db.query(LeaseContract).filter(
            LeaseContract.id == contract_id
        ).first()
        
        if not db_contract:
            return None
            
        update_data = contract_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_contract, field, value)
            
        db_contract.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_contract)
        
        return db_contract

    @staticmethod
    def terminate_lease_contract(
        db: Session,
        contract_id: str,
        termination_data: LeaseContractTermination
    ) -> Optional[LeaseContract]:
        """리스 계약 중도 해지"""
        db_contract = db.query(LeaseContract).filter(
            LeaseContract.id == contract_id
        ).first()
        
        if not db_contract:
            return None
        
        # 차량 상태 업데이트
        vehicle = db.query(Vehicle).filter(
            Vehicle.id == db_contract.vehicle_id
        ).first()
        
        if vehicle:
            vehicle.status = VehicleStatus.AVAILABLE
            vehicle.mileage = termination_data.current_mileage
        
        # 계약 상태 업데이트
        db_contract.status = LeaseContractStatus.TERMINATED
        db_contract.updated_at = datetime.utcnow()
        
        # 중도 해지 수수료 계산 등은 실제 비즈니스 로직에 따라 구현
        
        db.commit()
        db.refresh(db_contract)
        
        return db_contract

    @staticmethod
    def get_active_leases_count(db: Session) -> int:
        """활성 리스 계약 수 조회"""
        return db.query(func.count(LeaseContract.id)).filter(
            LeaseContract.status == LeaseContractStatus.ACTIVE
        ).scalar()

    @staticmethod
    def get_monthly_lease_revenue(db: Session) -> float:
        """월 리스료 수익 조회"""
        result = db.query(func.sum(LeaseContract.monthly_payment)).filter(
            LeaseContract.status == LeaseContractStatus.ACTIVE
        ).scalar()
        
        return float(result) if result else 0.0

    @staticmethod
    def get_expiring_contracts(
        db: Session,
        days_ahead: int = 30
    ) -> List[LeaseContract]:
        """만료 예정 리스 계약 조회"""
        target_date = datetime.now() + timedelta(days=days_ahead)
        
        return db.query(LeaseContract).filter(
            LeaseContract.status == LeaseContractStatus.ACTIVE,
            LeaseContract.end_date <= target_date
        ).all()

    @staticmethod
    def calculate_early_termination_fee(
        db_contract: LeaseContract,
        termination_date: datetime
    ) -> float:
        """중도 해지 수수료 계산"""
        # 잔여 개월수 계산
        remaining_months = relativedelta(db_contract.end_date, termination_date).months
        
        # 일반적으로 잔여 개월수의 일정 비율을 수수료로 책정
        # 예: 잔여 개월수 * 월 납입금의 10%
        fee = remaining_months * db_contract.monthly_payment * 0.1
        
        return fee

    @staticmethod
    def check_mileage_excess(
        db: Session,
        contract_id: str,
        current_mileage: int,
        vehicle_initial_mileage: int
    ) -> tuple[bool, float]:
        """주행거리 초과 확인"""
        db_contract = db.query(LeaseContract).filter(
            LeaseContract.id == contract_id
        ).first()
        
        if not db_contract:
            return False, 0.0
        
        # 계약 기간 동안의 주행거리
        contract_mileage = current_mileage - vehicle_initial_mileage
        
        # 현재까지의 허용 주행거리 계산
        months_passed = relativedelta(datetime.now(), db_contract.start_date).months
        allowed_mileage = (db_contract.mileage_limit / 12) * months_passed
        
        if contract_mileage > allowed_mileage:
            excess_mileage = contract_mileage - allowed_mileage
            excess_charge = excess_mileage * db_contract.excess_mileage_rate
            return True, excess_charge
        
        return False, 0.0
