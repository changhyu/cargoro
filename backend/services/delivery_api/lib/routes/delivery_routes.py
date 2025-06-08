from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body
from typing import List, Optional
from datetime import datetime, date
from ..database import get_prisma
from ..models import (
    DeliveryCreate,
    DeliveryUpdate,
    DeliveryResponse,
    DeliveryStatus,
    DeliveryType,
    PriorityLevel,
    DeliveryLogCreate,
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
    prefix="/deliveries",
    tags=["deliveries"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger("delivery-api:deliveries")

# 리소스 타입 상수
RESOURCE_TYPE = "탁송"


# 탁송 생성
@router.post("/", response_model=ApiResponse, status_code=201)
async def create_delivery(delivery: DeliveryCreate, prisma=Depends(get_prisma)):
    try:
        # 차량 존재 확인 (필요시 차량 API 호출)
        # vehicle = await check_vehicle_exists(delivery.vehicle_id)

        # 탁송 생성
        new_delivery = await prisma.delivery.create(
            data={
                "vehicle_id": delivery.vehicle_id,
                "delivery_type": delivery.delivery_type,
                "origin_location": delivery.origin_location,
                "destination_location": delivery.destination_location,
                "scheduled_date": delivery.scheduled_date,
                "scheduled_time": delivery.scheduled_time,
                "customer_id": delivery.customer_id,
                "contact_person": delivery.contact_person,
                "contact_phone": delivery.contact_phone,
                "priority": delivery.priority,
                "notes": delivery.notes,
                "estimated_distance": delivery.estimated_distance,
                "estimated_duration": delivery.estimated_duration,
                "status": DeliveryStatus.PENDING,
                "issues": [],
            }
        )

        # 탁송 로그 생성
        delivery_id = (
            new_delivery.get("id")
            if isinstance(new_delivery, dict)
            else new_delivery.id
        )
        await prisma.delivery_log.create(
            data={
                "delivery_id": delivery_id,
                "status": DeliveryStatus.PENDING,
                "logged_by": "system",  # 나중에 인증된 사용자로 변경
                "details": "탁송이 생성되었습니다.",
                "timestamp": datetime.now(),
            }
        )

        return create_response(data=DeliveryResponse.parse_obj(new_delivery))
    except Exception as e:
        logger.error(f"탁송 생성 실패: {str(e)}")
        raise server_error_exception(f"탁송 생성 중 오류가 발생했습니다: {str(e)}")


# 모든 탁송 조회
@router.get("/", response_model=ApiResponse)
async def get_all_deliveries(
    vehicle_id: Optional[str] = None,
    delivery_type: Optional[DeliveryType] = None,
    status: Optional[DeliveryStatus] = None,
    driver_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    priority: Optional[PriorityLevel] = None,
    page: int = Query(1, ge=1),  # skip 대신 page 사용
    per_page: int = Query(100, ge=1, le=100),  # limit 대신 per_page 사용
    prisma=Depends(get_prisma),
):
    try:
        # 페이지 검증
        if page < 1:
            raise validation_exception({"page": "페이지는 1 이상이어야 합니다."})

        # skip/limit 계산
        skip = (page - 1) * per_page
        limit = per_page

        # 필터 조건 구성
        where = {}

        if vehicle_id:
            where["vehicle_id"] = vehicle_id

        if delivery_type:
            where["delivery_type"] = delivery_type

        if status:
            where["status"] = status

        if driver_id:
            where["driver_id"] = driver_id

        if start_date:
            where["scheduled_date"] = {"gte": start_date}

        if end_date:
            if "scheduled_date" in where:
                where["scheduled_date"]["lte"] = end_date
            else:
                where["scheduled_date"] = {"lte": end_date}

        if priority:
            where["priority"] = priority

        # 총 개수 조회
        total_items = await prisma.delivery.count(where=where)
        total_pages = (total_items + limit - 1) // limit if limit > 0 else 0

        # 데이터 조회
        deliveries = await prisma.delivery.find_many(
            where=where, skip=skip, take=limit, order={"scheduled_date": "asc"}
        )

        # 응답 객체로 변환
        delivery_responses = [
            DeliveryResponse.parse_obj(delivery) for delivery in deliveries
        ]

        return create_response(
            data=delivery_responses,
            page=page,
            per_page=per_page,
            total_items=total_items,
            total_pages=total_pages,
        )
    except Exception as e:
        logger.error(f"탁송 조회 실패: {str(e)}")
        raise server_error_exception(f"탁송 조회 중 오류가 발생했습니다: {str(e)}")


# 탁송 통계 조회 (특정 ID 패턴보다 먼저 배치)
@router.get("/statistics", response_model=ApiResponse[dict])
async def get_delivery_statistics(
    prisma=Depends(get_prisma),
):
    """탁송 통계를 조회합니다."""
    try:
        # 전체 탁송 수
        total_deliveries = await prisma.delivery.count()

        # 상태별 탁송 수
        pending_deliveries = await prisma.delivery.count(where={"status": "pending"})
        in_transit_deliveries = await prisma.delivery.count(
            where={"status": "in_transit"}
        )
        completed_deliveries = await prisma.delivery.count(
            where={"status": "completed"}
        )
        failed_deliveries = await prisma.delivery.count(where={"status": "failed"})
        cancelled_deliveries = await prisma.delivery.count(
            where={"status": "cancelled"}
        )

        statistics = {
            "total_deliveries": total_deliveries,
            "pending_deliveries": pending_deliveries,
            "in_progress_deliveries": in_transit_deliveries,  # 테스트에서 in_progress_deliveries 필드를 기대함
            "completed_deliveries": completed_deliveries,
            "failed_deliveries": failed_deliveries,
            "cancelled_deliveries": cancelled_deliveries,
        }

        return create_response(data=statistics)
    except Exception as e:
        logger.error(f"탁송 통계 조회 실패: {str(e)}")
        raise server_error_exception(f"탁송 통계 조회 중 오류가 발생했습니다: {str(e)}")


# 특정 탁송 조회
@router.get("/{delivery_id}", response_model=ApiResponse)
async def get_delivery(
    delivery_id: str = Path(..., description="조회할 탁송의 ID"),
    prisma=Depends(get_prisma),
):
    try:
        delivery = await prisma.delivery.find_unique(where={"id": delivery_id})

        if not delivery:
            raise not_found_exception(RESOURCE_TYPE, delivery_id)

        return create_response(data=DeliveryResponse.parse_obj(delivery))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"탁송 조회 실패: {str(e)}")
        raise server_error_exception(f"탁송 조회 중 오류가 발생했습니다: {str(e)}")


# 탁송 업데이트
@router.patch("/{delivery_id}", response_model=ApiResponse)
async def update_delivery(
    delivery_update: DeliveryUpdate,
    delivery_id: str = Path(..., description="수정할 탁송의 ID"),
    prisma=Depends(get_prisma),
):
    try:
        # 기존 탁송 확인
        existing_delivery = await prisma.delivery.find_unique(where={"id": delivery_id})

        if not existing_delivery:
            raise not_found_exception(RESOURCE_TYPE, delivery_id)

        # 필드 업데이트
        update_data = delivery_update.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.now()

        # 상태 변경 확인
        status_changed = False
        new_status = None
        if (
            "status" in update_data
            and update_data["status"] != existing_delivery.status
        ):
            status_changed = True
            new_status = update_data["status"]

        # 탁송 업데이트
        updated_delivery = await prisma.delivery.update(
            where={"id": delivery_id}, data=update_data
        )

        # 상태 변경 시 로그 기록
        if status_changed and new_status:
            status_messages = {
                DeliveryStatus.PENDING: "탁송이 대기 상태로 설정되었습니다.",
                DeliveryStatus.ASSIGNED: "탁송이 기사에게 할당되었습니다.",
                DeliveryStatus.IN_TRANSIT: "탁송이 이동 중입니다.",
                DeliveryStatus.COMPLETED: "탁송이 완료되었습니다.",
                DeliveryStatus.FAILED: "탁송이 실패했습니다.",
                DeliveryStatus.CANCELLED: "탁송이 취소되었습니다.",
            }

            await prisma.delivery_log.create(
                data={
                    "delivery_id": delivery_id,
                    "status": new_status,
                    "logged_by": "system",  # 나중에 인증된 사용자로 변경
                    "details": status_messages.get(
                        new_status, f"상태가 {new_status}로 변경되었습니다."
                    ),
                    "timestamp": datetime.now(),
                }
            )

        return create_response(data=DeliveryResponse.parse_obj(updated_delivery))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"탁송 업데이트 실패: {str(e)}")
        raise server_error_exception(f"탁송 업데이트 중 오류가 발생했습니다: {str(e)}")


