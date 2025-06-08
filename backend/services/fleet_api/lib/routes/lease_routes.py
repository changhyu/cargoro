"""
리스/렌탈 계약 조회 라우터
"""
from fastapi import APIRouter, Depends, Query, HTTPException, status, Path, Body
from typing import List, Optional
from datetime import date
from prisma import Prisma

from ..models.contract import ContractResponse, ContractType, ContractStatus
from ..models.notification import NotificationCreate, NotificationResponse, NotificationType, NotificationSeverity
from ..utils.response_utils import (
    ApiResponse,
    create_response,
    not_found_exception,
    server_error_exception,
    unauthorized_exception
)

router = APIRouter(
    prefix="/leases",
    tags=["leases"],
)

@router.get("", response_model=ApiResponse[List[ContractResponse]])
async def get_leases(
    type: Optional[ContractType] = Query(None, alias="type"),
    status: Optional[ContractStatus] = Query(None),
    vehicle_id: Optional[str] = Query(None, alias="vehicleId"),
    client_id: Optional[str] = Query(None, alias="clientId"),
    start_date: Optional[date] = Query(None, alias="startDate"),
    end_date: Optional[date] = Query(None, alias="endDate"),
    prisma: Prisma = Depends(),
):
    """리스/렌탈 계약 목록 조회"""
    try:
        # 기본 필터: 리스 또는 렌탈 타입
        where: dict = {"contract_type": {"in": [ContractType.LEASE, ContractType.RENTAL]}}
        if type:
            where["contract_type"] = type
        if status:
            where["status"] = status
        if vehicle_id:
            where["vehicle_id"] = vehicle_id
        if client_id:
            where["organization_id"] = client_id
        if start_date:
            where.setdefault("start_date", {})["gte"] = start_date
        if end_date:
            where.setdefault("end_date", {})["lte"] = end_date

        # 조직명(client_name) 매핑을 위해 organization 포함
        contracts = await prisma.contract.find_many(where=where, include={"organization": True})
        results: List[ContractResponse] = []
        for c in contracts:
            resp = ContractResponse.model_validate(c)
            # organization 객체에서 이름 필드 추출
            resp.client_name = c.organization.name if c.organization else None
            results.append(resp)

        return create_response(
            data=results,
            message="리스/렌탈 계약 목록이 성공적으로 조회되었습니다."
        )
    except Exception as e:
        raise server_error_exception(f"계약 목록 조회 중 오류가 발생했습니다: {str(e)}")

# 알림 목록 조회
@router.get("/notifications", response_model=ApiResponse[List[NotificationResponse]])
async def get_notifications(
    target_type: Optional[str] = Query(None),
    target_id: Optional[str] = Query(None),
    type: Optional[NotificationType] = Query(None),
    is_read: Optional[bool] = Query(None),
    severity: Optional[NotificationSeverity] = Query(None),
    page: int = Query(1),
    page_size: int = Query(20),
    prisma: Prisma = Depends(),
):
    try:
        where = {}
        if target_type:
            where["target_type"] = target_type
        if target_id:
            where["target_id"] = target_id
        if type:
            where["type"] = type
        if severity:
            where["severity"] = severity
        if is_read is not None:
            where["is_read"] = is_read

        # 총 항목 수 조회
        total_items = await prisma.notification.count(where=where)
        total_pages = (total_items + page_size - 1) // page_size

        notifications = await prisma.notification.find_many(
            where=where,
            skip=(page-1)*page_size,
            take=page_size
        )

        response_items = [NotificationResponse.model_validate(n) for n in notifications]

        return create_response(
            data=response_items,
            message="알림 목록이 성공적으로 조회되었습니다.",
            page=page,
            per_page=page_size,
            total_items=total_items,
            total_pages=total_pages
        )
    except Exception as e:
        raise server_error_exception(f"알림 목록 조회 중 오류가 발생했습니다: {str(e)}")

