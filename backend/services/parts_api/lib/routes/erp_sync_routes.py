"""
ERP 동기화 라우터 - API 엔드포인트 정의
"""
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Path,
    status,
    BackgroundTasks,
)
from typing import List, Optional, Dict, Any
from datetime import datetime
import math
import logging
import json
from prisma.errors import PrismaError

from ..models.erp_sync import (
    ERPSyncConfigCreate,
    ERPSyncConfigUpdate,
    ERPSyncConfigResponse,
    ERPSyncConfigListResponse,
    ERPSyncLogCreate,
    ERPSyncLogUpdate,
    ERPSyncLogResponse,
    ERPSyncLogListResponse,
    SyncDataRequest,
    SyncDataResponse,
    SyncStatus,
    SyncDirection,
    ERPSystem,
)
from ..services.erp_sync_service import ERPSyncService
from ..utils.auth import get_current_user
from ..utils.response_utils import (
    ApiResponse,
    create_response,
    not_found_exception,
    validation_exception,
    server_error_exception,
    conflict_exception,
)
from ..utils.model_conversion import model_to_db_dict, db_to_model

# Prisma 클라이언트 초기화
from prisma import Prisma

db = Prisma()

router = APIRouter(tags=["erp-sync"])
logger = logging.getLogger(__name__)
erp_sync_service = ERPSyncService()

# 리소스 타입 상수
RESOURCE_TYPE = "ERP 동기화 설정"
LOG_RESOURCE_TYPE = "ERP 동기화 로그"


@router.post(
    "/erp-sync-configs",
    response_model=ApiResponse[ERPSyncConfigResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_erp_sync_config(
    config_data: ERPSyncConfigCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """ERP 동기화 설정 생성"""
    try:
        # 조직 ID 유효성 검증
        organization_id = config_data.organization_id
        organization = await db.organization.find_unique(
            where={"id": organization_id}
        )
        if not organization:
            raise not_found_exception("조직", organization_id)

        # 중복 확인
        existing_config = await db.erpsyncconfig.find_first(
            where={
                "name": config_data.name,
                "organizationId": organization_id,
            }
        )
        if existing_config:
            raise conflict_exception(RESOURCE_TYPE, "name")

        # DB에 저장할 데이터 준비 (snake_case -> camelCase)
        db_data = model_to_db_dict(config_data)

        # 설정 생성
        created_config = await db.erpsyncconfig.create(data=db_data)

        # 응답 데이터 변환 (camelCase -> snake_case)
        result = db_to_model(ERPSyncConfigResponse, created_config)

        return create_response(
            data=result,
            message=f"{RESOURCE_TYPE}이(가) 성공적으로 생성되었습니다.",
        )

    except Exception as e:
        logger.error(f"ERP 동기화 설정 생성 오류: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise server_error_exception(str(e))


@router.get(
    "/erp-sync-configs",
    response_model=ApiResponse[ERPSyncConfigListResponse],
)
async def list_erp_sync_configs(
    organization_id: str = Query(..., description="조직 ID"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(10, ge=1, le=100, description="페이지 크기"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """ERP 동기화 설정 목록 조회"""
    try:
        # 조직 ID 유효성 검증
        organization = await db.organization.find_unique(
            where={"id": organization_id}
        )
        if not organization:
            raise not_found_exception("조직", organization_id)

        # 데이터 조회
        skip = (page - 1) * page_size
        configs = await db.erpsyncconfig.find_many(
            where={"organizationId": organization_id},
            skip=skip,
            take=page_size,
            order={"updatedAt": "desc"},
        )

        total = await db.erpsyncconfig.count(
            where={"organizationId": organization_id}
        )

        # 응답 데이터 변환
        config_responses = [db_to_model(ERPSyncConfigResponse, config) for config in configs]

        response = ERPSyncConfigListResponse(
            items=config_responses,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=math.ceil(total / page_size),
        )

        return create_response(
            data=response,
            message=f"{RESOURCE_TYPE} 목록이 성공적으로 조회되었습니다.",
        )

    except Exception as e:
        logger.error(f"ERP 동기화 설정 목록 조회 오류: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise server_error_exception(str(e))


@router.get(
    "/erp-sync-configs/{config_id}",
    response_model=ApiResponse[ERPSyncConfigResponse],
)
async def get_erp_sync_config(
    config_id: str = Path(..., description="동기화 설정 ID"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """ERP 동기화 설정 상세 조회"""
    try:
        # 설정 조회
        config = await db.erpsyncconfig.find_unique(
            where={"id": config_id}
        )

        if not config:
            raise not_found_exception(RESOURCE_TYPE, config_id)

        # 응답 데이터 변환
        result = db_to_model(ERPSyncConfigResponse, config)

        return create_response(
            data=result,
            message=f"{RESOURCE_TYPE}이(가) 성공적으로 조회되었습니다.",
        )

    except Exception as e:
        logger.error(f"ERP 동기화 설정 조회 오류: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise server_error_exception(str(e))


@router.put(
    "/erp-sync-configs/{config_id}",
    response_model=ApiResponse[ERPSyncConfigResponse],
)
async def update_erp_sync_config(
    config_id: str = Path(..., description="동기화 설정 ID"),
    config_data: ERPSyncConfigUpdate = ...,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """ERP 동기화 설정 업데이트"""
    try:
        # 설정 존재 확인
        existing_config = await db.erpsyncconfig.find_unique(
            where={"id": config_id}
        )

        if not existing_config:
            raise not_found_exception(RESOURCE_TYPE, config_id)

        # 이름 중복 확인 (이름 변경 시)
        if config_data.name and config_data.name != existing_config.name:
            name_check = await db.erpsyncconfig.find_first(
                where={
                    "name": config_data.name,
                    "organizationId": existing_config.organizationId,
                    "id": {"not": config_id},
                }
            )
            if name_check:
                raise conflict_exception(RESOURCE_TYPE, "name")

        # DB에 저장할 데이터 준비 (snake_case -> camelCase)
        db_data = model_to_db_dict(config_data)

        # 설정 업데이트
        updated_config = await db.erpsyncconfig.update(
            where={"id": config_id},
            data=db_data,
        )

        # 응답 데이터 변환
        result = db_to_model(ERPSyncConfigResponse, updated_config)

        return create_response(
            data=result,
            message=f"{RESOURCE_TYPE}이(가) 성공적으로 업데이트되었습니다.",
        )

    except Exception as e:
        logger.error(f"ERP 동기화 설정 업데이트 오류: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise server_error_exception(str(e))


@router.delete(
    "/erp-sync-configs/{config_id}",
    response_model=ApiResponse,
)
async def delete_erp_sync_config(
    config_id: str = Path(..., description="동기화 설정 ID"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """ERP 동기화 설정 삭제"""
    try:
        # 설정 존재 확인
        existing_config = await db.erpsyncconfig.find_unique(
            where={"id": config_id}
        )

        if not existing_config:
            raise not_found_exception(RESOURCE_TYPE, config_id)

        # 관련 로그 삭제
        await db.erpsynclog.delete_many(
            where={"configId": config_id}
        )

        # 설정 삭제
        await db.erpsyncconfig.delete(
            where={"id": config_id}
        )

        return create_response(
            data=None,
            message=f"{RESOURCE_TYPE}이(가) 성공적으로 삭제되었습니다.",
        )

    except Exception as e:
        logger.error(f"ERP 동기화 설정 삭제 오류: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise server_error_exception(str(e))
