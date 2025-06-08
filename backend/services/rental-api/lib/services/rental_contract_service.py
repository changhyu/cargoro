"""
렌탈 계약 관리 서비스
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from ..models.database import RentalContract, Vehicle, Customer
from ..models.enums import RentalContractStatus, VehicleStatus
from ..schemas.rental_contract import (
    RentalContractCreate,
    RentalContractUpdate,
    RentalContractCalculation,
    RentalContractTermination
)


class RentalContractService:
    """렌탈 계약 관리 서비스"""

    @staticmethod
    def calculate_rental_cost(
        start_date: datetime,
        end_date: datetime,
        daily_rate: float,
        additional_options: list
    ) -> RentalContractCalculation:
        """렌탈 비용 계산"""
        days = (end_date - start_date).days + 1
        subtotal = daily_rate * days
        
        options_total = 0
        for option in additional_options:
            if option.unit == "DAY":
                options_total += option.price * days
            else:  # TOTAL
                options_total += option.price
        
        # 보험료 계산 (간단한 예시)
        insurance_cost = subtotal * 0.1
        
        # 보증금 (일일 요금의 10배)
        deposit = daily_rate * 10
        
        total_amount = subtotal + options_total + insurance_cost
        
        return RentalContractCalculation(
            days=days,
            daily_rate=daily_rate,
            subtotal=subtotal,
            options_total=options_total,
            insurance_cost=insurance_cost,
            deposit=deposit,
            total_amount=total_amount
        )

    @staticmethod
    def generate_contract_number() -> str:
        """계약 번호 생성"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        return f"RENT-{timestamp}"

    @staticmethod
    def create_rental_contract(
        db: Session,
        contract_data: RentalContractCreate
    ) -> RentalContract:
        """렌탈 계약 생성"""
        # 차량 상태 확인
        vehicle = db.query(Vehicle).filter(
            Vehicle.id == contract_data.vehicle_id
        ).first()
        
        if not vehicle:
            raise ValueError("차량을 찾을 수 없습니다.")
        
        if vehicle.status != VehicleStatus.AVAILABLE:
            raise ValueError("이용 가능한 차량이 아닙니다.")
        
        # 비용 계산
        calculation = RentalContractService.calculate_rental_cost(
            contract_data.start_date,
            contract_data.end_date,
            contract_data.daily_rate,
            contract_data.additional_options
        )
        
        # 계약 생성
        db_contract = RentalContract(
            **contract_data.model_dump(),
            contract_number=RentalContractService.generate_contract_number(),
            status=RentalContractStatus.ACTIVE,
            total_amount=calculation.total_amount
        )
        
        # 차량 상태 업데이트
        vehicle.status = VehicleStatus.RENTED
        
        db.add(db_contract)
        db.commit()
        db.refresh(db_contract)
        
        return db_contract

    @staticmethod
    def get_rental_contract(
        db: Session,
        contract_id: str
    ) -> Optional[RentalContract]:
        """렌탈 계약 조회"""
        return db.query(RentalContract).filter(
            RentalContract.id == contract_id
        ).first()

    @staticmethod
    def get_rental_contracts(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        status: Optional[RentalContractStatus] = None,
        customer_id: Optional[str] = None
    ) -> List[RentalContract]:
        """렌탈 계약 목록 조회"""
        query = db.query(RentalContract)
        
        if status:
            query = query.filter(RentalContract.status == status)
        if customer_id:
            query = query.filter(RentalContract.customer_id == customer_id)
            
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def update_rental_contract(
        db: Session,
        contract_id: str,
        contract_update: RentalContractUpdate
    ) -> Optional[RentalContract]:
        """렌탈 계약 업데이트"""
        db_contract = db.query(RentalContract).filter(
            RentalContract.id == contract_id
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
    def terminate_rental_contract(
        db: Session,
        contract_id: str,
        termination_data: RentalContractTermination
    ) -> Optional[RentalContract]:
        """렌탈 계약 종료"""
        db_contract = db.query(RentalContract).filter(
            RentalContract.id == contract_id
        ).first()
        
        if not db_contract:
            return None
            
        # 차량 상태 업데이트
        vehicle = db.query(Vehicle).filter(
            Vehicle.id == db_contract.vehicle_id
        ).first()
        
        if vehicle:
            vehicle.status = VehicleStatus.AVAILABLE
            vehicle.mileage = termination_data.final_mileage
        
        # 계약 상태 업데이트
        db_contract.status = RentalContractStatus.COMPLETED
        db_contract.updated_at = datetime.utcnow()
        
        # 추가 요금이나 환불 처리 (실제로는 Payment 생성 필요)
        
        db.commit()
        db.refresh(db_contract)
        
        return db_contract

    @staticmethod
    def get_active_rentals_count(db: Session) -> int:
        """활성 렌탈 계약 수 조회"""
        return db.query(func.count(RentalContract.id)).filter(
            RentalContract.status == RentalContractStatus.ACTIVE
        ).scalar()

    @staticmethod
    def get_rental_revenue(
        db: Session,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> float:
        """렌탈 수익 조회"""
        query = db.query(func.sum(RentalContract.total_amount)).filter(
            RentalContract.status.in_([
                RentalContractStatus.ACTIVE,
                RentalContractStatus.COMPLETED
            ])
        )
        
        if start_date:
            query = query.filter(RentalContract.created_at >= start_date)
        if end_date:
            query = query.filter(RentalContract.created_at <= end_date)
            
        result = query.scalar()
        return float(result) if result else 0.0

    @staticmethod
    def get_expiring_contracts(
        db: Session,
        days_ahead: int = 7
    ) -> List[RentalContract]:
        """만료 예정 계약 조회"""
        target_date = datetime.now() + timedelta(days=days_ahead)
        
        return db.query(RentalContract).filter(
            RentalContract.status == RentalContractStatus.ACTIVE,
            RentalContract.end_date <= target_date
        ).all()
