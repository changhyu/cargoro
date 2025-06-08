from fastapi import APIRouter, Depends, Path, Query, HTTPException
from typing import List, Optional, Dict, Any
from prisma import Prisma
from datetime import datetime
from ..models.location import (
    VehicleLocationCreate,
    VehicleLocationUpdate,
    VehicleLocationResponse,
    LocationStatus,
)
from ..utils.response_utils import (
    ApiResponse,
    create_response,
    not_found_exception,
    validation_exception,
    server_error_exception,
)
import logging

router = APIRouter(
    prefix="/locations",
    tags=["locations"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger("fleet-api:locations")


# 의존성 주입을 위한 함수 정의
def get_prisma():
    """Prisma 클라이언트 의존성 주입

    server.py에서 정의된 prisma 인스턴스를 반환합니다.
    테스트에서는 이 함수를 모킹하여 의존성을 주입합니다.
    """
    # 동적 임포트를 통해 순환 참조 문제 방지
    from lib.server import prisma

    return prisma


# 차량 위치 정보 생성
@router.post("/", response_model=ApiResponse, status_code=201)
async def create_vehicle_location(
    location: VehicleLocationCreate, prisma=Depends(get_prisma)
):
    try:
        # 차량 존재 확인
        vehicle = await prisma.vehicle.find_unique(where={"id": location.vehicle_id})

        if not vehicle:
            raise not_found_exception("차량", location.vehicle_id)

        # 새 위치 정보 생성
        new_location = await prisma.vehicle_location.create(
            data={
                "vehicle_id": location.vehicle_id,
                "latitude": location.latitude,
                "longitude": location.longitude,
                "altitude": location.altitude,
                "heading": location.heading,
                "speed": location.speed,
                "accuracy": location.accuracy,
                "status": location.status,
            }
        )

        # 응답에 차량 번호판 추가
        location_response = VehicleLocationResponse.model_validate_obj(new_location)
        location_response.license_plate = vehicle.license_plate

        return create_response(data=location_response)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"차량 위치 정보 생성 실패: {str(e)}")
        raise server_error_exception(
            f"차량 위치 정보 생성 중 오류가 발생했습니다: {str(e)}"
        )


# 최신 차량 위치 정보 목록 조회
@router.get("/", response_model=ApiResponse)
async def get_vehicle_locations(
    vehicle_id: Optional[str] = None,
    status: Optional[LocationStatus] = None,
    organization_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    prisma=Depends(get_prisma),
):
    try:
        # 필터 조건 구성
        where = {}

        if vehicle_id:
            where["vehicle_id"] = vehicle_id

        if status:
            where["status"] = status

        # 조직 필터링 (vehicle 테이블 조인)
        vehicle_where = {}
        if organization_id:
            vehicle_where["organization_id"] = organization_id

        # 먼저 차량 ID 목록 가져오기 (조직 필터링 적용)
        if organization_id:
            vehicles = await prisma.vehicle.find_many(
                where=vehicle_where, select={"id": True}
            )
            vehicle_ids = [v["id"] for v in vehicles]

            if not vehicle_ids:
                return create_response(
                    data=[],
                    page=1,
                    per_page=limit,
                    total_items=0,
                    total_pages=0,
                )

            where["vehicle_id"] = {"in": vehicle_ids}

        # 각 차량별 최신 위치 정보 쿼리를 위한 서브쿼리 구성
        # Prisma는 복잡한 서브쿼리를 직접 지원하지 않으므로 두 단계로 처리

        # 1. 먼저 모든 차량 위치 정보 가져오기
        all_locations = await prisma.vehicle_location.find_many(
            where=where,
            order=[{"created_at": "desc"}],
            include={"vehicle": True},
        )

        # 2. 메모리에서 각 차량의 최신 위치만 필터링
        latest_locations = {}
        for loc in all_locations:
            if loc.vehicle_id not in latest_locations:
                latest_locations[loc.vehicle_id] = loc

        # 결과 목록으로 변환
        locations = list(latest_locations.values())

        # 페이지네이션 적용
        total_items = len(locations)
        paginated_locations = locations[skip : skip + limit]

        # 응답 변환
        location_responses = []
        for loc in paginated_locations:
            response = VehicleLocationResponse.model_validate_obj(loc)
            response.license_plate = loc.vehicle.license_plate if loc.vehicle else None
            location_responses.append(response)

        return create_response(
            data=location_responses,
            page=skip // limit + 1,
            per_page=limit,
            total_items=total_items,
            total_pages=(total_items + limit - 1) // limit if limit > 0 else 0,
        )
    except Exception as e:
        logger.error(f"차량 위치 정보 조회 실패: {str(e)}")
        raise server_error_exception(
            f"차량 위치 정보 조회 중 오류가 발생했습니다: {str(e)}"
        )


# 특정 차량 위치 조회
@router.get("/vehicle/{vehicle_id}", response_model=ApiResponse)
async def get_vehicle_location(
    vehicle_id: str = Path(..., description="조회할 차량의 ID"),
    prisma=Depends(get_prisma),
):
    try:
        # 차량 존재 확인
        vehicle = await prisma.vehicle.find_unique(where={"id": vehicle_id})

        if not vehicle:
            raise not_found_exception("차량", vehicle_id)

        # 최신 위치 정보 조회
        location = await prisma.vehicle_location.find_first(
            where={"vehicle_id": vehicle_id},
            order=[{"created_at": "desc"}],
        )

        if not location:
            raise not_found_exception("위치 정보", vehicle_id)

        # 응답 변환
        location_response = VehicleLocationResponse.model_validate_obj(location)
        location_response.license_plate = vehicle.license_plate

        return create_response(data=location_response)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"차량 위치 정보 조회 실패: {str(e)}")
        raise server_error_exception(
            f"차량 위치 정보 조회 중 오류가 발생했습니다: {str(e)}"
        )


