"""
예약 관리 API 라우트
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, date

from ..models import get_db
from ..models.enums import ReservationStatus, ReservationType
from ..schemas.reservation import (
    ReservationCreate,
    ReservationUpdate,
    ReservationResponse,
    ReservationListResponse,
    ReservationCalendarResponse,
    ReservationStatistics
)
from ..services.reservation_service import ReservationService
from ..services.customer_service import CustomerService
from ..services.vehicle_service import VehicleService

router = APIRouter(prefix="/reservations", tags=["reservations"])


@router.post("/", response_model=ReservationResponse)
def create_reservation(
    reservation: ReservationCreate,
    db: Session = Depends(get_db)
):
    """새 예약 생성"""
    try:
        # 차량 이용 가능 여부 확인
        is_available = ReservationService.check_vehicle_availability(
            db,
            reservation.vehicle_id,
            reservation.pickup_date,
            reservation.return_date
        )
        
        if not is_available:
            raise HTTPException(
                status_code=400,
                detail="해당 날짜에 차량을 예약할 수 없습니다."
            )
        
        db_reservation = ReservationService.create_reservation(db, reservation)
        
        # 응답 데이터 보강
        response = ReservationResponse.model_validate(db_reservation)
        
        customer = CustomerService.get_customer(db, reservation.customer_id)
        if customer:
            response.customer_name = customer.name
            response.customer_phone = customer.phone
        
        vehicle = VehicleService.get_vehicle(db, reservation.vehicle_id)
        if vehicle:
            response.vehicle_info = f"{vehicle.make} {vehicle.model} ({vehicle.registration_number})"
        
        return response
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=ReservationListResponse)
def get_reservations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[ReservationStatus] = None,
    customer_id: Optional[str] = None,
    vehicle_id: Optional[str] = None,
    pickup_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """예약 목록 조회"""
    skip = (page - 1) * page_size
    
    reservations = ReservationService.get_reservations(
        db, skip, page_size, status, customer_id, vehicle_id, pickup_date
    )
    
    # 고객명과 차량 정보 추가
    items = []
    for reservation in reservations:
        response = ReservationResponse.model_validate(reservation)
        
        customer = CustomerService.get_customer(db, reservation.customer_id)
        if customer:
            response.customer_name = customer.name
            response.customer_phone = customer.phone
        
        vehicle = VehicleService.get_vehicle(db, reservation.vehicle_id)
        if vehicle:
            response.vehicle_info = f"{vehicle.make} {vehicle.model} ({vehicle.registration_number})"
        
        items.append(response)
    
    total = 100  # 실제로는 count 쿼리 필요
    
    return ReservationListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/today", response_model=List[ReservationResponse])
def get_today_pickups(db: Session = Depends(get_db)):
    """오늘 픽업 예정 예약 조회"""
    reservations = ReservationService.get_today_pickups(db)
    
    items = []
    for reservation in reservations:
        response = ReservationResponse.model_validate(reservation)
        
        customer = CustomerService.get_customer(db, reservation.customer_id)
        if customer:
            response.customer_name = customer.name
            response.customer_phone = customer.phone
        
        vehicle = VehicleService.get_vehicle(db, reservation.vehicle_id)
        if vehicle:
            response.vehicle_info = f"{vehicle.make} {vehicle.model} ({vehicle.registration_number})"
        
        items.append(response)
    
    return items


@router.get("/calendar", response_model=List[ReservationCalendarResponse])
def get_reservations_calendar(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db)
):
    """캘린더용 예약 조회"""
    if start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="종료일은 시작일보다 늦어야 합니다."
        )
    
    reservations = ReservationService.get_reservations_by_date_range(
        db, start_date, end_date
    )
    
    # 날짜별로 그룹화
    calendar_data = {}
    for reservation in reservations:
        date_str = reservation.pickup_date.strftime("%Y-%m-%d")
        
        if date_str not in calendar_data:
            calendar_data[date_str] = []
        
        response = ReservationResponse.model_validate(reservation)
        
        customer = CustomerService.get_customer(db, reservation.customer_id)
        if customer:
            response.customer_name = customer.name
            response.customer_phone = customer.phone
        
        vehicle = VehicleService.get_vehicle(db, reservation.vehicle_id)
        if vehicle:
            response.vehicle_info = f"{vehicle.make} {vehicle.model} ({vehicle.registration_number})"
        
        calendar_data[date_str].append(response)
    
    # 결과 포맷팅
    result = []
    for date_str, reservations in sorted(calendar_data.items()):
        result.append(ReservationCalendarResponse(
            date=date_str,
            reservations=reservations,
            total_count=len(reservations)
        ))
    
    return result


@router.get("/statistics", response_model=ReservationStatistics)
def get_reservation_statistics(db: Session = Depends(get_db)):
    """예약 통계 조회"""
    return ReservationService.get_reservation_statistics(db)


@router.get("/{reservation_id}", response_model=ReservationResponse)
def get_reservation(
    reservation_id: str,
    db: Session = Depends(get_db)
):
    """예약 상세 조회"""
    reservation = ReservationService.get_reservation(db, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다.")
    
    response = ReservationResponse.model_validate(reservation)
    
    customer = CustomerService.get_customer(db, reservation.customer_id)
    if customer:
        response.customer_name = customer.name
        response.customer_phone = customer.phone
    
    vehicle = VehicleService.get_vehicle(db, reservation.vehicle_id)
    if vehicle:
        response.vehicle_info = f"{vehicle.make} {vehicle.model} ({vehicle.registration_number})"
    
    return response


@router.put("/{reservation_id}", response_model=ReservationResponse)
def update_reservation(
    reservation_id: str,
    reservation_update: ReservationUpdate,
    db: Session = Depends(get_db)
):
    """예약 수정"""
    reservation = ReservationService.update_reservation(
        db, reservation_id, reservation_update
    )
    if not reservation:
        raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다.")
    
    response = ReservationResponse.model_validate(reservation)
    
    customer = CustomerService.get_customer(db, reservation.customer_id)
    if customer:
        response.customer_name = customer.name
        response.customer_phone = customer.phone
    
    vehicle = VehicleService.get_vehicle(db, reservation.vehicle_id)
    if vehicle:
        response.vehicle_info = f"{vehicle.make} {vehicle.model} ({vehicle.registration_number})"
    
    return response


@router.post("/{reservation_id}/confirm", response_model=ReservationResponse)
def confirm_reservation(
    reservation_id: str,
    db: Session = Depends(get_db)
):
    """예약 확정"""
    try:
        reservation = ReservationService.confirm_reservation(db, reservation_id)
        if not reservation:
            raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다.")
        
        response = ReservationResponse.model_validate(reservation)
        
        customer = CustomerService.get_customer(db, reservation.customer_id)
        if customer:
            response.customer_name = customer.name
            response.customer_phone = customer.phone
        
        vehicle = VehicleService.get_vehicle(db, reservation.vehicle_id)
        if vehicle:
            response.vehicle_info = f"{vehicle.make} {vehicle.model} ({vehicle.registration_number})"
        
        return response
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{reservation_id}/cancel", response_model=ReservationResponse)
def cancel_reservation(
    reservation_id: str,
    db: Session = Depends(get_db)
):
    """예약 취소"""
    try:
        reservation = ReservationService.cancel_reservation(db, reservation_id)
        if not reservation:
            raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다.")
        
        response = ReservationResponse.model_validate(reservation)
        
        customer = CustomerService.get_customer(db, reservation.customer_id)
        if customer:
            response.customer_name = customer.name
            response.customer_phone = customer.phone
        
        vehicle = VehicleService.get_vehicle(db, reservation.vehicle_id)
        if vehicle:
            response.vehicle_info = f"{vehicle.make} {vehicle.model} ({vehicle.registration_number})"
        
        return response
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{reservation_id}/complete", response_model=ReservationResponse)
def complete_reservation(
    reservation_id: str,
    db: Session = Depends(get_db)
):
    """예약 완료 처리"""
    try:
        reservation = ReservationService.complete_reservation(db, reservation_id)
        if not reservation:
            raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다.")
        
        response = ReservationResponse.model_validate(reservation)
        
        customer = CustomerService.get_customer(db, reservation.customer_id)
        if customer:
            response.customer_name = customer.name
            response.customer_phone = customer.phone
        
        vehicle = VehicleService.get_vehicle(db, reservation.vehicle_id)
        if vehicle:
            response.vehicle_info = f"{vehicle.make} {vehicle.model} ({vehicle.registration_number})"
        
        return response
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/check-availability/{vehicle_id}")
def check_vehicle_availability(
    vehicle_id: str,
    pickup_date: datetime,
    return_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """차량 이용 가능 여부 확인"""
    is_available = ReservationService.check_vehicle_availability(
        db, vehicle_id, pickup_date, return_date
    )
    
    return {
        "vehicle_id": vehicle_id,
        "pickup_date": pickup_date,
        "return_date": return_date,
        "is_available": is_available
    }
