"""수리 관련 공유 모델"""

from enum import Enum
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class RepairStatus(str, Enum):
    """수리 상태 열거형"""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    ON_HOLD = "on_hold"


class RepairPriority(str, Enum):
    """수리 우선순위 열거형"""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class RepairJob(BaseModel):
    """수리 작업 모델"""

    id: Optional[str] = None
    vehicle_id: str = Field(..., description="차량 ID")
    workshop_id: str = Field(..., description="정비소 ID")
    customer_id: str = Field(..., description="고객 ID")

    title: str = Field(..., description="수리 제목")
    description: Optional[str] = Field(None, description="수리 설명")

    status: RepairStatus = Field(default=RepairStatus.PENDING, description="수리 상태")
    priority: RepairPriority = Field(
        default=RepairPriority.MEDIUM, description="우선순위"
    )

    estimated_cost: Optional[float] = Field(None, description="예상 비용")
    actual_cost: Optional[float] = Field(None, description="실제 비용")

    estimated_duration_hours: Optional[int] = Field(
        None, description="예상 소요 시간(시간)"
    )
    actual_duration_hours: Optional[int] = Field(
        None, description="실제 소요 시간(시간)"
    )

    scheduled_start: Optional[datetime] = Field(None, description="예정 시작 시간")
    scheduled_end: Optional[datetime] = Field(None, description="예정 완료 시간")
    actual_start: Optional[datetime] = Field(None, description="실제 시작 시간")
    actual_end: Optional[datetime] = Field(None, description="실제 완료 시간")

    parts_needed: Optional[List[str]] = Field(
        default_factory=list, description="필요한 부품 목록"
    )
    labor_notes: Optional[str] = Field(None, description="작업 메모")

    assigned_technician_id: Optional[str] = Field(None, description="담당 기술자 ID")

    created_at: Optional[datetime] = Field(None, description="생성 시간")
    updated_at: Optional[datetime] = Field(None, description="수정 시간")

    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="추가 메타데이터"
    )

    class Config:
        use_enum_values = True
        json_encoders = {datetime: lambda v: v.isoformat() if v else None}


class RepairJobCreate(BaseModel):
    """수리 작업 생성 모델"""

    vehicle_id: str
    workshop_id: str
    customer_id: str
    title: str
    description: Optional[str] = None
    priority: RepairPriority = RepairPriority.MEDIUM
    estimated_cost: Optional[float] = None
    estimated_duration_hours: Optional[int] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    parts_needed: Optional[List[str]] = None
    assigned_technician_id: Optional[str] = None


class RepairJobUpdate(BaseModel):
    """수리 작업 업데이트 모델"""

    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[RepairStatus] = None
    priority: Optional[RepairPriority] = None
    estimated_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    estimated_duration_hours: Optional[int] = None
    actual_duration_hours: Optional[int] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    parts_needed: Optional[List[str]] = None
    labor_notes: Optional[str] = None
    assigned_technician_id: Optional[str] = None


class RepairJobResponse(RepairJob):
    """수리 작업 응답 모델"""

    id: str
    created_at: datetime
    updated_at: datetime