# 특정 위치 정보 조회
@router.get("/{location_id}", response_model=ApiResponse)
async def get_location(
    location_id: str = Path(..., description="조회할 위치 정보의 ID"),
    prisma=Depends(get_prisma),
):
    try:
        # 위치 정보 조회
        location = await prisma.vehicle_location.find_unique(
            where={"id": location_id},
            include={"vehicle": True},
        )

        if not location:
            raise not_found_exception("위치 정보", location_id)

        # 응답 변환
        location_response = VehicleLocationResponse.model_validate_obj(location)
        location_response.license_plate = (
            location.vehicle.license_plate if location.vehicle else None
        )

        return create_response(data=location_response)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"위치 정보 조회 실패: {str(e)}")
        raise server_error_exception(f"위치 정보 조회 중 오류가 발생했습니다: {str(e)}")


# 차량 위치 정보 업데이트
@router.patch("/{location_id}", response_model=ApiResponse)
async def update_vehicle_location(
    location_update: VehicleLocationUpdate,
    location_id: str = Path(..., description="업데이트할 위치 정보의 ID"),
    prisma=Depends(get_prisma),
):
    try:
        # 위치 정보 존재 확인
        existing_location = await prisma.vehicle_location.find_unique(
            where={"id": location_id},
            include={"vehicle": True},
        )

        if not existing_location:
            raise not_found_exception("위치 정보", location_id)

        # 업데이트 데이터 구성
        update_data = location_update.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.now()

        # 위치 정보 업데이트
        updated_location = await prisma.vehicle_location.update(
            where={"id": location_id},
            data=update_data,
        )

        # 응답 변환
        location_response = VehicleLocationResponse.model_validate_obj(updated_location)
        location_response.license_plate = (
            existing_location.vehicle.license_plate
            if existing_location.vehicle
            else None
        )

        return create_response(data=location_response)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"위치 정보 업데이트 실패: {str(e)}")
        raise server_error_exception(
            f"위치 정보 업데이트 중 오류가 발생했습니다: {str(e)}"
        )


# 위치 정보 삭제
@router.delete("/{location_id}", response_model=ApiResponse)
async def delete_vehicle_location(
    location_id: str = Path(..., description="삭제할 위치 정보의 ID"),
    prisma=Depends(get_prisma),
):
    try:
        # 위치 정보 존재 확인
        existing_location = await prisma.vehicle_location.find_unique(
            where={"id": location_id},
            include={"vehicle": True},
        )

        if not existing_location:
            raise not_found_exception("위치 정보", location_id)

        # 위치 정보 삭제
        deleted_location = await prisma.vehicle_location.delete(
            where={"id": location_id},
        )

        # 응답 변환
        location_response = VehicleLocationResponse.model_validate_obj(deleted_location)
        location_response.license_plate = (
            existing_location.vehicle.license_plate
            if existing_location.vehicle
            else None
        )

        return create_response(
            data=location_response, message="위치 정보가 성공적으로 삭제되었습니다."
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"위치 정보 삭제 실패: {str(e)}")
        raise server_error_exception(f"위치 정보 삭제 중 오류가 발생했습니다: {str(e)}")


