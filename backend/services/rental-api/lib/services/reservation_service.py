"""
예약 관리 서비스
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta, date

from ..models.database import Reservation, Vehicle, Customer
from ..models.enums import ReservationStatus, VehicleStatus
from ..schemas.reservation import (
    ReservationCreate,
    ReservationUpdate,
    ReservationStatistics
)


class ReservationService:
    """예약 관리 서비스"""

    @staticmethod
    def create_reservation(
        db: Session,
        reservation_data: ReservationCreate
    ) -> Reservation:
        """예약 생성"""
        # 차량 이용 가능 여부 확인
        vehicle = db.query(Vehicle).filter(
            Vehicle.id == reservation_data.vehicle_id
        ).first()
        
        if not vehicle:
            raise ValueError("차량을 찾을 수 없습니다.")
        
        if vehicle.status not in [VehicleStatus.AVAILABLE, VehicleStatus.RESERVED]:
            raise ValueError("예약 가능한 차량이 아닙니다.")
        
        # 고객 확인
        customer = db.query(Customer).filter(
            Customer.id == reservation_data.customer_id
        ).first()
        
        if not customer:
            raise ValueError("고객을 찾을 수 없습니다.")
        
        # 해당 날짜에 이미 예약이 있는지 확인
        existing_reservation = db.query(Reservation).filter(
            Reservation.vehicle_id == reservation_data.vehicle_id,
            Reservation.pickup_date == reservation_data.pickup_date,
            Reservation.status.in_([ReservationStatus.PENDING, ReservationStatus.CONFIRMED])
        ).first()
        
        if existing_reservation:
            raise ValueError("해당 날짜에 이미 예약이 있습니다.")
        
        # 예약 생성
        db_reservation = Reservation(
            **reservation_data.model_dump(),
            status=ReservationStatus.PENDING
        )
        
        # 차량 상태를 예약됨으로 변경
        if vehicle.status == VehicleStatus.AVAILABLE:
            vehicle.status = VehicleStatus.RESERVED
        
        db.add(db_reservation)
        db.commit()
        db.refresh(db_reservation)
        
        return db_reservation

    @staticmethod
    def get_reservation(
        db: Session,
        reservation_id: str
    ) -> Optional[Reservation]:
        """예약 조회"""
        return db.query(Reservation).filter(
            Reservation.id == reservation_id
        ).first()

    @staticmethod
    def get_reservations(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        status: Optional[ReservationStatus] = None,
        customer_id: Optional[str] = None,
        vehicle_id: Optional[str] = None,
        pickup_date: Optional[date] = None
    ) -> List[Reservation]:
        """예약 목록 조회"""
        query = db.query(Reservation)
        
        if status:
            query = query.filter(Reservation.status == status)
        if customer_id:
            query = query.filter(Reservation.customer_id == customer_id)
        if vehicle_id:
            query = query.filter(Reservation.vehicle_id == vehicle_id)
        if pickup_date:
            # 해당 날짜의 시작과 끝 시간 계산
            start_of_day = datetime.combine(pickup_date, datetime.min.time())
            end_of_day = datetime.combine(pickup_date, datetime.max.time())
            query = query.filter(
                and_(
                    Reservation.pickup_date >= start_of_day,
                    Reservation.pickup_date <= end_of_day
                )
            )
            
        return query.order_by(Reservation.pickup_date).offset(skip).limit(limit).all()

    @staticmethod
    def update_reservation(
        db: Session,
        reservation_id: str,
        reservation_update: ReservationUpdate
    ) -> Optional[Reservation]:
        """예약 업데이트"""
        db_reservation = db.query(Reservation).filter(
            Reservation.id == reservation_id
        ).first()
        
        if not db_reservation:
            return None
            
        update_data = reservation_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_reservation, field, value)
            
        db_reservation.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_reservation)
        
        return db_reservation

    @staticmethod
    def confirm_reservation(
        db: Session,
        reservation_id: str
    ) -> Optional[Reservation]:
        """예약 확정"""
        db_reservation = db.query(Reservation).filter(
            Reservation.id == reservation_id
        ).first()
        
        if not db_reservation:
            return None
            
        if db_reservation.status != ReservationStatus.PENDING:
            raise ValueError("대기중인 예약만 확정할 수 있습니다.")
            
        db_reservation.status = ReservationStatus.CONFIRMED
        db_reservation.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_reservation)
        
        return db_reservation

    @staticmethod
    def cancel_reservation(
        db: Session,
        reservation_id: str
    ) -> Optional[Reservation]:
        """예약 취소"""
        db_reservation = db.query(Reservation).filter(
            Reservation.id == reservation_id
        ).first()
        
        if not db_reservation:
            return None
            
        if db_reservation.status in [ReservationStatus.CANCELLED, ReservationStatus.COMPLETED]:
            raise ValueError("이미 취소되었거나 완료된 예약입니다.")
            
        # 차량 상태 업데이트
        vehicle = db.query(Vehicle).filter(
            Vehicle.id == db_reservation.vehicle_id
        ).first()
        
        if vehicle and vehicle.status == VehicleStatus.RESERVED:
            # 다른 예약이 있는지 확인
            other_reservations = db.query(Reservation).filter(
                Reservation.vehicle_id == vehicle.id,
                Reservation.id != reservation_id,
                Reservation.status.in_([ReservationStatus.PENDING, ReservationStatus.CONFIRMED])
            ).count()
            
            if other_reservations == 0:
                vehicle.status = VehicleStatus.AVAILABLE
        
        db_reservation.status = ReservationStatus.CANCELLED
        db_reservation.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_reservation)
        
        return db_reservation

    @staticmethod
    def complete_reservation(
        db: Session,
        reservation_id: str
    ) -> Optional[Reservation]:
        """예약 완료 처리"""
        db_reservation = db.query(Reservation).filter(
            Reservation.id == reservation_id
        ).first()
        
        if not db_reservation:
            return None
            
        if db_reservation.status != ReservationStatus.CONFIRMED:
            raise ValueError("확정된 예약만 완료 처리할 수 있습니다.")
            
        db_reservation.status = ReservationStatus.COMPLETED
        db_reservation.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_reservation)
        
        return db_reservation

    @staticmethod
    def get_today_pickups(db: Session) -> List[Reservation]:
        """오늘 픽업 예정 예약 조회"""
        today_start = datetime.combine(date.today(), datetime.min.time())
        today_end = datetime.combine(date.today(), datetime.max.time())
        
        return db.query(Reservation).filter(
            and_(
                Reservation.pickup_date >= today_start,
                Reservation.pickup_date <= today_end,
                Reservation.status.in_([ReservationStatus.PENDING, ReservationStatus.CONFIRMED])
            )
        ).all()

    @staticmethod
    def get_week_pickups(db: Session) -> List[Reservation]:
        """이번 주 픽업 예정 예약 조회"""
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        
        return db.query(Reservation).filter(
            and_(
                Reservation.pickup_date >= datetime.combine(week_start, datetime.min.time()),
                Reservation.pickup_date <= datetime.combine(week_end, datetime.max.time()),
                Reservation.status.in_([ReservationStatus.PENDING, ReservationStatus.CONFIRMED])
            )
        ).all()

    @staticmethod
    def get_reservations_by_date_range(
        db: Session,
        start_date: date,
        end_date: date
    ) -> List[Reservation]:
        """날짜 범위로 예약 조회"""
        return db.query(Reservation).filter(
            and_(
                Reservation.pickup_date >= datetime.combine(start_date, datetime.min.time()),
                Reservation.pickup_date <= datetime.combine(end_date, datetime.max.time())
            )
        ).order_by(Reservation.pickup_date).all()

    @staticmethod
    def get_reservation_statistics(db: Session) -> ReservationStatistics:
        """예약 통계 조회"""
        total_reservations = db.query(func.count(Reservation.id)).scalar()
        
        pending_reservations = db.query(func.count(Reservation.id)).filter(
            Reservation.status == ReservationStatus.PENDING
        ).scalar()
        
        confirmed_reservations = db.query(func.count(Reservation.id)).filter(
            Reservation.status == ReservationStatus.CONFIRMED
        ).scalar()
        
        cancelled_reservations = db.query(func.count(Reservation.id)).filter(
            Reservation.status == ReservationStatus.CANCELLED
        ).scalar()
        
        today_pickups = len(ReservationService.get_today_pickups(db))
        this_week_pickups = len(ReservationService.get_week_pickups(db))
        
        cancellation_rate = 0.0
        if total_reservations > 0:
            cancellation_rate = (cancelled_reservations / total_reservations) * 100
        
        return ReservationStatistics(
            total_reservations=total_reservations,
            pending_reservations=pending_reservations,
            confirmed_reservations=confirmed_reservations,
            today_pickups=today_pickups,
            this_week_pickups=this_week_pickups,
            cancellation_rate=cancellation_rate
        )

    @staticmethod
    def check_vehicle_availability(
        db: Session,
        vehicle_id: str,
        pickup_date: datetime,
        return_date: Optional[datetime] = None
    ) -> bool:
        """차량 이용 가능 여부 확인"""
        query = db.query(Reservation).filter(
            Reservation.vehicle_id == vehicle_id,
            Reservation.status.in_([ReservationStatus.PENDING, ReservationStatus.CONFIRMED])
        )
        
        if return_date:
            # 기간이 겹치는 예약 확인
            query = query.filter(
                or_(
                    and_(
                        Reservation.pickup_date <= pickup_date,
                        Reservation.return_date >= pickup_date
                    ),
                    and_(
                        Reservation.pickup_date <= return_date,
                        Reservation.return_date >= return_date
                    ),
                    and_(
                        Reservation.pickup_date >= pickup_date,
                        Reservation.return_date <= return_date
                    )
                )
            )
        else:
            # 같은 날짜에 예약이 있는지 확인
            pickup_date_only = pickup_date.date()
            query = query.filter(
                func.date(Reservation.pickup_date) == pickup_date_only
            )
        
        existing_reservation = query.first()
        return existing_reservation is None


# sqlalchemy.or_ 임포트 추가
from sqlalchemy import or_