# 탁송 상태 변경
@router.patch("/{delivery_id}/status", response_model=ApiResponse)
async def update_delivery_status(
    delivery_id: str = Path(..., description="상태를 변경할 탁송의 ID"),
    status_data: dict = Body(..., description="변경할 상태 정보"),
    prisma=Depends(get_prisma),
):
    try:
        # status_data에서 상태 정보 추출
        status = status_data.get("status")
        details = status_data.get("details")
        location = status_data.get("location")

        if not status:
            raise validation_exception({"status": "상태는 필수 항목입니다."})

        # 기존 탁송 확인
        existing_delivery = await prisma.delivery.find_unique(where={"id": delivery_id})

        if not existing_delivery:
            raise not_found_exception(RESOURCE_TYPE, delivery_id)

        # 상태 전환 유효성 검사
        current_status = existing_delivery.get("status")

        # 완료된 탁송은 다른 상태로 변경할 수 없음
        if current_status == "completed" and status != "completed":
            raise bad_request_exception(
                "완료된 탁송의 상태는 변경할 수 없습니다.",
                {"status": "완료된 탁송의 상태는 변경할 수 없습니다."},
            )

        # 취소된 탁송은 다른 상태로 변경할 수 없음
        if current_status == "cancelled" and status != "cancelled":
            raise bad_request_exception(
                "취소된 탁송의 상태는 변경할 수 없습니다.",
                {"status": "취소된 탁송의 상태는 변경할 수 없습니다."},
            )

        # 상태별 추가 로직
        update_data = {"status": status, "updated_at": datetime.now()}

        if status == DeliveryStatus.ASSIGNED and not existing_delivery.get("driver_id"):
            raise validation_exception(
                {"driver_id": "할당 상태로 변경하기 전에 기사를 지정해야 합니다."}
            )

        if status == DeliveryStatus.IN_TRANSIT:
            update_data["actual_pickup_time"] = datetime.now()

        if status == DeliveryStatus.COMPLETED:
            update_data["actual_delivery_time"] = datetime.now()

        # 탁송 업데이트
        updated_delivery = await prisma.delivery.update(
            where={"id": delivery_id}, data=update_data
        )

        # 로그 기록
        driver_id = (
            updated_delivery.get("driver_id")
            if isinstance(updated_delivery, dict)
            else updated_delivery.driver_id
        )
        status_messages = {
            DeliveryStatus.PENDING: "탁송이 대기 상태로 설정되었습니다.",
            DeliveryStatus.ASSIGNED: f"탁송이 기사 ID: {driver_id}에게 할당되었습니다.",
            DeliveryStatus.IN_TRANSIT: "탁송이 이동 중입니다.",
            DeliveryStatus.COMPLETED: "탁송이 완료되었습니다.",
            DeliveryStatus.FAILED: "탁송이 실패했습니다.",
            DeliveryStatus.CANCELLED: "탁송이 취소되었습니다.",
        }

        log_details = (
            details
            if details
            else status_messages.get(status, f"상태가 {status}로 변경되었습니다.")
        )

        await prisma.delivery_log.create(
            data={
                "delivery_id": delivery_id,
                "status": status,
                "logged_by": "system",  # 나중에 인증된 사용자로 변경
                "details": log_details,
                "location": location,
                "timestamp": datetime.now(),
            }
        )

        return create_response(data=DeliveryResponse.parse_obj(updated_delivery))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"탁송 상태 변경 실패: {str(e)}")
        raise server_error_exception(f"탁송 상태 변경 중 오류가 발생했습니다: {str(e)}")


