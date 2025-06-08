from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import math
import logging
from prisma.errors import PrismaError

from ..models.driver_performance import (
    DrivingRecordCreate,
    DrivingRecordUpdate,
    DrivingRecordResponse,
    DrivingRecordFilters,
    DrivingRecordListResponse,
)
from ..utils.auth import get_current_user
from ..utils.response_utils import (
    ApiResponse,
    ApiException,
    create_response,
    not_found_exception,
    validation_exception,
    server_error_exception,
    conflict_exception,
    unauthorized_exception,
)

# Prisma 클라이언트 초기화
from prisma import Prisma

db = Prisma()

router = APIRouter(tags=["driving-records"])
logger = logging.getLogger(__name__)


@router.post(
    "/driving-records",
    response_model=ApiResponse[DrivingRecordResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_driving_record(
    record_data: DrivingRecordCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    새로운 운행 기록을 생성합니다.
    """
    try:
        # 인증된 사용자만 운행 기록 생성 가능
        if not current_user:
            raise unauthorized_exception("인증되지 않은 사용자입니다.")

        # 운전자 존재 여부 확인
        driver = await db.driver.find_unique(where={"id": record_data.driver_id})

        if not driver:
            raise not_found_exception("운전자", record_data.driver_id)

        # 차량 존재 여부 확인
        vehicle = await db.vehicle.find_unique(where={"id": record_data.vehicle_id})

        if not vehicle:
            raise not_found_exception("차량", record_data.vehicle_id)

        # 운행 기록 생성
        record_data_dict = record_data.model_dump()

        # camelCase로 변환 (Prisma DB 필드명과 일치)
        record_data_dict["driverId"] = record_data_dict.pop("driver_id")
        record_data_dict["vehicleId"] = record_data_dict.pop("vehicle_id")
        record_data_dict["startTime"] = record_data_dict.pop("start_time")
        record_data_dict["endTime"] = record_data_dict.pop("end_time")

        if "start_location" in record_data_dict:
            record_data_dict["startLocation"] = record_data_dict.pop("start_location")
        if "end_location" in record_data_dict:
            record_data_dict["endLocation"] = record_data_dict.pop("end_location")
        if "avg_speed" in record_data_dict:
            record_data_dict["avgSpeed"] = record_data_dict.pop("avg_speed")
        if "max_speed" in record_data_dict:
            record_data_dict["maxSpeed"] = record_data_dict.pop("max_speed")
        if "fuel_consumption" in record_data_dict:
            record_data_dict["fuelConsumption"] = record_data_dict.pop("fuel_consumption")
        if "hard_brake_count" in record_data_dict:
            record_data_dict["hardBrakeCount"] = record_data_dict.pop("hard_brake_count")
        if "hard_accel_count" in record_data_dict:
            record_data_dict["hardAccelCount"] = record_data_dict.pop("hard_accel_count")
        if "idling_duration" in record_data_dict:
            record_data_dict["idlingDuration"] = record_data_dict.pop("idling_duration")
        if "route_data" in record_data_dict:
            record_data_dict["routeData"] = record_data_dict.pop("route_data")

        new_record = await db.drivingrecord.create(data=record_data_dict)

        # 차량 상태 및 주행거리 업데이트
        await db.vehicle.update(
            where={"id": record_data.vehicle_id},
            data={"mileage": vehicle.mileage + int(record_data.distance)},
        )

        # camelCase DB 데이터를 snake_case로 변환
        response_data = DrivingRecordResponse.model_validate(new_record)

        return create_response(
            data=response_data,
            message="운행 기록이 성공적으로 생성되었습니다."
        )

    except PrismaError as e:
        logger.error(f"Prisma 오류: {str(e)}")
        raise server_error_exception("운행 기록 생성 중 데이터베이스 오류가 발생했습니다.")
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"예상치 못한 오류: {str(e)}")
        raise server_error_exception(f"운행 기록 생성 중 오류가 발생했습니다: {str(e)}")


@router.get("/driving-records", response_model=ApiResponse[List[DrivingRecordResponse]])
async def get_driving_records(
    driver_id: Optional[str] = None,
    vehicle_id: Optional[str] = None,
    start_time_from: Optional[datetime] = None,
    start_time_to: Optional[datetime] = None,
    min_distance: Optional[float] = Query(None, ge=0),
    max_distance: Optional[float] = Query(None, ge=0),
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(10, ge=1, le=100, description="페이지 크기"),
    current_user: dict = Depends(get_current_user),
):
    """
    필터링 옵션을 사용하여 운행 기록 목록을 조회합니다.
    """
    try:
        # 인증된 사용자만 운행 기록 목록 조회 가능
        if not current_user:
            raise unauthorized_exception("인증되지 않은 사용자입니다.")

        # 필터 조건 구성
        where_conditions = {}

        if driver_id:
            where_conditions["driverId"] = driver_id

        if vehicle_id:
            where_conditions["vehicleId"] = vehicle_id

        # 날짜 필터
        if start_time_from or start_time_to:
            where_conditions["startTime"] = {}

            if start_time_from:
                where_conditions["startTime"]["gte"] = start_time_from

            if start_time_to:
                where_conditions["startTime"]["lte"] = start_time_to

        # 거리 필터
        if min_distance is not None or max_distance is not None:
            where_conditions["distance"] = {}

            if min_distance is not None:
                where_conditions["distance"]["gte"] = min_distance

            if max_distance is not None:
                where_conditions["distance"]["lte"] = max_distance

        # 전체 레코드 수 조회
        total_records = await db.drivingrecord.count(where=where_conditions)

        # 페이지네이션 계산
        skip = (page - 1) * page_size
        total_pages = math.ceil(total_records / page_size)

        # 운행 기록 목록 조회
        records = await db.drivingrecord.find_many(
            where=where_conditions,
            skip=skip,
            take=page_size,
            order={"startTime": "desc"},
        )

        # 응답 데이터 변환
        response_items = [DrivingRecordResponse.model_validate(record) for record in records]

        return create_response(
            data=response_items,
            message="운행 기록 목록이 성공적으로 조회되었습니다.",
            page=page,
            per_page=page_size,
            total_items=total_records,
            total_pages=total_pages
        )

    except PrismaError as e:
        logger.error(f"Prisma 오류: {str(e)}")
        raise server_error_exception("운행 기록 목록 조회 중 데이터베이스 오류가 발생했습니다.")
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"예상치 못한 오류: {str(e)}")
        raise server_error_exception(f"운행 기록 목록 조회 중 오류가 발생했습니다: {str(e)}")


@router.get("/driving-records/{record_id}", response_model=ApiResponse[DrivingRecordResponse])
async def get_driving_record_by_id(
    record_id: str = Path(..., description="조회할 운행 기록 ID"),
    current_user: dict = Depends(get_current_user),
):
    """
    ID로 특정 운행 기록을 조회합니다.
    """
    try:
        # 인증된 사용자만 운행 기록 조회 가능
        if not current_user:
            raise unauthorized_exception("인증되지 않은 사용자입니다.")

        # 운행 기록 조회
        record = await db.drivingrecord.find_unique(where={"id": record_id})

        if not record:
            raise not_found_exception("운행 기록", record_id)

        response_data = DrivingRecordResponse.model_validate(record)

        return create_response(
            data=response_data,
            message="운행 기록이 성공적으로 조회되었습니다."
        )

    except PrismaError as e:
        logger.error(f"Prisma 오류: {str(e)}")
        raise server_error_exception("운행 기록 조회 중 데이터베이스 오류가 발생했습니다.")
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"예상치 못한 오류: {str(e)}")
        raise server_error_exception(f"운행 기록 조회 중 오류가 발생했습니다: {str(e)}")


@router.put("/driving-records/{record_id}", response_model=ApiResponse[DrivingRecordResponse])
async def update_driving_record(
    record_id: str = Path(..., description="수정할 운행 기록 ID"),
    record_data: DrivingRecordUpdate = None,
    current_user: dict = Depends(get_current_user),
):
    """
    특정 운행 기록을 업데이트합니다.
    """
    try:
        # 인증된 사용자만 운행 기록 수정 가능
        if not current_user:
            raise unauthorized_exception("인증되지 않은 사용자입니다.")

        # 운행 기록 존재 여부 확인
        existing_record = await db.drivingrecord.find_unique(where={"id": record_id})

        if not existing_record:
            raise not_found_exception("운행 기록", record_id)

        # 업데이트할 데이터 준비
        update_data = record_data.model_dump(exclude_unset=True)

        # camelCase로 변환 (Prisma DB 필드명과 일치)
        if "end_time" in update_data:
            update_data["endTime"] = update_data.pop("end_time")
        if "end_location" in update_data:
            update_data["endLocation"] = update_data.pop("end_location")
        if "avg_speed" in update_data:
            update_data["avgSpeed"] = update_data.pop("avg_speed")
        if "max_speed" in update_data:
            update_data["maxSpeed"] = update_data.pop("max_speed")
        if "fuel_consumption" in update_data:
            update_data["fuelConsumption"] = update_data.pop("fuel_consumption")
        if "hard_brake_count" in update_data:
            update_data["hardBrakeCount"] = update_data.pop("hard_brake_count")
        if "hard_accel_count" in update_data:
            update_data["hardAccelCount"] = update_data.pop("hard_accel_count")
        if "idling_duration" in update_data:
            update_data["idlingDuration"] = update_data.pop("idling_duration")
        if "route_data" in update_data:
            update_data["routeData"] = update_data.pop("route_data")

        # 주행거리 변경 시 차량 주행거리 업데이트
        if "distance" in update_data:
            # 차량 조회
            vehicle = await db.vehicle.find_unique(
                where={"id": existing_record.vehicleId}
            )

            if vehicle:
                distance_diff = update_data["distance"] - existing_record.distance
                await db.vehicle.update(
                    where={"id": existing_record.vehicleId},
                    data={"mileage": vehicle.mileage + int(distance_diff)},
                )

        # 데이터 업데이트
        updated_record = await db.drivingrecord.update(
            where={"id": record_id}, data=update_data
        )

        response_data = DrivingRecordResponse.model_validate(updated_record)

        return create_response(
            data=response_data,
            message="운행 기록이 성공적으로 업데이트되었습니다."
        )

    except PrismaError as e:
        logger.error(f"Prisma 오류: {str(e)}")
        raise server_error_exception("운행 기록 업데이트 중 데이터베이스 오류가 발생했습니다.")
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"예상치 못한 오류: {str(e)}")
        raise server_error_exception(f"운행 기록 업데이트 중 오류가 발생했습니다: {str(e)}")


@router.delete("/driving-records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_driving_record(
    record_id: str = Path(..., description="삭제할 운행 기록 ID"),
    current_user: dict = Depends(get_current_user),
):
    """
    특정 운행 기록을 삭제합니다.
    """
    try:
        # 인증된 사용자만 운행 기록 삭제 가능
        if not current_user:
            raise unauthorized_exception("인증되지 않은 사용자입니다.")

        # 운행 기록 존재 여부 확인
        existing_record = await db.drivingrecord.find_unique(where={"id": record_id})

        if not existing_record:
            raise not_found_exception("운행 기록", record_id)

        # 차량 조회 및 주행거리 업데이트
        vehicle = await db.vehicle.find_unique(where={"id": existing_record.vehicleId})

        if vehicle:
            # 삭제되는 기록의 주행거리만큼 차량 주행거리 감소
            new_mileage = max(0, vehicle.mileage - int(existing_record.distance))
            await db.vehicle.update(
                where={"id": existing_record.vehicleId},
                data={"mileage": new_mileage},
            )

        # 운행 기록 삭제
        await db.drivingrecord.delete(where={"id": record_id})

        return None

    except PrismaError as e:
        logger.error(f"Prisma 오류: {str(e)}")
        raise server_error_exception("운행 기록 삭제 중 데이터베이스 오류가 발생했습니다.")
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"예상치 못한 오류: {str(e)}")
        raise server_error_exception(f"운행 기록 삭제 중 오류가 발생했습니다: {str(e)}")


@router.get(
    "/driver/{driver_id}/driving-records", response_model=ApiResponse[List[DrivingRecordResponse]]
)
async def get_driver_driving_records(
    driver_id: str = Path(..., description="운전자 ID"),
    start_time_from: Optional[datetime] = None,
    start_time_to: Optional[datetime] = None,
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(10, ge=1, le=100, description="페이지 크기"),
    current_user: dict = Depends(get_current_user),
):
    """
    특정 운전자의 운행 기록 목록을 조회합니다.
    """
    try:
        # 인증된 사용자만 운전자 운행 기록 조회 가능
        if not current_user:
            raise unauthorized_exception("인증되지 않은 사용자입니다.")

        # 운전자 존재 여부 확인
        driver = await db.driver.find_unique(where={"id": driver_id})

        if not driver:
            raise not_found_exception("운전자", driver_id)

        # 필터 조건 구성
        where_conditions = {"driverId": driver_id}

        # 날짜 필터
        if start_time_from or start_time_to:
            where_conditions["startTime"] = {}

            if start_time_from:
                where_conditions["startTime"]["gte"] = start_time_from

            if start_time_to:
                where_conditions["startTime"]["lte"] = start_time_to

        # 전체 레코드 수 조회
        total_records = await db.drivingrecord.count(where=where_conditions)

        # 페이지네이션 계산
        skip = (page - 1) * page_size
        total_pages = math.ceil(total_records / page_size)

        # 운행 기록 목록 조회
        records = await db.drivingrecord.find_many(
            where=where_conditions,
            skip=skip,
            take=page_size,
            order={"startTime": "desc"},
        )

        # 응답 데이터 변환
        response_items = [DrivingRecordResponse.model_validate(record) for record in records]

        return create_response(
            data=response_items,
            message=f"운전자 '{driver.name}'의 운행 기록이 성공적으로 조회되었습니다.",
            page=page,
            per_page=page_size,
            total_items=total_records,
            total_pages=total_pages
        )

    except PrismaError as e:
        logger.error(f"Prisma 오류: {str(e)}")
        raise server_error_exception("운전자 운행 기록 목록 조회 중 데이터베이스 오류가 발생했습니다.")
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"예상치 못한 오류: {str(e)}")
        raise server_error_exception(f"운전자 운행 기록 목록 조회 중 오류가 발생했습니다: {str(e)}")


@router.get(
    "/vehicle/{vehicle_id}/driving-records", response_model=ApiResponse[List[DrivingRecordResponse]]
)
async def get_vehicle_driving_records(
    vehicle_id: str = Path(..., description="차량 ID"),
    start_time_from: Optional[datetime] = None,
    start_time_to: Optional[datetime] = None,
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(10, ge=1, le=100, description="페이지 크기"),
    current_user: dict = Depends(get_current_user),
):
    """
    특정 차량의 운행 기록 목록을 조회합니다.
    """
    try:
        # 인증된 사용자만 차량 운행 기록 조회 가능
        if not current_user:
            raise unauthorized_exception("인증되지 않은 사용자입니다.")

        # 차량 존재 여부 확인
        vehicle = await db.vehicle.find_unique(where={"id": vehicle_id})

        if not vehicle:
            raise not_found_exception("차량", vehicle_id)

        # 필터 조건 구성
        where_conditions = {"vehicleId": vehicle_id}

        # 날짜 필터
        if start_time_from or start_time_to:
            where_conditions["startTime"] = {}

            if start_time_from:
                where_conditions["startTime"]["gte"] = start_time_from

            if start_time_to:
                where_conditions["startTime"]["lte"] = start_time_to

        # 전체 레코드 수 조회
        total_records = await db.drivingrecord.count(where=where_conditions)

        # 페이지네이션 계산
        skip = (page - 1) * page_size
        total_pages = math.ceil(total_records / page_size)

        # 운행 기록 목록 조회
        records = await db.drivingrecord.find_many(
            where=where_conditions,
            skip=skip,
            take=page_size,
            order={"startTime": "desc"},
        )

        # 응답 데이터 변환
        response_items = [DrivingRecordResponse.model_validate(record) for record in records]

        return create_response(
            data=response_items,
            message=f"차량 '{vehicle.make} {vehicle.model}'의 운행 기록이 성공적으로 조회되었습니다.",
            page=page,
            per_page=page_size,
            total_items=total_records,
            total_pages=total_pages
        )

    except PrismaError as e:
        logger.error(f"Prisma 오류: {str(e)}")
        raise server_error_exception("차량 운행 기록 목록 조회 중 데이터베이스 오류가 발생했습니다.")
    except ApiException:
        raise
    except Exception as e:
        logger.error(f"예상치 못한 오류: {str(e)}")
        raise server_error_exception(f"차량 운행 기록 목록 조회 중 오류가 발생했습니다: {str(e)}")
