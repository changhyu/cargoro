"""
결제 관리 서비스
"""
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta, date
from dateutil.relativedelta import relativedelta

from ..models.database import Payment, RentalContract, LeaseContract, Customer
from ..models.enums import PaymentStatus, PaymentMethod
from ..schemas.payment import (
    PaymentCreate,
    PaymentUpdate,
    PaymentProcessRequest,
    PaymentRefundRequest,
    PaymentStatistics,
    PaymentSummary
)


class PaymentService:
    """결제 관리 서비스"""

    @staticmethod
    def create_payment(
        db: Session,
        payment_data: PaymentCreate
    ) -> Payment:
        """결제 생성"""
        # 계약 확인
        if payment_data.rental_contract_id:
            contract = db.query(RentalContract).filter(
                RentalContract.id == payment_data.rental_contract_id
            ).first()
            if not contract:
                raise ValueError("렌탈 계약을 찾을 수 없습니다.")
        elif payment_data.lease_contract_id:
            contract = db.query(LeaseContract).filter(
                LeaseContract.id == payment_data.lease_contract_id
            ).first()
            if not contract:
                raise ValueError("리스 계약을 찾을 수 없습니다.")
        else:
            raise ValueError("계약 ID가 필요합니다.")
        
        # 결제 생성
        db_payment = Payment(**payment_data.model_dump())
        db.add(db_payment)
        db.commit()
        db.refresh(db_payment)
        
        return db_payment

    @staticmethod
    def get_payment(
        db: Session,
        payment_id: str
    ) -> Optional[Payment]:
        """결제 조회"""
        return db.query(Payment).filter(Payment.id == payment_id).first()

    @staticmethod
    def get_payments(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        status: Optional[PaymentStatus] = None,
        customer_id: Optional[str] = None,
        contract_type: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Payment]:
        """결제 목록 조회"""
        query = db.query(Payment)
        
        if status:
            query = query.filter(Payment.status == status)
        if customer_id:
            query = query.filter(Payment.customer_id == customer_id)
        if contract_type:
            query = query.filter(Payment.contract_type == contract_type)
        
        if start_date:
            query = query.filter(Payment.due_date >= datetime.combine(start_date, datetime.min.time()))
        if end_date:
            query = query.filter(Payment.due_date <= datetime.combine(end_date, datetime.max.time()))
        
        return query.order_by(Payment.due_date.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def process_payment(
        db: Session,
        payment_id: str,
        process_data: PaymentProcessRequest
    ) -> Payment:
        """결제 처리"""
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        
        if not payment:
            raise ValueError("결제를 찾을 수 없습니다.")
        
        if payment.status != PaymentStatus.PENDING:
            raise ValueError("대기중인 결제만 처리할 수 있습니다.")
        
        # 실제 결제 처리 로직 (외부 PG 연동)
        # 여기서는 시뮬레이션
        payment_success = True  # 실제로는 PG 응답
        
        if payment_success:
            payment.status = PaymentStatus.COMPLETED
            payment.paid_date = datetime.utcnow()
            payment.payment_method = process_data.payment_method
            
            # 영수증 생성 (실제로는 PDF 생성 등)
            payment.receipt_url = f"/receipts/{payment.id}.pdf"
        else:
            payment.status = PaymentStatus.FAILED
        
        db.commit()
        db.refresh(payment)
        
        return payment

    @staticmethod
    def refund_payment(
        db: Session,
        payment_id: str,
        refund_data: PaymentRefundRequest
    ) -> Payment:
        """결제 환불"""
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        
        if not payment:
            raise ValueError("결제를 찾을 수 없습니다.")
        
        if payment.status != PaymentStatus.COMPLETED:
            raise ValueError("완료된 결제만 환불할 수 있습니다.")
        
        if refund_data.refund_amount > payment.amount:
            raise ValueError("환불 금액이 결제 금액을 초과할 수 없습니다.")
        
        # 실제 환불 처리 로직 (외부 PG 연동)
        refund_success = True  # 실제로는 PG 응답
        
        if refund_success:
            if refund_data.refund_amount == payment.amount:
                payment.status = PaymentStatus.REFUNDED
            else:
                # 부분 환불의 경우 새로운 결제 레코드 생성
                refund_payment = Payment(
                    customer_id=payment.customer_id,
                    rental_contract_id=payment.rental_contract_id,
                    lease_contract_id=payment.lease_contract_id,
                    contract_type=payment.contract_type,
                    amount=-refund_data.refund_amount,
                    status=PaymentStatus.COMPLETED,
                    payment_method=payment.payment_method,
                    due_date=datetime.utcnow(),
                    paid_date=datetime.utcnow()
                )
                db.add(refund_payment)
        
        db.commit()
        db.refresh(payment)
        
        return payment

    @staticmethod
    def get_overdue_payments(
        db: Session,
        days_overdue: int = 0
    ) -> List[Payment]:
        """연체 결제 조회"""
        cutoff_date = datetime.now() - timedelta(days=days_overdue)
        
        return db.query(Payment).filter(
            Payment.status == PaymentStatus.PENDING,
            Payment.due_date < cutoff_date
        ).all()

    @staticmethod
    def get_payment_statistics(db: Session) -> PaymentStatistics:
        """결제 통계 조회"""
        total_payments = db.query(func.count(Payment.id)).scalar()
        
        completed_payments = db.query(func.count(Payment.id)).filter(
            Payment.status == PaymentStatus.COMPLETED
        ).scalar()
        
        pending_payments = db.query(func.count(Payment.id)).filter(
            Payment.status == PaymentStatus.PENDING
        ).scalar()
        
        failed_payments = db.query(func.count(Payment.id)).filter(
            Payment.status == PaymentStatus.FAILED
        ).scalar()
        
        total_amount = db.query(func.sum(Payment.amount)).filter(
            Payment.status == PaymentStatus.COMPLETED
        ).scalar() or 0
        
        pending_amount = db.query(func.sum(Payment.amount)).filter(
            Payment.status == PaymentStatus.PENDING
        ).scalar() or 0
        
        # 연체 결제
        overdue_payments_query = db.query(Payment).filter(
            Payment.status == PaymentStatus.PENDING,
            Payment.due_date < datetime.now()
        )
        
        overdue_payments = overdue_payments_query.count()
        overdue_amount = db.query(func.sum(Payment.amount)).filter(
            Payment.status == PaymentStatus.PENDING,
            Payment.due_date < datetime.now()
        ).scalar() or 0
        
        return PaymentStatistics(
            total_payments=total_payments,
            completed_payments=completed_payments,
            pending_payments=pending_payments,
            failed_payments=failed_payments,
            total_amount=float(total_amount),
            pending_amount=float(pending_amount),
            overdue_payments=overdue_payments,
            overdue_amount=float(overdue_amount)
        )

    @staticmethod
    def get_monthly_summary(
        db: Session,
        year: int,
        month: int
    ) -> PaymentSummary:
        """월별 결제 요약"""
        start_date = datetime(year, month, 1)
        end_date = start_date + relativedelta(months=1) - timedelta(days=1)
        
        # 총 결제액
        total_amount = db.query(func.sum(Payment.amount)).filter(
            Payment.status == PaymentStatus.COMPLETED,
            Payment.paid_date >= start_date,
            Payment.paid_date <= end_date
        ).scalar() or 0
        
        # 렌탈 결제액
        rental_amount = db.query(func.sum(Payment.amount)).filter(
            Payment.status == PaymentStatus.COMPLETED,
            Payment.contract_type == "RENTAL",
            Payment.paid_date >= start_date,
            Payment.paid_date <= end_date
        ).scalar() or 0
        
        # 리스 결제액
        lease_amount = db.query(func.sum(Payment.amount)).filter(
            Payment.status == PaymentStatus.COMPLETED,
            Payment.contract_type == "LEASE",
            Payment.paid_date >= start_date,
            Payment.paid_date <= end_date
        ).scalar() or 0
        
        # 결제 건수
        payment_count = db.query(func.count(Payment.id)).filter(
            Payment.paid_date >= start_date,
            Payment.paid_date <= end_date
        ).scalar()
        
        # 수금률 계산
        due_amount = db.query(func.sum(Payment.amount)).filter(
            Payment.due_date >= start_date,
            Payment.due_date <= end_date
        ).scalar() or 0
        
        collection_rate = 0.0
        if due_amount > 0:
            collection_rate = (float(total_amount) / float(due_amount)) * 100
        
        return PaymentSummary(
            year=year,
            month=month,
            total_amount=float(total_amount),
            rental_amount=float(rental_amount),
            lease_amount=float(lease_amount),
            payment_count=payment_count,
            collection_rate=collection_rate
        )

    @staticmethod
    def create_monthly_lease_payments(
        db: Session,
        lease_contract_id: str,
        months: int = 1
    ) -> List[Payment]:
        """월별 리스료 결제 생성"""
        lease_contract = db.query(LeaseContract).filter(
            LeaseContract.id == lease_contract_id
        ).first()
        
        if not lease_contract:
            raise ValueError("리스 계약을 찾을 수 없습니다.")
        
        payments = []
        for i in range(months):
            due_date = datetime.now() + relativedelta(months=i)
            
            payment = Payment(
                customer_id=lease_contract.customer_id,
                lease_contract_id=lease_contract_id,
                contract_type="LEASE",
                amount=lease_contract.monthly_payment,
                payment_method=PaymentMethod.BANK_TRANSFER,
                due_date=due_date,
                status=PaymentStatus.PENDING
            )
            
            db.add(payment)
            payments.append(payment)
        
        db.commit()
        return payments

    @staticmethod
    def send_payment_reminder(
        db: Session,
        payment_id: str
    ) -> bool:
        """결제 알림 발송"""
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        
        if not payment:
            return False
        
        customer = db.query(Customer).filter(
            Customer.id == payment.customer_id
        ).first()
        
        if not customer:
            return False
        
        # 실제로는 이메일/SMS 발송
        # 여기서는 시뮬레이션
        print(f"결제 알림 발송: {customer.email} - {payment.amount}원")
        
        return True