# 기사 배정
@router.patch("/{delivery_id}/assign", response_model=ApiResponse)
async def assign_driver(
    delivery_id: str = Path(..., description="기사를 배정할 탁송의 ID"),
    driver_id: str = Query(..., description="배정할 기사의 ID"),
    prisma=Depends(get_prisma),
):
    try:
        # 기존 탁송 확인
        existing_delivery = await prisma.delivery.find_unique(where={"id": delivery_id})

        if not existing_delivery:
            raise not_found_exception(RESOURCE_TYPE, delivery_id)

        # 기사 확인 (필요시 기사 API 호출)
        # driver = await check_driver_exists(driver_id)

        # 기사 배정
        updated_delivery = await prisma.delivery.update(
            where={"id": delivery_id},
            data={
                "driver_id": driver_id,
                "status": DeliveryStatus.ASSIGNED,
                "updated_at": datetime.now(),
            },
        )

        # 로그 기록
        await prisma.delivery_log.create(
            data={
                "delivery_id": delivery_id,
                "status": DeliveryStatus.ASSIGNED,
                "logged_by": "system",  # 나중에 인증된 사용자로 변경
                "details": f"기사 ID: {driver_id}가 배정되었습니다.",
                "timestamp": datetime.now(),
            }
        )

        return create_response(data=DeliveryResponse.parse_obj(updated_delivery))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"기사 배정 실패: {str(e)}")
        raise server_error_exception(f"기사 배정 중 오류가 발생했습니다: {str(e)}")


# 탁송 취소
@router.patch("/{delivery_id}/cancel", response_model=ApiResponse)
async def cancel_delivery(
    delivery_id: str = Path(..., description="취소할 탁송의 ID"),
    reason: str = Query(..., description="취소 사유"),
    prisma=Depends(get_prisma),
):
    try:
        # 기존 탁송 확인
        existing_delivery = await prisma.delivery.find_unique(where={"id": delivery_id})

        if not existing_delivery:
            raise not_found_exception(RESOURCE_TYPE, delivery_id)

        # 완료된 탁송은 취소 불가
        if existing_delivery.status == DeliveryStatus.COMPLETED:
            raise validation_exception(
                {"status": "이미 완료된 탁송은 취소할 수 없습니다."}
            )

        # 탁송 취소
        cancelled_delivery = await prisma.delivery.update(
            where={"id": delivery_id},
            data={"status": DeliveryStatus.CANCELLED, "updated_at": datetime.now()},
        )

        # 로그 기록
        await prisma.delivery_log.create(
            data={
                "delivery_id": delivery_id,
                "status": DeliveryStatus.CANCELLED,
                "logged_by": "system",  # 나중에 인증된 사용자로 변경
                "details": f"취소 사유: {reason}",
                "timestamp": datetime.now(),
            }
        )

        return create_response(data=DeliveryResponse.parse_obj(cancelled_delivery))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"탁송 취소 실패: {str(e)}")
        raise server_error_exception(f"탁송 취소 중 오류가 발생했습니다: {str(e)}")


# 탁송 완료
@router.patch("/{delivery_id}/complete", response_model=ApiResponse)
async def complete_delivery(
    delivery_id: str = Path(..., description="완료할 탁송의 ID"),
    completed_by: str = Query(..., description="완료 처리자 ID"),
    customer_signature: Optional[str] = None,
    location: Optional[str] = None,
    prisma=Depends(get_prisma),
):
    try:
        # 기존 탁송 확인
        existing_delivery = await prisma.delivery.find_unique(where={"id": delivery_id})

        if not existing_delivery:
            raise not_found_exception(RESOURCE_TYPE, delivery_id)

        # 이미 완료 또는 취소된 탁송은 처리 불가
        if existing_delivery.status in [
            DeliveryStatus.COMPLETED,
            DeliveryStatus.CANCELLED,
        ]:
            raise validation_exception(
                {"status": f"이미 {existing_delivery.status} 상태인 탁송입니다."}
            )

        # 탁송 완료
        completed_delivery = await prisma.delivery.update(
            where={"id": delivery_id},
            data={
                "status": DeliveryStatus.COMPLETED,
                "completed_by": completed_by,
                "customer_signature": customer_signature,
                "actual_delivery_time": datetime.now(),
                "updated_at": datetime.now(),
            },
        )

        # 로그 기록
        await prisma.delivery_log.create(
            data={
                "delivery_id": delivery_id,
                "status": DeliveryStatus.COMPLETED,
                "logged_by": completed_by,
                "details": "탁송이 완료되었습니다.",
                "location": location,
                "timestamp": datetime.now(),
            }
        )

        return create_response(data=DeliveryResponse.parse_obj(completed_delivery))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"탁송 완료 처리 실패: {str(e)}")
        raise server_error_exception(f"탁송 완료 처리 중 오류가 발생했습니다: {str(e)}")


