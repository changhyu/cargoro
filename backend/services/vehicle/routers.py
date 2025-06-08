"""
차량 관리 라우터

이 모듈은 차량 관리에 관련된 API 엔드포인트를 정의합니다.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from pydantic import BaseModel, Field
from datetime import datetime

from shared.utils.response_utils import create_response
from shared.interfaces import DBClient
from .handlers import (
    create_vehicle,
    get_vehicle,
    update_vehicle,
    delete_vehicle,
    list_vehicles,
    update_vehicle_status,
    get_vehicle_statistics,
    get_vehicle_maintenance_history,
    assign_driver_to_vehicle,
    unassign_driver_from_vehicle,
    get_vehicle_assignment_history,
    get_fleet_analytics,
    get_vehicle_report,
)


def create_vehicle_router(db: DBClient) -> APIRouter:
    """
    차량 관리 API 라우터 생성

    Args:
        db: 데이터베이스 클라이언트

    Returns:
        설정된 API 라우터
    """
    router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])

    # 차량 생성
    @router.post("", status_code=status.HTTP_201_CREATED)
    async def api_create_vehicle(
        vehicle_data: Dict[str, Any] = Body(...), current_user: Any = None
    ):
        """새 차량 등록"""
        result = await create_vehicle(db, vehicle_data, current_user)
        return create_response(data=result, message="차량이 성공적으로 등록되었습니다")

    # 차량 목록 조회
    @router.get("")
    async def api_list_vehicles(
        page: int = Query(1, ge=1, description="페이지 번호"),
        per_page: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
        status: Optional[str] = Query(None, description="차량 상태 필터"),
        type: Optional[str] = Query(None, description="차량 유형 필터"),
        make: Optional[str] = Query(None, description="제조사 필터"),
        model: Optional[str] = Query(None, description="모델 필터"),
        year: Optional[int] = Query(None, description="연식 필터"),
    ):
        """차량 목록 조회"""
        # 필터 조건 구성
        filters = {}
        if status:
            filters["status"] = status
        if type:
            filters["type"] = type
        if make:
            filters["make"] = make
        if model:
            filters["model"] = model
        if year:
            filters["year"] = year

        result = await list_vehicles(db, page, per_page, filters)
        return result

    # 특정 차량 조회
    @router.get("/{vehicle_id}")
    async def api_get_vehicle(vehicle_id: str):
        """차량 상세 정보 조회"""
        result = await get_vehicle(db, vehicle_id)
        return result

    # 차량 정보 업데이트
    @router.patch("/{vehicle_id}")
    async def api_update_vehicle(
        vehicle_id: str,
        vehicle_data: Dict[str, Any] = Body(...),
        current_user: Any = None,
    ):
        """차량 정보 업데이트"""
        result = await update_vehicle(db, vehicle_id, vehicle_data, current_user)
        return create_response(
            data=result, message="차량 정보가 성공적으로 업데이트되었습니다"
        )

    # 차량 삭제
    @router.delete("/{vehicle_id}")
    async def api_delete_vehicle(vehicle_id: str, current_user: Any = None):
        """차량 삭제"""
        result = await delete_vehicle(db, vehicle_id, current_user)
        return create_response(
            data={"success": result}, message="차량이 성공적으로 삭제되었습니다"
        )

    # 차량 상태 업데이트
    @router.patch("/{vehicle_id}/status")
    async def api_update_vehicle_status(
        vehicle_id: str,
        status_data: Dict[str, Any] = Body(...),
        current_user: Any = None,
    ):
        """차량 상태 업데이트"""
        status = status_data.get("status")
        notes = status_data.get("notes", "")

        result = await update_vehicle_status(
            db, vehicle_id, status, notes, current_user
        )
        return create_response(
            data=result, message=f"차량 상태가 '{status}'(으)로 업데이트되었습니다"
        )

    # 차량 통계 조회
    @router.get("/statistics")
    async def api_get_vehicle_statistics():
        """차량 통계 조회"""
        result = await get_vehicle_statistics(db)
        return result

    # 차량 정비 이력 조회
    @router.get("/{vehicle_id}/maintenance")
    async def api_get_vehicle_maintenance_history(vehicle_id: str):
        """차량 정비 이력 조회"""
        result = await get_vehicle_maintenance_history(db, vehicle_id)
        return create_response(data=result)

    # 차량에 운전자 배정
    @router.post("/{vehicle_id}/assign")
    async def api_assign_driver_to_vehicle(
        vehicle_id: str,
        assignment_data: Dict[str, Any] = Body(...),
        current_user: Any = None,
    ):
        """차량에 운전자 배정"""
        driver_id = assignment_data.get("driverId")
        start_date = assignment_data.get("startDate")
        end_date = assignment_data.get("endDate")
        notes = assignment_data.get("notes", "")

        result = await assign_driver_to_vehicle(
            db, vehicle_id, driver_id, start_date, end_date, notes, current_user
        )
        return create_response(
            data=result, message="운전자가 차량에 성공적으로 배정되었습니다"
        )

    # 차량에서 운전자 배정 해제
    @router.post("/{vehicle_id}/unassign")
    async def api_unassign_driver_from_vehicle(
        vehicle_id: str,
        unassignment_data: Dict[str, Any] = Body(...),
        current_user: Any = None,
    ):
        """차량에서 운전자 배정 해제"""
        assignment_id = unassignment_data.get("assignmentId")
        end_date = unassignment_data.get("endDate")
        notes = unassignment_data.get("notes", "")

        result = await unassign_driver_from_vehicle(
            db, vehicle_id, assignment_id, end_date, notes, current_user
        )
        return create_response(data=result, message="운전자 배정이 해제되었습니다")

    # 차량 배정 이력 조회
    @router.get("/{vehicle_id}/assignments")
    async def api_get_vehicle_assignment_history(vehicle_id: str):
        """차량 배정 이력 조회"""
        result = await get_vehicle_assignment_history(db, vehicle_id)
        return create_response(data=result)

    # 차량 보고서 생성
    @router.get("/report")
    async def api_get_vehicle_report(
        report_type: str = Query("all", description="보고서 유형 (all, maintenance, usage, assignment)"),
        start_date: Optional[str] = Query(None, description="시작 날짜 (YYYY-MM-DD)"),
        end_date: Optional[str] = Query(None, description="종료 날짜 (YYYY-MM-DD)"),
        format: str = Query("json", description="출력 형식 (json, csv, pdf)"),
    ):
        """차량 보고서 생성"""
        # 결과를 생성하기 전에 이전에 정의된 get_vehicle_report 함수 호출이 필요
        result = await get_vehicle_report(db, report_type, start_date, end_date, format)
        return result

    # 차량 대시보드/분석 데이터 조회
    @router.get("/analytics")
    async def api_get_fleet_analytics(
        period: str = Query("month", description="조회 기간 (day, week, month, year)"),
        vehicle_type: Optional[str] = Query(None, description="차량 유형 필터"),
        status: Optional[str] = Query(None, description="차량 상태 필터"),
    ):
        """차량 대시보드/분석 데이터 조회"""
        # 필터 조건 구성
        filters = {}
        if vehicle_type:
            filters["type"] = vehicle_type
        if status:
            filters["status"] = status

        result = await get_fleet_analytics(db, period, filters)
        return result

    return router
