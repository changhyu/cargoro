"""
차량 관리 API 라우트
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..models import get_db
from ..auth.utils import get_current_active_user
from ..models.user import User
from ..models.enums import VehicleStatus, VehicleCategory
from ..schemas.vehicle import (
    VehicleCreate,
    VehicleUpdate,
    VehicleResponse,
    VehicleListResponse,
    VehicleStatusUpdate,
    VehicleMileageUpdate,
    VehicleStatistics
)
from ..services.vehicle_service import VehicleService

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


@router.post("/", response_model=VehicleResponse)
def create_vehicle(
    vehicle: VehicleCreate,
    db: Session = Depends(get_db)
):
    """새 차량 등록"""
    # 중복 차량 번호 확인
    existing_vehicle = VehicleService.get_vehicle_by_registration(
        db, vehicle.registration_number
    )
    if existing_vehicle:
        raise HTTPException(
            status_code=400,
            detail="이미 등록된 차량 번호입니다."
        )
    
    db_vehicle = VehicleService.create_vehicle(db, vehicle)
    return VehicleResponse.model_validate(db_vehicle)


@router.get("/", response_model=VehicleListResponse)
def get_vehicles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[VehicleStatus] = None,
    category: Optional[VehicleCategory] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """차량 목록 조회"""
    skip = (page - 1) * page_size
    
    if search:
        vehicles = VehicleService.search_vehicles(db, search, skip, page_size)
        total = len(vehicles)  # 실제로는 count 쿼리 필요
    else:
        vehicles = VehicleService.get_vehicles(db, skip, page_size, status, category)
        total = 100  # 실제로는 count 쿼리 필요
    
    items = [VehicleResponse.model_validate(v) for v in vehicles]
    
    return VehicleListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/available", response_model=List[VehicleResponse])
def get_available_vehicles(db: Session = Depends(get_db)):
    """이용 가능한 차량 조회"""
    vehicles = VehicleService.get_available_vehicles(db)
    return [VehicleResponse.model_validate(v) for v in vehicles]


@router.get("/statistics", response_model=VehicleStatistics)
def get_vehicle_statistics(db: Session = Depends(get_db)):
    """차량 통계 조회"""
    return VehicleService.get_vehicle_statistics(db)


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    """차량 상세 조회"""
    vehicle = VehicleService.get_vehicle(db, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="차량을 찾을 수 없습니다.")
    return VehicleResponse.model_validate(vehicle)


@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: str,
    vehicle_update: VehicleUpdate,
    db: Session = Depends(get_db)
):
    """차량 정보 수정"""
    vehicle = VehicleService.update_vehicle(db, vehicle_id, vehicle_update)
    if not vehicle:
        raise HTTPException(status_code=404, detail="차량을 찾을 수 없습니다.")
    return VehicleResponse.model_validate(vehicle)


@router.patch("/{vehicle_id}/status", response_model=VehicleResponse)
def update_vehicle_status(
    vehicle_id: str,
    status_update: VehicleStatusUpdate,
    db: Session = Depends(get_db)
):
    """차량 상태 업데이트"""
    vehicle = VehicleService.update_vehicle_status(
        db, vehicle_id, status_update.status
    )
    if not vehicle:
        raise HTTPException(status_code=404, detail="차량을 찾을 수 없습니다.")
    return VehicleResponse.model_validate(vehicle)


@router.patch("/{vehicle_id}/mileage", response_model=VehicleResponse)
def update_vehicle_mileage(
    vehicle_id: str,
    mileage_update: VehicleMileageUpdate,
    db: Session = Depends(get_db)
):
    """차량 주행거리 업데이트"""
    vehicle = VehicleService.update_vehicle_mileage(
        db, vehicle_id, mileage_update.mileage
    )
    if not vehicle:
        raise HTTPException(status_code=404, detail="차량을 찾을 수 없습니다.")
    return VehicleResponse.model_validate(vehicle)


@router.delete("/{vehicle_id}")
def delete_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    """차량 삭제"""
    success = VehicleService.delete_vehicle(db, vehicle_id)
    if not success:
        raise HTTPException(status_code=404, detail="차량을 찾을 수 없습니다.")
    return {"message": "차량이 성공적으로 삭제되었습니다."}
