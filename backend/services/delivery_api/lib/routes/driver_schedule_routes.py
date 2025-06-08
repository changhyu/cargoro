"""
탁송기사 일정 관리 라우트

이 모듈은 탁송기사의 일정 관리와 관련된 API 엔드포인트를 제공합니다.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body
from typing import List, Optional
from datetime import datetime, date
from ..database import get_prisma
from ..models import (
    DriverScheduleCreate,
    DriverScheduleUpdate,
    DriverScheduleResponse,
    ScheduleStatus,
)
from ..utils.response_utils import (
    ApiResponse,
    create_response,
    not_found_exception,
    validation_exception,
    server_error_exception,
    conflict_exception,
    bad_request_exception,
)
import logging

router = APIRouter(
    prefix="/drivers/schedules",
    tags=["driver_schedules"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger("delivery-api:driver_schedules")

# 리소스 타입 상수
RESOURCE_TYPE = "기사일정"


# 기사 일정 생성
@router.post("/", response_model=ApiResponse, status_code=201)
async def create_driver_schedule(
    schedule: DriverScheduleCreate, prisma=Depends(get_prisma)
):
    """
    기사 일정을 생성합니다.
    """
    try:
        # 기사 존재 확인
        driver = await prisma.driver.find_unique(where={"id": schedule.driver_id})
        if not driver:
            raise not_found_exception("기사", schedule.driver_id)

        # 시간 충돌 확인
        existing_schedule = await prisma.driverSchedule.find_first(
            where={
                "driver_id": schedule.driver_id,
                "date": schedule.date,
                "status": {"in": ["PENDING", "CONFIRMED", "IN_PROGRESS"]},
            }
        )

        if existing_schedule:
            raise conflict_exception(RESOURCE_TYPE, "date")

        # 일정 생성
        new_schedule = await prisma.driverSchedule.create(
            data={
                "driver_id": schedule.driver_id,
                "date": schedule.date,
                "start_time": schedule.start_time,
                "end_time": schedule.end_time,
                "description": schedule.description,
                "location": schedule.location,
                "status": schedule.status or "PENDING",
                "priority": schedule.priority or "NORMAL",
                "notes": schedule.notes,
            }
        )

        return create_response(
            data=new_schedule,
            message="기사 일정이 성공적으로 생성되었습니다.",
            status_code=201,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"기사 일정 생성 실패: {str(e)}")
        raise server_error_exception(f"기사 일정 생성 중 오류가 발생했습니다: {str(e)}")


# 기사 일정 목록 조회
@router.get("/", response_model=ApiResponse)
async def get_driver_schedules(
    driver_id: Optional[str] = Query(None, description="기사 ID"),
    status: Optional[ScheduleStatus] = Query(None, description="일정 상태"),
    start_date: Optional[date] = Query(None, description="시작 날짜"),
    end_date: Optional[date] = Query(None, description="종료 날짜"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(20, ge=1, le=100, description="페이지 크기"),
    prisma=Depends(get_prisma),
):
    """
    기사 일정 목록을 조회합니다.
    """
    try:
        # 필터 조건 구성
        where = {}
        if driver_id:
            where["driver_id"] = driver_id
        if status:
            where["status"] = status

        # 날짜 범위 필터
        if start_date or end_date:
            where["date"] = {}
            if start_date:
                where["date"]["gte"] = start_date
            if end_date:
                where["date"]["lte"] = end_date

        # 총 항목 수 조회
        total_count = await prisma.driverSchedule.count(where=where)

        # 페이지네이션 적용
        skip = (page - 1) * page_size
        schedules = await prisma.driverSchedule.find_many(
            where=where,
            skip=skip,
            take=page_size,
            order_by={"date": "asc"},
            include={"driver": True},
        )

        # 페이지 정보 계산
        total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1

        return create_response(
            data={
                "items": schedules,
                "total": total_count,
                "page": page,
                "page_size": page_size,
                "total_pages": total_pages,
            }
        )
    except Exception as e:
        logger.error(f"기사 일정 목록 조회 실패: {str(e)}")
        raise server_error_exception(f"기사 일정 목록 조회 중 오류가 발생했습니다: {str(e)}")


# 특정 기사 일정 조회
@router.get("/{schedule_id}", response_model=ApiResponse)
async def get_driver_schedule(
    schedule_id: str = Path(..., description="일정 ID"),
    prisma=Depends(get_prisma),
):
    """
    특정 기사 일정을 조회합니다.
    """
    try:
        schedule = await prisma.driverSchedule.find_unique(
            where={"id": schedule_id},
            include={"driver": True},
        )

        if not schedule:
            raise not_found_exception(RESOURCE_TYPE, schedule_id)

        return create_response(data=schedule)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"기사 일정 조회 실패: {str(e)}")
        raise server_error_exception(f"기사 일정 조회 중 오류가 발생했습니다: {str(e)}")


# 기사 일정 수정
@router.patch("/{schedule_id}", response_model=ApiResponse)
async def update_driver_schedule(
    schedule_id: str = Path(..., description="일정 ID"),
    schedule_data: DriverScheduleUpdate = Body(...),
    prisma=Depends(get_prisma),
):
    """
    기사 일정을 수정합니다.
    """
    try:
        # 일정 존재 확인
        existing_schedule = await prisma.driverSchedule.find_unique(
            where={"id": schedule_id}
        )

        if not existing_schedule:
            raise not_found_exception(RESOURCE_TYPE, schedule_id)

        # 수정할 데이터 준비
        update_data = schedule_data.dict(exclude_unset=True)

        # 수정 작업 수행
        updated_schedule = await prisma.driverSchedule.update(
            where={"id": schedule_id},
            data=update_data,
            include={"driver": True},
        )

        return create_response(
            data=updated_schedule,
            message="기사 일정이 성공적으로 수정되었습니다.",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"기사 일정 수정 실패: {str(e)}")
        raise server_error_exception(f"기사 일정 수정 중 오류가 발생했습니다: {str(e)}")


# 기사 일정 삭제
@router.delete("/{schedule_id}", response_model=ApiResponse)
async def delete_driver_schedule(
    schedule_id: str = Path(..., description="일정 ID"),
    prisma=Depends(get_prisma),
):
    """
    기사 일정을 삭제합니다.
    """
    try:
        # 일정 존재 확인
        existing_schedule = await prisma.driverSchedule.find_unique(
            where={"id": schedule_id}
        )

        if not existing_schedule:
            raise not_found_exception(RESOURCE_TYPE, schedule_id)

        # 삭제 작업 수행
        await prisma.driverSchedule.delete(where={"id": schedule_id})

        return create_response(
            data={"id": schedule_id},
            message="기사 일정이 성공적으로 삭제되었습니다.",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"기사 일정 삭제 실패: {str(e)}")
        raise server_error_exception(f"기사 일정 삭제 중 오류가 발생했습니다: {str(e)}")


# 기사 일정 상태 업데이트
@router.patch("/{schedule_id}/status", response_model=ApiResponse)
async def update_driver_schedule_status(
    schedule_id: str = Path(..., description="일정 ID"),
    status: ScheduleStatus = Body(..., embed=True),
    prisma=Depends(get_prisma),
):
    """
    기사 일정의 상태를 업데이트합니다.
    """
    try:
        # 일정 존재 확인
        existing_schedule = await prisma.driverSchedule.find_unique(
            where={"id": schedule_id}
        )

        if not existing_schedule:
            raise not_found_exception(RESOURCE_TYPE, schedule_id)

        # 상태 업데이트
        updated_schedule = await prisma.driverSchedule.update(
            where={"id": schedule_id},
            data={"status": status},
        )

        return create_response(
            data=updated_schedule,
            message=f"기사 일정 상태가 '{status}'(으)로 변경되었습니다.",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"기사 일정 상태 업데이트 실패: {str(e)}")
        raise server_error_exception(f"기사 일정 상태 업데이트 중 오류가 발생했습니다: {str(e)}")


# 기사별 일정 대시보드 정보
@router.get("/dashboard/{driver_id}", response_model=ApiResponse)
async def get_driver_schedule_dashboard(
    driver_id: str = Path(..., description="기사 ID"),
    start_date: Optional[date] = Query(None, description="시작 날짜"),
    end_date: Optional[date] = Query(None, description="종료 날짜"),
    prisma=Depends(get_prisma),
):
    """
    기사별 일정 대시보드 정보를 조회합니다.
    """
    try:
        # 기사 존재 확인
        driver = await prisma.driver.find_unique(where={"id": driver_id})
        if not driver:
            raise not_found_exception("기사", driver_id)

        # 날짜 필터 설정
        where = {"driver_id": driver_id}
        if start_date or end_date:
            where["date"] = {}
            if start_date:
                where["date"]["gte"] = start_date
            if end_date:
                where["date"]["lte"] = end_date

        # 일정 상태별 통계
        total_schedules = await prisma.driverSchedule.count(where=where)
        pending_schedules = await prisma.driverSchedule.count(
            where={**where, "status": "PENDING"}
        )
        confirmed_schedules = await prisma.driverSchedule.count(
            where={**where, "status": "CONFIRMED"}
        )
        completed_schedules = await prisma.driverSchedule.count(
            where={**where, "status": "COMPLETED"}
        )
        cancelled_schedules = await prisma.driverSchedule.count(
            where={**where, "status": "CANCELLED"}
        )

        # 다음 예정된 일정
        next_schedules = await prisma.driverSchedule.find_many(
            where={
                "driver_id": driver_id,
                "date": {"gte": datetime.now().date()},
                "status": {"in": ["PENDING", "CONFIRMED"]},
            },
            take=5,
            order_by={"date": "asc"},
        )

        return create_response(
            data={
                "driver_info": {
                    "id": driver.id,
                    "name": f"{driver.first_name} {driver.last_name}",
                    "contact": driver.contact,
                },
                "statistics": {
                    "total": total_schedules,
                    "pending": pending_schedules,
                    "confirmed": confirmed_schedules,
                    "completed": completed_schedules,
                    "cancelled": cancelled_schedules,
                    "completion_rate": (
                        completed_schedules / (total_schedules - cancelled_schedules) * 100
                        if total_schedules > cancelled_schedules
                        else 0
                    ),
                },
                "upcoming_schedules": next_schedules,
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"기사 일정 대시보드 조회 실패: {str(e)}")
        raise server_error_exception(f"기사 일정 대시보드 조회 중 오류가 발생했습니다: {str(e)}")