# 탁송 이력 조회
@router.get("/{delivery_id}/logs", response_model=ApiResponse)
async def get_delivery_logs(
    delivery_id: str = Path(..., description="조회할 탁송의 ID"),
    prisma=Depends(get_prisma),
):
    try:
        # 탁송 존재 확인
        delivery = await prisma.delivery.find_unique(where={"id": delivery_id})

        if not delivery:
            raise not_found_exception(RESOURCE_TYPE, delivery_id)

        # 로그 조회
        logs = await prisma.delivery_log.find_many(
            where={"delivery_id": delivery_id}, order={"timestamp": "desc"}
        )

        return create_response(data=logs)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"탁송 이력 조회 실패: {str(e)}")
        raise server_error_exception(f"탁송 이력 조회 중 오류가 발생했습니다: {str(e)}")


# 기사별 탁송 목록 조회
@router.get("/by-driver/{driver_id}", response_model=ApiResponse)
async def get_driver_deliveries(
    driver_id: str = Path(..., description="조회할 기사의 ID"),
    status: Optional[DeliveryStatus] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    prisma=Depends(get_prisma),
):
    try:
        # 필터 조건 구성
        where = {"driver_id": driver_id}

        if status:
            where["status"] = status

        if start_date:
            where["scheduled_date"] = {"gte": start_date}

        if end_date:
            if "scheduled_date" in where:
                where["scheduled_date"]["lte"] = end_date
            else:
                where["scheduled_date"] = {"lte": end_date}

        # 총 개수 조회
        total_items = await prisma.delivery.count(where=where)
        total_pages = (total_items + limit - 1) // limit if limit > 0 else 0

        # 데이터 조회
        deliveries = await prisma.delivery.find_many(
            where=where, order={"scheduled_date": "asc"}, skip=skip, take=limit
        )

        # 응답 객체로 변환
        delivery_responses = [
            DeliveryResponse.parse_obj(delivery) for delivery in deliveries
        ]

        return create_response(
            data=delivery_responses,
            page=skip // limit + 1,
            per_page=limit,
            total_items=total_items,
            total_pages=total_pages,
        )
    except Exception as e:
        logger.error(f"기사별 탁송 목록 조회 실패: {str(e)}")
        raise server_error_exception(
            f"기사별 탁송 목록 조회 중 오류가 발생했습니다: {str(e)}"
        )


@router.put("/{delivery_id}", response_model=ApiResponse[DeliveryResponse])
async def update_delivery(
    delivery_id: str = Path(..., description="수정할 탁송의 ID"),
    delivery_data: DeliveryUpdate = Body(..., description="수정할 탁송 데이터"),
    prisma=Depends(get_prisma),
):
    """탁송 정보를 업데이트합니다."""
    try:
        # 기존 탁송 존재 확인
        existing_delivery = await prisma.delivery.find_unique(where={"id": delivery_id})
        if not existing_delivery:
            raise not_found_exception(RESOURCE_TYPE, delivery_id)

        # 데이터 업데이트
        update_data = delivery_data.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.now()

        updated_delivery = await prisma.delivery.update(
            where={"id": delivery_id}, data=update_data
        )

        # 로그 기록
        await prisma.delivery_log.create(
            data={
                "delivery_id": delivery_id,
                "action": "UPDATE",
                "details": "탁송 정보가 업데이트되었습니다.",
                "logged_by": "system",
                "timestamp": datetime.now(),
            }
        )

        return create_response(data=DeliveryResponse.parse_obj(updated_delivery))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"탁송 업데이트 실패: {str(e)}")
        raise server_error_exception(f"탁송 업데이트 중 오류가 발생했습니다: {str(e)}")


@router.delete("/{delivery_id}", response_model=ApiResponse[dict])
async def delete_delivery(
    delivery_id: str = Path(..., description="삭제할 탁송의 ID"),
    prisma=Depends(get_prisma),
):
    """탁송을 삭제합니다."""
    try:
        # 기존 탁송 존재 확인
        existing_delivery = await prisma.delivery.find_unique(where={"id": delivery_id})
        if not existing_delivery:
            raise not_found_exception(RESOURCE_TYPE, delivery_id)

        # 탁송 삭제
        deleted_delivery = await prisma.delivery.delete(where={"id": delivery_id})

        # 로그 기록
        await prisma.delivery_log.create(
            data={
                "delivery_id": delivery_id,
                "action": "DELETE",
                "details": "탁송이 삭제되었습니다.",
                "logged_by": "system",
                "timestamp": datetime.now(),
            }
        )

        return create_response(data={"message": "탁송이 성공적으로 삭제되었습니다."})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"탁송 삭제 실패: {str(e)}")
        raise server_error_exception(f"탁송 삭제 중 오류가 발생했습니다: {str(e)}")
