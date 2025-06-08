"""
차량 관리 서비스
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from ..models.database import Vehicle
from ..models.enums import VehicleStatus
from ..schemas.vehicle import (
    VehicleCreate,
    VehicleUpdate,
    VehicleInDB,
    VehicleStatistics
)


class VehicleService:
    """차량 관리 서비스"""

    @staticmethod
    def create_vehicle(db: Session, vehicle_data: VehicleCreate) -> Vehicle:
        """차량 생성"""
        db_vehicle = Vehicle(**vehicle_data.model_dump())
        db.add(db_vehicle)
        db.commit()
        db.refresh(db_vehicle)
        return db_vehicle

    @staticmethod
    def get_vehicle(db: Session, vehicle_id: str) -> Optional[Vehicle]:
        """차량 ID로 조회"""
        return db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

    @staticmethod
    def get_vehicle_by_registration(db: Session, registration_number: str) -> Optional[Vehicle]:
        """번호판으로 차량 조회"""
        return db.query(Vehicle).filter(
            Vehicle.registration_number == registration_number
        ).first()

    @staticmethod
    def get_vehicles(
        db: Session,
        skip: int = 0,
        limit: int = 20,
        status: Optional[VehicleStatus] = None,
        category: Optional[str] = None
    ) -> List[Vehicle]:
        """차량 목록 조회"""
        query = db.query(Vehicle)
        
        if status:
            query = query.filter(Vehicle.status == status)
        if category:
            query = query.filter(Vehicle.category == category)
            
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_available_vehicles(db: Session) -> List[Vehicle]:
        """이용 가능한 차량 조회"""
        return db.query(Vehicle).filter(
            Vehicle.status == VehicleStatus.AVAILABLE
        ).all()

    @staticmethod
    def update_vehicle(
        db: Session,
        vehicle_id: str,
        vehicle_update: VehicleUpdate
    ) -> Optional[Vehicle]:
        """차량 정보 업데이트"""
        db_vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        
        if not db_vehicle:
            return None
            
        update_data = vehicle_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_vehicle, field, value)
            
        db_vehicle.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_vehicle)
        return db_vehicle

    @staticmethod
    def update_vehicle_status(
        db: Session,
        vehicle_id: str,
        status: VehicleStatus
    ) -> Optional[Vehicle]:
        """차량 상태 업데이트"""
        db_vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        
        if not db_vehicle:
            return None
            
        db_vehicle.status = status
        db_vehicle.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_vehicle)
        return db_vehicle

    @staticmethod
    def update_vehicle_mileage(
        db: Session,
        vehicle_id: str,
        mileage: int
    ) -> Optional[Vehicle]:
        """차량 주행거리 업데이트"""
        db_vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        
        if not db_vehicle:
            return None
            
        db_vehicle.mileage = mileage
        db_vehicle.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_vehicle)
        return db_vehicle

    @staticmethod
    def delete_vehicle(db: Session, vehicle_id: str) -> bool:
        """차량 삭제"""
        db_vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        
        if not db_vehicle:
            return False
            
        db.delete(db_vehicle)
        db.commit()
        return True

    @staticmethod
    def get_vehicle_statistics(db: Session) -> VehicleStatistics:
        """차량 통계 조회"""
        total_vehicles = db.query(func.count(Vehicle.id)).scalar()
        
        available_vehicles = db.query(func.count(Vehicle.id)).filter(
            Vehicle.status == VehicleStatus.AVAILABLE
        ).scalar()
        
        rented_vehicles = db.query(func.count(Vehicle.id)).filter(
            Vehicle.status == VehicleStatus.RENTED
        ).scalar()
        
        maintenance_vehicles = db.query(func.count(Vehicle.id)).filter(
            Vehicle.status == VehicleStatus.MAINTENANCE
        ).scalar()
        
        reserved_vehicles = db.query(func.count(Vehicle.id)).filter(
            Vehicle.status == VehicleStatus.RESERVED
        ).scalar()
        
        average_mileage = db.query(func.avg(Vehicle.mileage)).scalar() or 0
        total_value = db.query(func.sum(Vehicle.current_value)).scalar() or 0
        
        return VehicleStatistics(
            total_vehicles=total_vehicles,
            available_vehicles=available_vehicles,
            rented_vehicles=rented_vehicles,
            maintenance_vehicles=maintenance_vehicles,
            reserved_vehicles=reserved_vehicles,
            average_mileage=float(average_mileage),
            total_value=float(total_value)
        )

    @staticmethod
    def search_vehicles(
        db: Session,
        search_term: str,
        skip: int = 0,
        limit: int = 20
    ) -> List[Vehicle]:
        """차량 검색"""
        search_pattern = f"%{search_term}%"
        
        return db.query(Vehicle).filter(
            (Vehicle.registration_number.ilike(search_pattern)) |
            (Vehicle.make.ilike(search_pattern)) |
            (Vehicle.model.ilike(search_pattern))
        ).offset(skip).limit(limit).all()