# 차량의 위치 히스토리 조회
@router.get("/history/{vehicle_id}", response_model=ApiResponse)
async def get_vehicle_location_history(
    vehicle_id: str = Path(..., description="조회할 차량의 ID"),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    prisma=Depends(get_prisma),
):
    try:
        # 차량 존재 확인
        vehicle = await prisma.vehicle.find_unique(where={"id": vehicle_id})

        if not vehicle:
            raise not_found_exception("차량", vehicle_id)

        # 필터 조건 구성
        where: Dict[str, Any] = {"vehicle_id": vehicle_id}

        if start_date and end_date:
            where["created_at"] = {"gte": start_date, "lte": end_date}
        elif start_date:
            where["created_at"] = {"gte": start_date}
        elif end_date:
            where["created_at"] = {"lte": end_date}

        # 총 개수 조회
        total_items = await prisma.vehicle_location.count(where=where)

        # 위치 히스토리 조회
        locations = await prisma.vehicle_location.find_many(
            where=where,
            order=[{"created_at": "desc"}],
            skip=skip,
            take=limit,
        )

        # 응답 변환
        location_responses = []
        for loc in locations:
            response = VehicleLocationResponse.model_validate_obj(loc)
            response.license_plate = vehicle.license_plate
            location_responses.append(response)

        return create_response(
            data=location_responses,
            page=skip // limit + 1,
            per_page=limit,
            total_items=total_items,
            total_pages=(total_items + limit - 1) // limit if limit > 0 else 0,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"차량 위치 히스토리 조회 실패: {str(e)}")
        raise server_error_exception(
            f"차량 위치 히스토리 조회 중 오류가 발생했습니다: {str(e)}"
        )


# 지역별 차량 위치 조회
@router.get("/area", response_model=ApiResponse)
async def get_vehicles_in_area(
    latitude: float = Query(..., description="위도"),
    longitude: float = Query(..., description="경도"),
    radius: float = Query(..., description="반경 (킬로미터)"),
    vehicle_types: Optional[List[str]] = Query(None, alias="vehicleTypes", description="차량 유형 필터"),
    statuses: Optional[List[str]] = Query(None, description="차량 상태 필터"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    prisma=Depends(get_prisma),
):
    try:
        # 지오코딩 및 거리 계산 로직 필요

        # 지역 내 위치한 차량 조회
        # 실제 구현에서는 지리적 거리 계산 쿼리가 필요함
        # 현재는 간단한 예시로 대체

        # 차량 타입 필터링
        vehicle_where = {}
        if vehicle_types:
            vehicle_where["type"] = {"in": vehicle_types}

        # 차량 상태 필터링
        if statuses:
            vehicle_where["status"] = {"in": statuses}

        # 차량 정보 가져오기
        vehicles = await prisma.vehicle.find_many(
            where=vehicle_where,
            include={"latest_location": True},
            skip=skip,
            take=limit,
        )

        # 위치 정보와 함께 차량 목록 반환
        vehicle_locations = []
        for vehicle in vehicles:
            # 실제로는 여기서 거리 계산을 통해 반경 내에 있는지 확인해야 함
            # 현재는 모든 차량을 포함하는 간단한 예시
            location_data = {
                "id": vehicle.id,
                "registrationNumber": vehicle.license_plate,
                "type": vehicle.type,
                "status": vehicle.status,
                "location": {
                    "latitude": vehicle.latest_location.latitude if vehicle.latest_location else latitude,
                    "longitude": vehicle.latest_location.longitude if vehicle.latest_location else longitude,
                    "timestamp": vehicle.latest_location.created_at.isoformat() if vehicle.latest_location else datetime.now().isoformat(),
                    "address": vehicle.latest_location.address if vehicle.latest_location and vehicle.latest_location.address else "Unknown"
                }
            }
            vehicle_locations.append(location_data)

        # 결과 반환
        return create_response(
            data={
                "items": vehicle_locations,
                "total": len(vehicle_locations),
                "center": {
                    "latitude": latitude,
                    "longitude": longitude
                },
                "radius": radius
            }
        )
    except Exception as e:
        logger.error(f"지역별 차량 위치 조회 실패: {str(e)}")
        raise server_error_exception(
            f"지역별 차량 위치 조회 중 오류가 발생했습니다: {str(e)}"
        )
