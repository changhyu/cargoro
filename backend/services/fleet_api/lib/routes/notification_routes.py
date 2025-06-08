# filepath: backend/services/fleet_api/lib/routes/notification_routes.py
"""
알림(Notifications) 관리 라우터
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, Body
from typing import List, Optional
from prisma import Prisma
from ..models.notification import NotificationCreate, NotificationResponse
from ..utils.response_utils import create_response, not_found_exception, server_error_exception

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
    responses={404: {"description": "Not found"}},
)

# 알림 목록 조회
@router.get("", response_model=List[NotificationResponse])
async def get_notifications(
    target_type: Optional[str] = Query(None),
    target_id: Optional[str] = Query(None),
    type: Optional[str] = Query(None),  # will map to field 'type'
    is_read: Optional[bool] = Query(None),
    severity: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    prisma: Prisma = Depends(),
):
    try:
        where: dict = {}
        if target_type:
            where['target_type'] = target_type
        if target_id:
            where['target_id'] = target_id
        if type:
            where['type'] = type
        if severity:
            where['severity'] = severity
        if is_read is not None:
            where['is_read'] = is_read

        skip = (page - 1) * page_size
        items = await prisma.notification.find_many(where=where, skip=skip, take=page_size)
        return [NotificationResponse.model_validate(item) for item in items]
    except Exception as e:
        raise server_error_exception(f"알림 목록 조회 중 오류가 발생했습니다: {str(e)}")

# 특정 알림 조회
@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: str = Path(...),
    prisma: Prisma = Depends(),
):
    notification = await prisma.notification.find_unique(where={"id": notification_id})
    if not notification:
        raise not_found_exception("Notification", notification_id)
    return NotificationResponse.model_validate(notification)

# 알림 생성
@router.post("", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification: NotificationCreate,
    prisma: Prisma = Depends(),
):
    try:
        new_notif = await prisma.notification.create(data=notification.model_dump())
        return NotificationResponse.model_validate(new_notif)
    except Exception as e:
        raise server_error_exception(f"알림 생성 중 오류가 발생했습니다: {str(e)}")

# 알림 읽음 처리
@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def mark_as_read(
    notification_id: str = Path(...),
    prisma: Prisma = Depends(),
):
    notif = await prisma.notification.find_unique(where={"id": notification_id})
    if not notif:
        raise not_found_exception("Notification", notification_id)
    updated = await prisma.notification.update(
        where={"id": notification_id}, data={"is_read": True}
    )
    return NotificationResponse.model_validate(updated)

# 모든 알림 읽음 처리
@router.post("/mark-all-read", response_model=List[NotificationResponse])
async def mark_all_as_read(
    target_id: Optional[str] = Body(None),
    prisma: Prisma = Depends(),
):
    try:
        where: dict = {"is_read": False}
        if target_id:
            where['target_id'] = target_id
        await prisma.notification.update_many(where=where, data={"is_read": True})
        items = await prisma.notification.find_many(where={"is_read": True, **({"target_id": target_id} if target_id else {})})
        return [NotificationResponse.model_validate(item) for item in items]
    except Exception as e:
        raise server_error_exception(f"알림 일괄 읽음 처리 중 오류가 발생했습니다: {str(e)}")

# 알림 삭제
@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: str = Path(...),
    prisma: Prisma = Depends(),
):
    notif = await prisma.notification.find_unique(where={"id": notification_id})
    if not notif:
        raise not_found_exception("Notification", notification_id)
    await prisma.notification.delete(where={"id": notification_id})
    return None

# 읽지 않은 알림 수 조회
@router.get("/unread-count")
async def get_unread_count(
    target_id: Optional[str] = Query(None),
    prisma: Prisma = Depends(),
):
    where: dict = {"is_read": False}
    if target_id:
        where['target_id'] = target_id
    count = await prisma.notification.count(where=where)
    return {"count": count}
