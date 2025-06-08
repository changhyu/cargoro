from fastapi import HTTPException, status
from pydantic import BaseModel
from typing import Any, Dict, Optional

# 알림 공용 응답 모델
class NotificationResponseModel(BaseModel):
    success: bool
    data: Any
    message: Optional[str] = None

# 알림 관련 에러 처리 함수
def notification_not_found_exception(notification_id: str):
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"알림(ID: {notification_id})을 찾을 수 없습니다.")
