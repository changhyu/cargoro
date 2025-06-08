"""
고객 관리 서비스
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from ..models.database import Customer, RentalContract, LeaseContract
from ..models.enums import CustomerType, VerificationStatus
from ..schemas.customer import (
    CustomerCreate,
    CustomerUpdate,
    CustomerVerification,
    CustomerStatistics,
    CustomerContractSummary
)


class CustomerService:
    """고객 관리 서비스"""

    @staticmethod
    def create_customer(db: Session, customer_data: CustomerCreate) -> Customer:
        """고객 생성"""
        db_customer = Customer(**customer_data.model_dump())
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        return db_customer

    @staticmethod
    def get_customer(db: Session, customer_id: str) -> Optional[Customer]:
        """고객 ID로 조회"""
        return db.query(Customer).filter(Customer.id == customer_id).first()

    @staticmethod
    def get_customer_by_email(db: Session, email: str) -> Optional[Customer]:
        """이메일로 고객 조회"""
        return db.query(Customer).filter(Customer.email == email).first()

    @staticmethod
    def get_customers(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        customer_type: Optional[CustomerType] = None,
        verification_status: Optional[VerificationStatus] = None
    ) -> List[Customer]:
        """고객 목록 조회"""
        query = db.query(Customer)
        
        if customer_type:
            query = query.filter(Customer.type == customer_type)
        if verification_status:
            query = query.filter(Customer.verification_status == verification_status)
            
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def update_customer(
        db: Session,
        customer_id: str,
        customer_update: CustomerUpdate
    ) -> Optional[Customer]:
        """고객 정보 업데이트"""
        db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
        
        if not db_customer:
            return None
            
        update_data = customer_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_customer, field, value)
            
        db_customer.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_customer)
        return db_customer

    @staticmethod
    def verify_customer(
        db: Session,
        customer_id: str,
        verification: CustomerVerification
    ) -> Optional[Customer]:
        """고객 검증"""
        db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
        
        if not db_customer:
            return None
            
        db_customer.verification_status = verification.verification_status
        if verification.credit_score is not None:
            db_customer.credit_score = verification.credit_score
            
        db_customer.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_customer)
        return db_customer

    @staticmethod
    def delete_customer(db: Session, customer_id: str) -> bool:
        """고객 삭제"""
        db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
        
        if not db_customer:
            return False
            
        db.delete(db_customer)
        db.commit()
        return True

    @staticmethod
    def get_customer_statistics(db: Session) -> CustomerStatistics:
        """고객 통계 조회"""
        total_customers = db.query(func.count(Customer.id)).scalar()
        
        individual_customers = db.query(func.count(Customer.id)).filter(
            Customer.type == CustomerType.INDIVIDUAL
        ).scalar()
        
        corporate_customers = db.query(func.count(Customer.id)).filter(
            Customer.type == CustomerType.CORPORATE
        ).scalar()
        
        verified_customers = db.query(func.count(Customer.id)).filter(
            Customer.verification_status == VerificationStatus.VERIFIED
        ).scalar()
        
        pending_verification = db.query(func.count(Customer.id)).filter(
            Customer.verification_status == VerificationStatus.PENDING
        ).scalar()
        
        # 활성 계약이 있는 고객 수 (실제로는 JOIN 쿼리 필요)
        active_customers = 0
        
        return CustomerStatistics(
            total_customers=total_customers,
            individual_customers=individual_customers,
            corporate_customers=corporate_customers,
            verified_customers=verified_customers,
            pending_verification=pending_verification,
            active_customers=active_customers
        )

    @staticmethod
    def get_customer_contracts(
        db: Session,
        customer_id: str
    ) -> CustomerContractSummary:
        """고객 계약 요약 조회"""
        # 렌탈 계약
        rental_contracts = db.query(RentalContract).filter(
            RentalContract.customer_id == customer_id
        ).all()
        
        active_rentals = len([c for c in rental_contracts if c.status == 'ACTIVE'])
        rental_revenue = sum(c.total_amount for c in rental_contracts)
        
        # 리스 계약
        lease_contracts = db.query(LeaseContract).filter(
            LeaseContract.customer_id == customer_id
        ).all()
        
        active_leases = len([c for c in lease_contracts if c.status == 'ACTIVE'])
        lease_revenue = sum(
            c.monthly_payment * 12 for c in lease_contracts
        )  # 간단한 계산
        
        return CustomerContractSummary(
            customer_id=customer_id,
            total_contracts=len(rental_contracts) + len(lease_contracts),
            active_rentals=active_rentals,
            active_leases=active_leases,
            total_revenue=rental_revenue + lease_revenue,
            overdue_amount=0  # 실제로는 Payment 테이블 조회 필요
        )

    @staticmethod
    def search_customers(
        db: Session,
        search_term: str,
        skip: int = 0,
        limit: int = 20
    ) -> List[Customer]:
        """고객 검색"""
        search_pattern = f"%{search_term}%"
        
        return db.query(Customer).filter(
            (Customer.name.ilike(search_pattern)) |
            (Customer.email.ilike(search_pattern)) |
            (Customer.phone.ilike(search_pattern))
        ).offset(skip).limit(limit).all()
