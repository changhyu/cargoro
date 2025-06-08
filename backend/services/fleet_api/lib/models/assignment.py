from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import date, datetime
from ..models.contract import to_camel


# 차량 할당 모델
class VehicleAssignmentBase(BaseModel):
    vehicle_id: str  # 차량 ID
    driver_id: str  # 운전자 ID
    start_date: date  # 할당 시작일
    end_date: Optional[date] = None  # 할당 종료일 (없으면 무기한)


class VehicleAssignmentCreate(VehicleAssignmentBase):
    assignment_purpose: Optional[str] = None  # 할당 목적
    authorized_uses: Optional[List[str]] = None  # 승인된 사용 목적
    notes: Optional[str] = None  # 메모


class VehicleAssignmentUpdate(BaseModel):
    end_date: Optional[date] = None
    assignment_purpose: Optional[str] = None
    authorized_uses: Optional[List[str]] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class VehicleAssignmentResponse(VehicleAssignmentBase):
    id: str
    assignment_purpose: Optional[str] = None
    authorized_uses: Optional[List[str]] = None
    is_active: bool
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )
