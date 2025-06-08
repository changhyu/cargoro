from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from typing import List, Optional
from datetime import datetime, timedelta
import math
import logging
from prisma.errors import PrismaError

from ..models.driver import (
    DriverCreate,
    DriverUpdate,
    DriverResponse,
    DriverFilters,
    DriverListResponse,
)
from ..models.assignment import VehicleAssignmentCreate, VehicleAssignmentResponse
from ..models.driver_performance import DrivingRecordResponse
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

router = APIRouter(tags=["drivers"])
logger = logging.getLogger(__name__)


@router.post(
    "/drivers", response_model=ApiResponse[DriverResponse], status_code=status.HTTP_201_CREATED
)
async def create_driver(
    driver_data: DriverCreate, current_user: dict = Depends(get_current_user)
):
    """
    새로운 운전자를 생성합니다.
    """
    try:
        # 인증된 사용자만 운전자 생성 가능
        if not current_user:
            raise unauthorized_exception("인증되지 않은 사용자입니다.")

        # 조직 존재 여부 확인
        organization = await db.organization.find_unique(
            where={"id": driver_data.organization_id}
        )

        if not organization:
            raise not_found_exception(
                "조직", driver_data.organization_id
            )

        # 이메일 중복 확인
        existing_driver = await db.driver.find_unique(
            where={"email": driver_data.email}
        )

        if existing_driver:
            raise conflict_exception("운전자", "email")

        # 면허번호 중복 확인
        existing_license = await db.driver.find_unique(
            where={"licenseNumber": driver_data.license_number}
        )

        if existing_license:
            raise conflict_exception("운전자", "license_number")

        # Driver 모델 변환 및 생성
        driver_data_dict = driver_data.model_dump()

        # camelCase로 변환 (Prisma DB 필드명과 일치)
        driver_data_dict["licenseNumber"] = driver_data_dict.pop("license_number")
        driver_data_dict["licenseType"] = driver_data_dict.pop("license_type")
        driver_data_dict["licenseExpiry"] = driver_data_dict.pop("license_expiry")
        driver_data_dict["organizationId"] = driver_data_dict.pop("organization_id")
        driver_data_dict["isActive"] = driver_data_dict.pop("is_active")

        # emergency_contact가 있을 경우 처리
        if "emergency_contact" in driver_data_dict and driver_data_dict["emergency_contact"]:
            driver_data_dict["emergencyContact"] = driver_data_dict["emergency_contact"].model_dump()
            del driver_data_dict["emergency_contact"]

        # birth_date, hire_date, profile_image_url 처리
        if "birth_date" in driver_data_dict:
            driver_data_dict["birthDate"] = driver_data_dict.pop("birth_date")
        if "hire_date" in driver_data_dict:
            driver_data_dict["hireDate"] = driver_data_dict.pop("hire_date")
        if "profile_image_url" in driver_data_dict:
            driver_data_dict["profileImageUrl"] = driver_data_dict.pop("profile_image_url")

        # assignedVehicles 초기화
        driver_data_dict["assignedVehicles"] = []

        # 데이터베이스에 저장
        new_driver = await db.driver.create(data=driver_data_dict)

        # 응답 객체 생성
        return create_response(
            data=new_driver,
            message="운전자가 성공적으로 생성되었습니다."
        )

    except PrismaError as e:
        logger.error(f"Prisma 오류: {str(e)}")
        raise server_error_exception("운전자 생성 중 데이터베이스 오류가 발생했습니다.")
    except ApiException as e:
        # ApiException은 이미 response_utils에서 적절히 포맷팅 되어 있으므로 그대로 전달
        raise
    except Exception as e:
        logger.error(f"예상치 못한 오류: {str(e)}")
        raise server_error_exception(f"운전자 생성 중 오류가 발생했습니다: {str(e)}")


