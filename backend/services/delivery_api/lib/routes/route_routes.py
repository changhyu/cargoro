"""
탁송 경로 관리 라우트

이 모듈은 탁송 경로 관리와 관련된 API 엔드포인트를 제공합니다.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body
from typing import List, Optional
from datetime import datetime
from ..database import get_prisma
from ..models import (
    RoutePointCreate,
    RoutePointUpdate,
    RoutePointResponse,
    RouteResponse,
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
    prefix="/deliveries/{delivery_id}/routes",
    tags=["routes"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger("delivery-api:routes")

# 리소스 타입 상수
RESOURCE_TYPE = "경로"


# 탁송 경로 조회
@router.get("/", response_model=ApiResponse)
async def get_delivery_route(
    delivery_id: str = Path(..., description="탁송 ID"),
    prisma=Depends(get_prisma),
):
    """
    탁송의 경로 정보를 조회합니다.
    """
    try:
        # 탁송 존재 확인
        delivery = await prisma.delivery.find_unique(where={"id": delivery_id})
        if not delivery:
            raise not_found_exception("탁송", delivery_id)

        # 경로 포인트 조회
        route_points = await prisma.routePoint.find_many(
            where={"delivery_id": delivery_id},
            order_by={"sequence": "asc"},
        )

        return create_response(
            data={
                "delivery_id": delivery_id,
                "origin": delivery.origin_location,
                "destination": delivery.destination_location,
                "route_points": route_points,
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"탁송 경로 조회 실패: {str(e)}")
        raise server_error_exception(f"탁송 경로 조회 중 오류가 발생했습니다: {str(e)}")


# 경로 포인트 추가
@router.post("/points", response_model=ApiResponse, status_code=201)
async def add_route_point(
    delivery_id: str = Path(..., description="탁송 ID"),
    route_point: RoutePointCreate = Body(...),
    prisma=Depends(get_prisma),
):
    """
    탁송 경로에 새 포인트를 추가합니다.
    """
    try:
        # 탁송 존재 확인
        delivery = await prisma.delivery.find_unique(where={"id": delivery_id})
        if not delivery:
            raise not_found_exception("탁송", delivery_id)

        # 시퀀스 번호 결정
        if route_point.sequence is None:
            # 자동 시퀀스 할당 (마지막 시퀀스 + 1)
            last_point = await prisma.routePoint.find_first(
                where={"delivery_id": delivery_id},
                order_by={"sequence": "desc"},
            )
            sequence = (last_point.sequence + 1) if last_point else 1
        else:
            sequence = route_point.sequence

            # 동일 시퀀스 확인
            existing_point = await prisma.routePoint.find_first(
                where={
                    "delivery_id": delivery_id,
                    "sequence": sequence,
                }
            )

            if existing_point:
                # 시퀀스 재정렬
                await prisma.routePoint.update_many(
                    where={
                        "delivery_id": delivery_id,
                        "sequence": {"gte": sequence},
                    },
                    data={"sequence": {"increment": 1}},
                )

        # 경로 포인트 생성
        new_point = await prisma.routePoint.create(
            data={
                "delivery_id": delivery_id,
                "sequence": sequence,
                "latitude": route_point.latitude,
                "longitude": route_point.longitude,
                "location_name": route_point.location_name,
                "arrival_time": route_point.arrival_time,
                "departure_time": route_point.departure_time,
                "stop_duration": route_point.stop_duration,
                "notes": route_point.notes,
            }
        )

        return create_response(
            data=new_point,
            message="경로 포인트가 성공적으로 추가되었습니다.",
            status_code=201,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"경로 포인트 추가 실패: {str(e)}")
        raise server_error_exception(f"경로 포인트 추가 중 오류가 발생했습니다: {str(e)}")


# 경로 포인트 수정
@router.patch("/points/{point_id}", response_model=ApiResponse)
async def update_route_point(
    delivery_id: str = Path(..., description="탁송 ID"),
    point_id: str = Path(..., description="포인트 ID"),
    route_point: RoutePointUpdate = Body(...),
    prisma=Depends(get_prisma),
):
    """
    탁송 경로의 포인트를 수정합니다.
    """
    try:
        # 포인트 존재 확인
        existing_point = await prisma.routePoint.find_unique(
            where={"id": point_id}
        )

        if not existing_point or existing_point.delivery_id != delivery_id:
            raise not_found_exception("경로 포인트", point_id)

        # 시퀀스 변경 처리
        update_data = route_point.dict(exclude_unset=True)
        if "sequence" in update_data and update_data["sequence"] != existing_point.sequence:
            # 다른 포인트와 시퀀스 중복 검사
            conflicting_point = await prisma.routePoint.find_first(
                where={
                    "delivery_id": delivery_id,
                    "sequence": update_data["sequence"],
                    "id": {"not": point_id},
                }
            )

            if conflicting_point:
                # 시퀀스 재정렬
                if update_data["sequence"] > existing_point.sequence:
                    # 위로 이동 (기존 시퀀스보다 큰 경우)
                    await prisma.routePoint.update_many(
                        where={
                            "delivery_id": delivery_id,
                            "sequence": {
                                "gt": existing_point.sequence,
                                "lte": update_data["sequence"],
                            },
                        },
                        data={"sequence": {"decrement": 1}},
                    )
                else:
                    # 아래로 이동 (기존 시퀀스보다 작은 경우)
                    await prisma.routePoint.update_many(
                        where={
                            "delivery_id": delivery_id,
                            "sequence": {
                                "gte": update_data["sequence"],
                                "lt": existing_point.sequence,
                            },
                        },
                        data={"sequence": {"increment": 1}},
                    )

        # 포인트 업데이트
        updated_point = await prisma.routePoint.update(
            where={"id": point_id},
            data=update_data,
        )

        return create_response(
            data=updated_point,
            message="경로 포인트가 성공적으로 수정되었습니다.",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"경로 포인트 수정 실패: {str(e)}")
        raise server_error_exception(f"경로 포인트 수정 중 오류가 발생했습니다: {str(e)}")


# 경로 포인트 삭제
@router.delete("/points/{point_id}", response_model=ApiResponse)
async def delete_route_point(
    delivery_id: str = Path(..., description="탁송 ID"),
    point_id: str = Path(..., description="포인트 ID"),
    prisma=Depends(get_prisma),
):
    """
    탁송 경로의 포인트를 삭제합니다.
    """
    try:
        # 포인트 존재 확인
        existing_point = await prisma.routePoint.find_unique(
            where={"id": point_id}
        )

        if not existing_point or existing_point.delivery_id != delivery_id:
            raise not_found_exception("경로 포인트", point_id)

        # 삭제할 포인트의 시퀀스 저장
        sequence = existing_point.sequence

        # 포인트 삭제
        await prisma.routePoint.delete(where={"id": point_id})

        # 시퀀스 재정렬
        await prisma.routePoint.update_many(
            where={
                "delivery_id": delivery_id,
                "sequence": {"gt": sequence},
            },
            data={"sequence": {"decrement": 1}},
        )

        return create_response(
            data={"id": point_id},
            message="경로 포인트가 성공적으로 삭제되었습니다.",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"경로 포인트 삭제 실패: {str(e)}")
        raise server_error_exception(f"경로 포인트 삭제 중 오류가 발생했습니다: {str(e)}")


# 경로 최적화
@router.post("/optimize", response_model=ApiResponse)
async def optimize_route(
    delivery_id: str = Path(..., description="탁송 ID"),
    prisma=Depends(get_prisma),
):
    """
    탁송 경로를 최적화합니다. (외부 API 사용)
    """
    try:
        # 탁송 존재 확인
        delivery = await prisma.delivery.find_unique(where={"id": delivery_id})
        if not delivery:
            raise not_found_exception("탁송", delivery_id)

        # 경로 포인트 조회
        route_points = await prisma.routePoint.find_many(
            where={"delivery_id": delivery_id},
            order_by={"sequence": "asc"},
        )

        # 현재는 단순히 최적화 요청만 처리 (실제 구현은 외부 API 연동 필요)
        # TODO: 외부 경로 최적화 API 연동 구현

        return create_response(
            data={
                "delivery_id": delivery_id,
                "optimized": False,
                "message": "경로 최적화 기능이 아직 구현되지 않았습니다.",
                "route_points": route_points,
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"경로 최적화 실패: {str(e)}")
        raise server_error_exception(f"경로 최적화 중 오류가 발생했습니다: {str(e)}")


# 실시간 경로 업데이트
@router.post("/current-location", response_model=ApiResponse)
async def update_current_location(
    delivery_id: str = Path(..., description="탁송 ID"),
    location_data: dict = Body(...),
    prisma=Depends(get_prisma),
):
    """
    탁송의 현재 위치를 업데이트합니다.
    """
    try:
        # 탁송 존재 확인
        delivery = await prisma.delivery.find_unique(where={"id": delivery_id})
        if not delivery:
            raise not_found_exception("탁송", delivery_id)

        # 필수 위치 데이터 확인
        if "latitude" not in location_data or "longitude" not in location_data:
            raise validation_exception("위도(latitude)와 경도(longitude)는 필수 입력 항목입니다.")

        # 위치 업데이트 로그 생성
        location_log = await prisma.locationLog.create(
            data={
                "delivery_id": delivery_id,
                "latitude": location_data["latitude"],
                "longitude": location_data["longitude"],
                "speed": location_data.get("speed"),
                "heading": location_data.get("heading"),
                "accuracy": location_data.get("accuracy"),
                "timestamp": location_data.get("timestamp", datetime.now()),
            }
        )

        # 탁송 현재 위치 업데이트
        await prisma.delivery.update(
            where={"id": delivery_id},
            data={
                "current_latitude": location_data["latitude"],
                "current_longitude": location_data["longitude"],
                "last_location_update": datetime.now(),
            },
        )

        return create_response(
            data=location_log,
            message="현재 위치가 성공적으로 업데이트되었습니다.",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"현재 위치 업데이트 실패: {str(e)}")
        raise server_error_exception(f"현재 위치 업데이트 중 오류가 발생했습니다: {str(e)}")


# 이동 경로 이력 조회
@router.get("/history", response_model=ApiResponse)
async def get_route_history(
    delivery_id: str = Path(..., description="탁송 ID"),
    start_time: Optional[datetime] = Query(None, description="시작 시간"),
    end_time: Optional[datetime] = Query(None, description="종료 시간"),
    limit: int = Query(100, ge=1, le=1000, description="조회할 최대 기록 수"),
    prisma=Depends(get_prisma),
):
    """
    탁송의 이동 경로 이력을 조회합니다.
    """
    try:
        # 탁송 존재 확인
        delivery = await prisma.delivery.find_unique(where={"id": delivery_id})
        if not delivery:
            raise not_found_exception("탁송", delivery_id)

        # 위치 로그 조회 조건
        where = {"delivery_id": delivery_id}
        if start_time or end_time:
            where["timestamp"] = {}
            if start_time:
                where["timestamp"]["gte"] = start_time
            if end_time:
                where["timestamp"]["lte"] = end_time

        # 위치 로그 조회
        location_logs = await prisma.locationLog.find_many(
            where=where,
            order_by={"timestamp": "asc"},
            take=limit,
        )

        return create_response(
            data={
                "delivery_id": delivery_id,
                "start_time": start_time,
                "end_time": end_time,
                "location_count": len(location_logs),
                "locations": location_logs,
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"이동 경로 이력 조회 실패: {str(e)}")
        raise server_error_exception(f"이동 경로 이력 조회 중 오류가 발생했습니다: {str(e)}")
