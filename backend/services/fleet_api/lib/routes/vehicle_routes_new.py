from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from typing import List, Optional, Dict, Any
from prisma import Prisma
from datetime import date, datetime
import logging

from ..models.vehicle import (
    VehicleCreate,
    VehicleUpdate,
    VehicleResponse,
    VehicleListResponse,
    VehicleStatus,
    VehicleType,
)
from ..models.contract import ContractResponse, ContractType
from ..models.assignment import VehicleAssignmentResponse
from ..models.driver_performance import DrivingRecordResponse
from ..utils.response_utils import (
    ApiResponse,
    ApiException,
    create_response,
    not_found_exception,
    validation_exception,
    server_error_exception,
    conflict_exception,
    bad_request_exception,
)
from ..utils.model_conversion import (
    model_to_db_dict,
    db_dict_to_model,
    convert_dict_keys_to_camel,
    convert_dict_keys_to_snake,
)

router = APIRouter(
    prefix="/vehicles",
    tags=["vehicles"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger("fleet-api:vehicles")

# 리소스 타입 상수
RESOURCE_TYPE = "차량"


# 차량 생성
@router.post("/", response_model=ApiResponse[VehicleResponse])
async def create_vehicle(vehicle: VehicleCreate, prisma: Prisma = Depends()):
    """
    새로운 차량을 등록합니다.
    """
    try:
        # 조직 확인
        organization = await prisma.organization.find_unique(
            where={"id": vehicle.organization_id}
        )

        if not organization:
            raise not_found_exception("조직", vehicle.organization_id)

        # 번호판 중복 확인
        existing_vehicle = await prisma.vehicle.find_first(
            where={"licensePlate": vehicle.license_plate}
        )

        if existing_vehicle:
            raise conflict_exception(RESOURCE_TYPE, "license_plate")

        # 차대번호 중복 확인
        existing_vin = await prisma.vehicle.find_first(
            where={"vin": vehicle.vin}
        )

        if existing_vin:
            raise conflict_exception(RESOURCE_TYPE, "vin")

        # 모델 데이터를 DB용 camelCase로 변환
        vehicle_db_data = model_to_db_dict(vehicle)

        # 데이터베이스에 저장
        created_vehicle = await prisma.vehicle.create(data=vehicle_db_data)

        return create_response(
            data=created_vehicle,
            message="차량이 성공적으로 등록되었습니다."
        )

    except ApiException:
        # ApiException은 이미 처리되어 있으므로 그대로 전달
        raise
    except Exception as e:
        logger.error(f"차량 등록 오류: {str(e)}")
        raise server_error_exception(f"차량 등록 중 오류가 발생했습니다.")


# 차량 목록 조회
@router.get("/", response_model=ApiResponse[VehicleListResponse])
async def get_vehicles(
    make: Optional[str] = None,
    model: Optional[str] = None,
    year: Optional[int] = None,
    vehicle_type: Optional[str] = None,
    license_plate: Optional[str] = None,
    status: Optional[str] = None,
    organization_id: Optional[str] = None,
    is_active: Optional[bool] = None,
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(10, ge=1, le=100, description="페이지 크기"),
    prisma: Prisma = Depends(),
):
    """
    필터링 옵션을 사용하여 차량 목록을 조회합니다.
    """
    try:
        # 필터 조건 구성 (camelCase로 변환)
        where_conditions = {}

        if make:
            where_conditions["make"] = {"contains": make}
        if model:
            where_conditions["model"] = {"contains": model}
        if year:
            where_conditions["year"] = year
        if vehicle_type:
            where_conditions["vehicleType"] = vehicle_type
        if license_plate:
            where_conditions["licensePlate"] = {"contains": license_plate}
        if status:
            where_conditions["status"] = status
        if organization_id:
            where_conditions["organizationId"] = organization_id
        if is_active is not None:
            where_conditions["isActive"] = is_active

        # 전체 레코드 수 조회
        total_records = await prisma.vehicle.count(where=where_conditions)

        # 페이지네이션 계산
        skip = (page - 1) * page_size
        total_pages = (total_records + page_size - 1) // page_size

        # 차량 목록 조회
        vehicles = await prisma.vehicle.find_many(
            where=where_conditions,
            skip=skip,
            take=page_size,
            order={"createdAt": "desc"},
        )

        # 응답 구성
        response_data = {
            "items": vehicles,
            "total": total_records,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }

        return create_response(
            data=response_data,
            message="차량 목록이 성공적으로 조회되었습니다.",
            page=page,
            per_page=page_size,
            total_items=total_records,
            total_pages=total_pages
        )

    except Exception as e:
        logger.error(f"차량 목록 조회 오류: {str(e)}")
        raise server_error_exception("차량 목록 조회 중 오류가 발생했습니다.")


# 차량 상세 정보 조회
@router.get("/{vehicle_id}", response_model=ApiResponse[VehicleResponse])
async def get_vehicle_by_id(
    vehicle_id: str = Path(..., description="조회할 차량 ID"),
    prisma: Prisma = Depends(),
):
    """
    ID로 특정 차량의 상세 정보를 조회합니다.
    """
    try:
        # 차량 조회
        vehicle = await prisma.vehicle.find_unique(where={"id": vehicle_id})

        if not vehicle:
            raise not_found_exception(RESOURCE_TYPE, vehicle_id)

        return create_response(
            data=vehicle,
            message="차량 정보가 성공적으로 조회되었습니다."
        )

    except ApiException:
        raise
    except Exception as e:
        logger.error(f"차량 조회 오류: {str(e)}")
        raise server_error_exception("차량 조회 중 오류가 발생했습니다.")


# 차량 정보 업데이트
@router.put("/{vehicle_id}", response_model=ApiResponse[VehicleResponse])
async def update_vehicle(
    vehicle_id: str = Path(..., description="수정할 차량 ID"),
    vehicle_data: VehicleUpdate = None,
    prisma: Prisma = Depends(),
):
    """
    특정 차량의 정보를 업데이트합니다.
    """
    try:
        # 차량 존재 여부 확인
        existing_vehicle = await prisma.vehicle.find_unique(where={"id": vehicle_id})

        if not existing_vehicle:
            raise not_found_exception(RESOURCE_TYPE, vehicle_id)

        # 번호판 중복 확인
        if vehicle_data.license_plate and vehicle_data.license_plate != existing_vehicle.licensePlate:
            duplicate_plate = await prisma.vehicle.find_first(
                where={
                    "licensePlate": vehicle_data.license_plate,
                    "id": {"not": vehicle_id}
                }
            )
            if duplicate_plate:
                raise conflict_exception(RESOURCE_TYPE, "license_plate")

        # 차대번호 중복 확인
        if vehicle_data.vin and vehicle_data.vin != existing_vehicle.vin:
            duplicate_vin = await prisma.vehicle.find_first(
                where={
                    "vin": vehicle_data.vin,
                    "id": {"not": vehicle_id}
                }
            )
            if duplicate_vin:
                raise conflict_exception(RESOURCE_TYPE, "vin")

        # 모델 데이터를 DB용 camelCase로 변환 (None 값은 제외)
        update_data = model_to_db_dict(vehicle_data, exclude=["id"])

        # 데이터 업데이트
        updated_vehicle = await prisma.vehicle.update(
            where={"id": vehicle_id},
            data=update_data
        )

        return create_response(
            data=updated_vehicle,
            message="차량 정보가 성공적으로 업데이트되었습니다."
        )

    except ApiException:
        raise
    except Exception as e:
        logger.error(f"차량 업데이트 오류: {str(e)}")
        raise server_error_exception("차량 업데이트 중 오류가 발생했습니다.")


# 차량 삭제
@router.delete("/{vehicle_id}", response_model=ApiResponse)
async def delete_vehicle(
    vehicle_id: str = Path(..., description="삭제할 차량 ID"),
    prisma: Prisma = Depends(),
):
    """
    특정 차량을 삭제합니다.
    """
    try:
        # 차량 존재 여부 확인
        existing_vehicle = await prisma.vehicle.find_unique(where={"id": vehicle_id})

        if not existing_vehicle:
            raise not_found_exception(RESOURCE_TYPE, vehicle_id)

        # 삭제 전 관련 레코드 확인 (예: 배정, 계약 등)
        assignments = await prisma.vehicle_assignment.find_many(
            where={"vehicle_id": vehicle_id}
        )

        if assignments:
            raise bad_request_exception(
                "배정된 운전자가 있는 차량은 삭제할 수 없습니다. 먼저 배정을 해제해주세요."
            )

        # 차량 삭제
        await prisma.vehicle.delete(where={"id": vehicle_id})

        return create_response(
            data={"id": vehicle_id},
            message="차량이 성공적으로 삭제되었습니다."
        )

    except ApiException:
        raise
    except Exception as e:
        logger.error(f"차량 삭제 오류: {str(e)}")
        raise server_error_exception("차량 삭제 중 오류가 발생했습니다.")


# 차량 상태 변경
@router.patch("/{vehicle_id}/status", response_model=ApiResponse[VehicleResponse])
async def update_vehicle_status(
    vehicle_id: str = Path(..., description="상태를 변경할 차량 ID"),
    status: str = Query(..., description="변경할 상태"),
    prisma: Prisma = Depends(),
):
    """
    차량의 상태를 변경합니다. (available, in_use, maintenance, out_of_service)
    """
    try:
        # 차량 존재 여부 확인
        existing_vehicle = await prisma.vehicle.find_unique(where={"id": vehicle_id})

        if not existing_vehicle:
            raise not_found_exception(RESOURCE_TYPE, vehicle_id)

        # 유효한 상태값인지 확인
        valid_statuses = [status.value for status in VehicleStatus]
        if status not in valid_statuses:
            raise validation_exception({"status": f"유효하지 않은 상태입니다. 가능한 값: {', '.join(valid_statuses)}"})

        # 상태 업데이트
        updated_vehicle = await prisma.vehicle.update(
            where={"id": vehicle_id},
            data={"status": status}
        )

        return create_response(
            data=updated_vehicle,
            message=f"차량 상태가 '{status}'로 변경되었습니다."
        )

    except ApiException:
        raise
    except Exception as e:
        logger.error(f"차량 상태 변경 오류: {str(e)}")
        raise server_error_exception("차량 상태 변경 중 오류가 발생했습니다.")


# 차량별 운전자 배정 목록 조회
@router.get("/{vehicle_id}/assignments", response_model=ApiResponse[List[VehicleAssignmentResponse]])
async def get_assignments_by_vehicle(
    vehicle_id: str = Path(..., description="조회할 차량 ID"),
    prisma: Prisma = Depends(),
):
    """
    특정 차량에 배정된 운전자 목록을 조회합니다.
    """
    try:
        # 차량 존재 여부 확인
        vehicle = await prisma.vehicle.find_unique(where={"id": vehicle_id})

        if not vehicle:
            raise not_found_exception(RESOURCE_TYPE, vehicle_id)

        # 배정 목록 조회
        assignments = await prisma.vehicle_assignment.find_many(
            where={"vehicle_id": vehicle_id},
            include={"driver": True}
        )

        return create_response(
            data=assignments,
            message="차량 배정 목록이 성공적으로 조회되었습니다."
        )

    except ApiException:
        raise
    except Exception as e:
        logger.error(f"차량 배정 목록 조회 오류: {str(e)}")
        raise server_error_exception("차량 배정 목록 조회 중 오류가 발생했습니다.")