@router.get("/drivers", response_model=ApiResponse[DriverListResponse])
async def get_drivers(
    name: Optional[str] = None,
    email: Optional[str] = None,
    license_number: Optional[str] = None,
    is_active: Optional[bool] = None,
    organization_id: Optional[str] = None,
    license_expiry_before: Optional[datetime] = None,
    license_expiry_after: Optional[datetime] = None,
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(10, ge=1, le=100, description="페이지 크기"),
    current_user: dict = Depends(get_current_user),
):
    """
    필터링 옵션을 사용하여 운전자 목록을 조회합니다.
    """
    try:
        # 인증된 사용자만 운전자 목록 조회 가능
        if not current_user:
            raise unauthorized_exception("인증되지 않은 사용자입니다.")

        # 필터 조건 구성
        where_conditions = {}

        if name:
            where_conditions["name"] = {"contains": name}

        if email:
            where_conditions["email"] = {"contains": email}

        if license_number:
            where_conditions["licenseNumber"] = {"contains": license_number}

        if is_active is not None:
            where_conditions["isActive"] = is_active

        if organization_id:
            where_conditions["organizationId"] = organization_id

        if license_expiry_before:
            where_conditions["licenseExpiry"] = {
                **where_conditions.get("licenseExpiry", {}),
                "lt": license_expiry_before,
            }

        if license_expiry_after:
            where_conditions["licenseExpiry"] = {
                **where_conditions.get("licenseExpiry", {}),
                "gt": license_expiry_after,
            }

        # 전체 레코드 수 조회
        total_records = await db.driver.count(where=where_conditions)

        # 페이지네이션 계산
        skip = (page - 1) * page_size
        total_pages = math.ceil(total_records / page_size)

        # 운전자 목록 조회
        drivers = await db.driver.find_many(
            where=where_conditions, skip=skip, take=page_size, order={"name": "asc"}
        )

        # 응답 구성
        response_data = {
            "items": drivers,
            "total": total_records,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }

        return create_response(
            data=response_data,
            message="운전자 목록이 성공적으로 조회되었습니다.",
            page=page,
            per_page=page_size,
            total_items=total_records,
            total_pages=total_pages
        )

    except PrismaError as e:
        logger.error(f"Prisma 오류: {str(e)}")
        raise server_error_exception("운전자 목록 조회 중 데이터베이스 오류가 발생했습니다.")
    except ApiException as e:
        raise
    except Exception as e:
        logger.error(f"예상치 못한 오류: {str(e)}")
        raise server_error_exception(f"운전자 목록 조회 중 오류가 발생했습니다: {str(e)}")


@router.get("/drivers/{driver_id}", response_model=ApiResponse[DriverResponse])
async def get_driver_by_id(
    driver_id: str = Path(..., description="조회할 운전자 ID"),
    current_user: dict = Depends(get_current_user),
):
    """
    ID로 특정 운전자의 상세 정보를 조회합니다.
    """
    try:
        # 인증된 사용자만 운전자 정보 조회 가능
        if not current_user:
            raise unauthorized_exception("인증되지 않은 사용자입니다.")

        # 운전자 조회
        driver = await db.driver.find_unique(where={"id": driver_id})

        if not driver:
            raise not_found_exception("운전자", driver_id)

        return create_response(
            data=driver,
            message="운전자 정보가 성공적으로 조회되었습니다."
        )

    except PrismaError as e:
        logger.error(f"Prisma 오류: {str(e)}")
        raise server_error_exception("운전자 조회 중 데이터베이스 오류가 발생했습니다.")
    except ApiException as e:
        raise
    except Exception as e:
        logger.error(f"예상치 못한 오류: {str(e)}")
        raise server_error_exception(f"운전자 조회 중 오류가 발생했습니다: {str(e)}")


@router.get("/drivers/license-expiry/alerts", response_model=ApiResponse[List[DriverResponse]])
async def get_license_expiry_alerts(
    days_threshold: int = Query(30, ge=1, le=365, description="만료 임박 기준 일수"),
    current_user: dict = Depends(get_current_user),
):
    """
    면허 만료가 임박한 운전자 목록을 조회합니다.
    """
    try:
        # 인증된 사용자만 면허 만료 알림 조회 가능
        if not current_user:
            raise unauthorized_exception("인증되지 않은 사용자입니다.")

        # 현재 날짜 기준으로 만료일이 threshold 일수 이내인 운전자 조회
        expiry_threshold = datetime.now() + timedelta(days=days_threshold)

        drivers = await db.driver.find_many(
            where={"licenseExpiry": {"lte": expiry_threshold}, "isActive": True},
            order={"licenseExpiry": "asc"},
        )

        return create_response(
            data=drivers,
            message=f"{days_threshold}일 이내에 면허가 만료되는 운전자 목록입니다."
        )

    except PrismaError as e:
        logger.error(f"Prisma 오류: {str(e)}")
        raise server_error_exception("면허 만료 알림 조회 중 데이터베이스 오류가 발생했습니다.")
    except ApiException as e:
        raise
    except Exception as e:
        logger.error(f"예상치 못한 오류: {str(e)}")
        raise server_error_exception(f"면허 만료 알림 조회 중 오류가 발생했습니다: {str(e)}")