# 특정 알림 조회
@router.get("/notifications/{notification_id}", response_model=ApiResponse[NotificationResponse])
async def get_notification_by_id(
    notification_id: str = Path(...),
    prisma: Prisma = Depends(),
):
    try:
        notification = await prisma.notification.find_unique(where={"id": notification_id})
        if not notification:
            raise not_found_exception("알림", notification_id)

        response_data = NotificationResponse.model_validate(notification)

        return create_response(
            data=response_data,
            message="알림이 성공적으로 조회되었습니다."
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise server_error_exception(f"알림 조회 중 오류가 발생했습니다: {str(e)}")

# 알림 생성
@router.post("/notifications", response_model=ApiResponse[NotificationResponse], status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification: NotificationCreate,
    prisma: Prisma = Depends(),
):
    try:
        new_notification = await prisma.notification.create(data=notification.model_dump())
        response_data = NotificationResponse.model_validate(new_notification)

        return create_response(
            data=response_data,
            message="알림이 성공적으로 생성되었습니다."
        )
    except Exception as e:
        raise server_error_exception(f"알림 생성 중 오류가 발생했습니다: {str(e)}")

# 알림 읽음 처리
@router.patch("/notifications/{notification_id}/read", response_model=ApiResponse[NotificationResponse])
async def mark_as_read(
    notification_id: str = Path(...),
    prisma: Prisma = Depends(),
):
    try:
        notification = await prisma.notification.find_unique(where={"id": notification_id})
        if not notification:
            raise not_found_exception("알림", notification_id)

        updated_notification = await prisma.notification.update(
            where={"id": notification_id}, data={"is_read": True}
        )

        response_data = NotificationResponse.model_validate(updated_notification)

        return create_response(
            data=response_data,
            message="알림이 읽음으로 표시되었습니다."
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise server_error_exception(f"알림 상태 업데이트 중 오류가 발생했습니다: {str(e)}")

# 모든 알림 읽음 처리
@router.post("/notifications/mark-all-read", response_model=ApiResponse[List[NotificationResponse]])
async def mark_all_as_read(
    target_id: Optional[str] = Body(None),
    prisma: Prisma = Depends(),
):
    try:
        where = {"is_read": False}
        if target_id:
            where["target_id"] = target_id

        updated = await prisma.notification.update_many(where=where, data={"is_read": True})

        # update_many는 count 반환하므로 읽어온 후 다시 조회
        notifications = await prisma.notification.find_many(
            where={"is_read": True, **({"target_id": target_id} if target_id else {})}
        )

        response_items = [NotificationResponse.model_validate(n) for n in notifications]

        return create_response(
            data=response_items,
            message=f"{updated.count}개의 알림이 읽음으로 표시되었습니다."
        )
    except Exception as e:
        raise server_error_exception(f"알림 일괄 업데이트 중 오류가 발생했습니다: {str(e)}")

# 알림 삭제
@router.delete("/notifications/{notification_id}", response_model=ApiResponse)
async def delete_notification(
    notification_id: str = Path(...),
    prisma: Prisma = Depends(),
):
    try:
        notification = await prisma.notification.find_unique(where={"id": notification_id})
        if not notification:
            raise not_found_exception("알림", notification_id)

        deleted = await prisma.notification.delete(where={"id": notification_id})

        return create_response(
            data={"id": deleted.id},
            message="알림이 성공적으로 삭제되었습니다"
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise server_error_exception(f"알림 삭제 중 오류가 발생했습니다: {str(e)}")

# 읽지 않은 알림 수 조회
@router.get("/notifications/unread-count", response_model=ApiResponse)
async def get_unread_count(
    target_id: Optional[str] = Query(None),
    prisma: Prisma = Depends(),
):
    try:
        where = {"is_read": False}
        if target_id:
            where["target_id"] = target_id

        count = await prisma.notification.count(where=where)

        return create_response(
            data={"count": count},
            message="읽지 않은 알림 수가 성공적으로 조회되었습니다."
        )
    except Exception as e:
        raise server_error_exception(f"읽지 않은 알림 수 조회 중 오류가 발생했습니다: {str(e)}")
