"""
차량 유지보수 관련 API 라우트
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from typing import List, Optional
from datetime import datetime
import math
import logging
from prisma.errors import PrismaError

from ..models.maintenance import (
    MaintenanceCreate,
    MaintenanceUpdate,
    MaintenanceResponse,
    MaintenancePartCreate,
    MaintenancePartUpdate,
    MaintenancePartResponse,
    MaintenanceStatus,
    MaintenanceType,
)
from ..utils.auth import get_current_user
from ..utils.model_conversion import model_to_db_dict, db_to_model
from ..utils.response_utils import (
    ApiResponse,
    create_response,
    not_found_exception,
    validation_exception,
    server_error_exception,
    unauthorized_exception,
)

# Prisma 클라이언트 초기화
from prisma import Prisma

db = Prisma()

router = APIRouter(tags=["maintenance"])
logger = logging.getLogger(__name__)

# 리소스 타입 상수
RESOURCE_TYPE = "유지보수 기록"


@router.post(
    "/maintenance",
    response_model=ApiResponse[MaintenanceResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_maintenance(
    maintenance_data: MaintenanceCreate, current_user: dict = Depends(get_current_user)
):
    """
    새로운 유지보수 기록을 생성합니다.
    """
    try:
        # 인증된 사용자만 유지보수 기록 생성 가능
        if not current_user:
            raise unauthorized_exception()

        # 차량 존재 여부 확인
        vehicle = await db.vehicle.find_unique(where={"id": maintenance_data.vehicle_id})

        if not vehicle:
            raise not_found_exception("차량", maintenance_data.vehicle_id)

        # DB 데이터 변환 (snake_case -> camelCase)
        maintenance_data_dict = model_to_db_dict(maintenance_data, exclude={"parts"})

        # 유지보수 데이터 생성
        new_maintenance = await db.maintenance.create(data=maintenance_data_dict)

        # 부품 데이터 추가
        if maintenance_data.parts:
            for part in maintenance_data.parts:
                part_dict = model_to_db_dict(part)
                part_dict["maintenanceId"] = new_maintenance.id
                await db.maintenancepart.create(data=part_dict)

        # 생성된 유지보수 기록 조회 (부품 포함)
        created_maintenance = await db.maintenance.find_unique(
            where={"id": new_maintenance.id}, include={"parts": True}
        )

        # 결과 변환
        result = db_to_model(MaintenanceResponse, created_maintenance)

        # 응답 생성
        return create_response(
            data=result,
            message=f"{RESOURCE_TYPE}이(가) 성공적으로 생성되었습니다.",
        )

    except Exception as e:
        logger.error(f"유지보수 기록 생성 오류: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise server_error_exception(str(e))


@router.get(
    "/maintenance/{maintenance_id}",
    response_model=ApiResponse[MaintenanceResponse],
)
async def get_maintenance(
    maintenance_id: str = Path(..., description="유지보수 기록 ID"),
    current_user: dict = Depends(get_current_user),
):
    """
    특정 ID의 유지보수 기록을 조회합니다.
    """
    try:
        # 유지보수 기록 조회
        maintenance = await db.maintenance.find_unique(
            where={"id": maintenance_id}, include={"parts": True}
        )

        if not maintenance:
            raise not_found_exception(RESOURCE_TYPE, maintenance_id)

        # 결과 변환
        result = db_to_model(MaintenanceResponse, maintenance)

        # 응답 생성
        return create_response(
            data=result,
            message=f"{RESOURCE_TYPE}이(가) 성공적으로 조회되었습니다.",
        )

    except Exception as e:
        logger.error(f"유지보수 기록 조회 오류: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise server_error_exception(str(e))


@router.put(
    "/maintenance/{maintenance_id}",
    response_model=ApiResponse[MaintenanceResponse],
)
async def update_maintenance(
    maintenance_id: str,
    maintenance_data: MaintenanceUpdate,
    current_user: dict = Depends(get_current_user),
):
    """
    특정 ID의 유지보수 기록을 업데이트합니다.
    """
    try:
        # 유지보수 기록 존재 확인
        existing_maintenance = await db.maintenance.find_unique(
            where={"id": maintenance_id}
        )

        if not existing_maintenance:
            raise not_found_exception(RESOURCE_TYPE, maintenance_id)

        # DB 데이터 변환
        db_data = model_to_db_dict(maintenance_data, exclude={"parts"})

        # 업데이트
        updated_maintenance = await db.maintenance.update(
            where={"id": maintenance_id},
            data=db_data,
        )

        # 부품 업데이트 처리 (필요한 경우)
        if maintenance_data.parts is not None:
            # 기존 부품 삭제
            await db.maintenancepart.delete_many(
                where={"maintenance_id": maintenance_id}
            )

            # 새로운 부품 추가
            for part in maintenance_data.parts:
                part_dict = model_to_db_dict(part)
                part_dict["maintenanceId"] = maintenance_id
                await db.maintenancepart.create(data=part_dict)

        # 업데이트된 기록 조회
        result_maintenance = await db.maintenance.find_unique(
            where={"id": maintenance_id}, include={"parts": True}
        )

        # 결과 변환
        result = db_to_model(MaintenanceResponse, result_maintenance)

        # 응답 생성
        return create_response(
            data=result,
            message=f"{RESOURCE_TYPE}이(가) 성공적으로 업데이트되었습니다.",
        )

    except Exception as e:
        logger.error(f"유지보수 기록 업데이트 오류: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise server_error_exception(str(e))


@router.delete(
    "/maintenance/{maintenance_id}",
    response_model=ApiResponse,
)
async def delete_maintenance(
    maintenance_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    특정 ID의 유지보수 기록을 삭제합니다.
    """
    try:
        # 유지보수 기록 존재 확인
        existing_maintenance = await db.maintenance.find_unique(
            where={"id": maintenance_id}
        )

        if not existing_maintenance:
            raise not_found_exception(RESOURCE_TYPE, maintenance_id)

        # 관련 부품 데이터 삭제
        await db.maintenancepart.delete_many(
            where={"maintenance_id": maintenance_id}
        )

        # 유지보수 기록 삭제
        await db.maintenance.delete(where={"id": maintenance_id})

        # 응답 생성
        return create_response(
            data=None,
            message=f"{RESOURCE_TYPE}이(가) 성공적으로 삭제되었습니다.",
        )

    except Exception as e:
        logger.error(f"유지보수 기록 삭제 오류: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise server_error_exception(str(e))
