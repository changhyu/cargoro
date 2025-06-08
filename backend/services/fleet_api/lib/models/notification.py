# filepath: backend/services/fleet_api/lib/models/notification.py
"""
알림 모델 정의
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum
from ..models.contract import to_camel


class NotificationType(str, Enum):
    LICENSE_EXPIRY = "license_expiry"
    VEHICLE_MAINTENANCE = "vehicle_maintenance"
    PERFORMANCE_REVIEW = "performance_review"
    SAFETY_ALERT = "safety_alert"
    SYSTEM = "system"


class NotificationSeverity(str, Enum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"


class NotificationCreate(BaseModel):
    type: NotificationType = Field(..., description="알림 유형")
    title: str = Field(..., description="제목")
    message: str = Field(..., description="메시지 내용")
    severity: NotificationSeverity = Field(..., description="심각도")
    target_type: Optional[str] = Field(None, description="대상 타입 (driver, vehicle, system 등)")
    target_id: Optional[str] = Field(None, description="대상 ID")


class NotificationResponse(BaseModel):
    id: str
    type: NotificationType
    title: str
    message: str
    severity: NotificationSeverity
    is_read: bool = Field(..., alias="is_read")
    target_type: Optional[str]
    target_id: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )
