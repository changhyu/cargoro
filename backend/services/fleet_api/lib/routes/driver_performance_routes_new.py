"""
운전자 성능 관련 API 라우트
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import math
import logging
from prisma.errors import PrismaError

from ..models.driver_performance import (
    DriverPerformanceCreate,
    DriverPerformanceUpdate,
    DriverPerformanceResponse,
    PerformancePeriod,
    DriverScoreCategory,
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

router = APIRouter(tags=["driver-performance"])
logger = logging.getLogger(__name__)

# 리소스 타입 상수
RESOURCE_TYPE = "운전자 성능 데이터"


@router.post(
    "/driver-performance",
    response_model=ApiResponse[DriverPerformanceResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_driver_performance(
    performance_data: DriverPerformanceCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    새로운 운전자 성능 데이터를 생성합니다.
    """
    try:
        # 인증된 사용자만 성능 데이터 생성 가능
        if not current_user:
            raise unauthorized_exception()

        # 운전자 존재 여부 확인
        driver = await db.driver.find_unique(where={"id": performance_data.driver_id})

        if not driver:
            raise not_found_exception("운전자", performance_data.driver_id)

        # 시간 관련 유효성 검증
        if performance_data.end_date <= performance_data.start_date:
            raise validation_exception("종료일은 시작일보다 이후여야 합니다.")

        # DB 데이터 변환 (snake_case -> camelCase)
        db_data = model_to_db_dict(performance_data)

        # 성능 데이터 생성
        created_performance = await db.driverperformance.create(data=db_data)

        # 결과 변환 (camelCase -> snake_case)
        result = db_to_model(DriverPerformanceResponse, created_performance)

        # 응답 생성
        return create_response(
            data=result,
            message=f"{RESOURCE_TYPE}가 성공적으로 생성되었습니다.",
        )

    except Exception as e:
        logger.error(f"운전자 성능 데이터 생성 오류: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise server_error_exception(str(e))


@router.get(
    "/driver-performance/{performance_id}",
    response_model=ApiResponse[DriverPerformanceResponse],
)
async def get_driver_performance(
    performance_id: str = Path(..., description="성능 데이터 ID"),
    current_user: dict = Depends(get_current_user),
):
    """
    특정 ID의 운전자 성능 데이터를 조회합니다.
    """
    try:
        # 성능 데이터 조회
        performance = await db.driverperformance.find_unique(
            where={"id": performance_id}
        )

        if not performance:
            raise not_found_exception(RESOURCE_TYPE, performance_id)

        # 결과 변환
        result = db_to_model(DriverPerformanceResponse, performance)

        # 응답 생성
        return create_response(
            data=result,
            message=f"{RESOURCE_TYPE}가 성공적으로 조회되었습니다.",
        )

    except Exception as e:
        logger.error(f"운전자 성능 데이터 조회 오류: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise server_error_exception(str(e))


@router.put(
    "/driver-performance/{performance_id}",
    response_model=ApiResponse[DriverPerformanceResponse],
)
async def update_driver_performance(
    performance_id: str,
    performance_data: DriverPerformanceUpdate,
    current_user: dict = Depends(get_current_user),
):
    """
    특정 ID의 운전자 성능 데이터를 업데이트합니다.
    """
    try:
        # 성능 데이터 존재 확인
        existing_performance = await db.driverperformance.find_unique(
            where={"id": performance_id}
        )

        if not existing_performance:
            raise not_found_exception(RESOURCE_TYPE, performance_id)

        # DB 데이터 변환
        db_data = model_to_db_dict(performance_data)

        # 업데이트
        updated_performance = await db.driverperformance.update(
            where={"id": performance_id},
            data=db_data,
        )

        # 결과 변환
        result = db_to_model(DriverPerformanceResponse, updated_performance)

        # 응답 생성
        return create_response(
            data=result,
            message=f"{RESOURCE_TYPE}가 성공적으로 업데이트되었습니다.",
        )

    except Exception as e:
        logger.error(f"운전자 성능 데이터 업데이트 오류: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise server_error_exception(str(e))


@router.delete(
    "/driver-performance/{performance_id}",
    response_model=ApiResponse,
)
async def delete_driver_performance(
    performance_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    특정 ID의 운전자 성능 데이터를 삭제합니다.
    """
    try:
        # 성능 데이터 존재 확인
        existing_performance = await db.driverperformance.find_unique(
            where={"id": performance_id}
        )

        if not existing_performance:
            raise not_found_exception(RESOURCE_TYPE, performance_id)

        # 삭제
        await db.driverperformance.delete(where={"id": performance_id})

        # 응답 생성
        return create_response(
            data=None,
            message=f"{RESOURCE_TYPE}가 성공적으로 삭제되었습니다.",
        )

    except Exception as e:
        logger.error(f"운전자 성능 데이터 삭제 오류: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise server_error_exception(str(e))
