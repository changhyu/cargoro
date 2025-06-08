"""
정비 서비스 스키마 정의

정비 관련 Pydantic 모델들을 정의합니다.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class RepairStatus(str, Enum):
    """정비 상태"""
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    DELAYED = "DELAYED"


class RepairPriority(str, Enum):
    """정비 우선순위"""
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    URGENT = "URGENT"


class RepairJobCreate(BaseModel):
    """정비 작업 생성 스키마"""
    vehicle_id: str = Field(..., description="차량 ID")
    workshop_id: str = Field(..., description="정비소 ID")
    customer_id: str = Field(..., description="고객 ID")
    description: str = Field(..., description="정비 내용")
    priority: RepairPriority = Field(default=RepairPriority.NORMAL, description="우선순위")
    estimated_hours: Optional[float] = Field(None, description="예상 작업 시간")
    estimated_cost: Optional[float] = Field(None, description="예상 비용")
    scheduled_date: Optional[datetime] = Field(None, description="예약 일시")


class RepairJobUpdate(BaseModel):
    """정비 작업 업데이트 스키마"""
    description: Optional[str] = Field(None, description="정비 내용")
    status: Optional[RepairStatus] = Field(None, description="정비 상태")
    priority: Optional[RepairPriority] = Field(None, description="우선순위")
    estimated_hours: Optional[float] = Field(None, description="예상 작업 시간")
    estimated_cost: Optional[float] = Field(None, description="예상 비용")
    actual_hours: Optional[float] = Field(None, description="실제 작업 시간")
    actual_cost: Optional[float] = Field(None, description="실제 비용")
    scheduled_date: Optional[datetime] = Field(None, description="예약 일시")
    completion_date: Optional[datetime] = Field(None, description="완료 일시")


class RepairJobResponse(BaseModel):
    """정비 작업 응답 스키마"""
    repair_id: str = Field(..., description="정비 작업 ID")
    vehicle_id: str = Field(..., description="차량 ID")
    workshop_id: str = Field(..., description="정비소 ID")
    customer_id: str = Field(..., description="고객 ID")
    status: RepairStatus = Field(..., description="정비 상태")
    priority: RepairPriority = Field(..., description="우선순위")
    description: str = Field(..., description="정비 내용")
    estimated_hours: Optional[float] = Field(None, description="예상 작업 시간")
    estimated_cost: Optional[float] = Field(None, description="예상 비용")
    actual_hours: Optional[float] = Field(None, description="실제 작업 시간")
    actual_cost: Optional[float] = Field(None, description="실제 비용")
    scheduled_date: Optional[datetime] = Field(None, description="예약 일시")
    completion_date: Optional[datetime] = Field(None, description="완료 일시")
    created_at: datetime = Field(..., description="생성 일시")
    updated_at: datetime = Field(..., description="수정 일시")


class DiagnosticNoteCreate(BaseModel):
    """진단 노트 생성 스키마"""
    repair_job_id: str = Field(..., description="정비 작업 ID")
    note: str = Field(..., description="진단 내용")
    technician_id: Optional[str] = Field(None, description="기술자 ID")


class DiagnosticNoteResponse(BaseModel):
    """진단 노트 응답 스키마"""
    id: str = Field(..., description="진단 노트 ID")
    repair_job_id: str = Field(..., description="정비 작업 ID")
    note: str = Field(..., description="진단 내용")
    technician_id: Optional[str] = Field(None, description="기술자 ID")
    created_at: datetime = Field(..., description="생성 일시")


class RepairPartCreate(BaseModel):
    """정비 부품 생성 스키마"""
    repair_job_id: str = Field(..., description="정비 작업 ID")
    part_name: str = Field(..., description="부품명")
    quantity: int = Field(..., description="수량")
    estimated_cost: Optional[float] = Field(None, description="예상 비용")


class RepairPartResponse(BaseModel):
    """정비 부품 응답 스키마"""
    id: str = Field(..., description="부품 ID")
    repair_job_id: str = Field(..., description="정비 작업 ID")
    part_name: str = Field(..., description="부품명")
    quantity: int = Field(..., description="수량")
    estimated_cost: Optional[float] = Field(None, description="예상 비용")
    actual_cost: Optional[float] = Field(None, description="실제 비용")


class RepairListResponse(BaseModel):
    """정비 작업 목록 응답 스키마"""
    items: List[RepairJobResponse] = Field(..., description="정비 작업 목록")
    total: int = Field(..., description="전체 개수")
    skip: int = Field(..., description="건너뛴 개수")
    take: int = Field(..., description="가져온 개수")


class RepairJobFilter(BaseModel):
    """정비 작업 필터 스키마"""
    status: Optional[RepairStatus] = Field(None, description="정비 상태")
    priority: Optional[RepairPriority] = Field(None, description="우선순위")
    workshop_id: Optional[str] = Field(None, description="정비소 ID")
    vehicle_id: Optional[str] = Field(None, description="차량 ID")
    date_from: Optional[datetime] = Field(None, description="시작 일자")
    date_to: Optional[datetime] = Field(None, description="종료 일자")


class WorkshopRepairJobsFilter(BaseModel):
    """워크샵 정비 작업 필터 스키마"""
    workshop_id: str = Field(..., description="워크샵 ID")
    status: Optional[List[RepairStatus]] = Field(None, description="정비 상태 목록")
    priority: Optional[RepairPriority] = Field(None, description="우선순위")
    technician_id: Optional[str] = Field(None, description="담당 기술자 ID")
    date_from: Optional[datetime] = Field(None, description="시작 일자")
    date_to: Optional[datetime] = Field(None, description="종료 일자")
    scheduled_date_from: Optional[datetime] = Field(None, description="예약 시작 일자")
    scheduled_date_to: Optional[datetime] = Field(None, description="예약 종료 일자")
    search_query: Optional[str] = Field(None, description="검색어 (차량번호, 고객명 등)")
    page: Optional[int] = Field(default=1, ge=1, description="페이지 번호")
    page_size: Optional[int] = Field(default=20, ge=1, le=100, description="페이지 크기")


class RepairStatusUpdate(BaseModel):
    """정비 상태 업데이트 스키마"""
    status: RepairStatus = Field(..., description="새로운 정비 상태")
    notes: Optional[str] = Field(None, description="상태 변경 사유")
    technician_id: Optional[str] = Field(None, description="담당 기술자 ID")
    estimated_completion: Optional[datetime] = Field(None, description="예상 완료 일시")


class DiagnosticNotesAdd(BaseModel):
    """진단 노트 추가 스키마"""
    repair_job_id: str = Field(..., description="정비 작업 ID")
    notes: str = Field(..., description="진단 노트 내용")
    technician_id: Optional[str] = Field(None, description="작성자 기술자 ID")
    findings: Optional[str] = Field(None, description="진단 결과")
    recommendations: Optional[str] = Field(None, description="권장 사항")
    urgency_level: Optional[str] = Field(None, description="긴급도")


class RepairJobComplete(BaseModel):
    """정비 작업 완료 스키마"""
    repair_job_id: str = Field(..., description="정비 작업 ID")
    actual_hours: Optional[float] = Field(None, description="실제 소요 시간")
    actual_cost: Optional[float] = Field(None, description="실제 비용")
    completion_notes: Optional[str] = Field(None, description="완료 노트")
    quality_rating: Optional[int] = Field(None, ge=1, le=5, description="품질 평가 (1-5)")
    customer_satisfaction: Optional[int] = Field(None, ge=1, le=5, description="고객 만족도 (1-5)")
    parts_used: Optional[List[str]] = Field(None, description="사용된 부품 목록")
    warranty_period: Optional[int] = Field(None, description="보증 기간 (일)")
    follow_up_required: bool = Field(default=False, description="후속 조치 필요 여부")


class RepairJobCancel(BaseModel):
    """정비 작업 취소 스키마"""
    repair_job_id: str = Field(..., description="정비 작업 ID")
    cancel_reason: str = Field(..., description="취소 사유")
    refund_amount: Optional[float] = Field(None, description="환불 금액")
    customer_notification: bool = Field(default=True, description="고객 알림 여부")
    reschedule_option: bool = Field(default=False, description="재예약 옵션 제공 여부")


class RepairJobReschedule(BaseModel):
    """정비 작업 재예약 스키마"""
    repair_job_id: str = Field(..., description="정비 작업 ID")
    new_scheduled_date: datetime = Field(..., description="새로운 예약 일시")
    reschedule_reason: str = Field(..., description="재예약 사유")
    customer_notification: bool = Field(default=True, description="고객 알림 여부")
    priority_adjustment: Optional[RepairPriority] = Field(None, description="우선순위 조정")
    additional_notes: Optional[str] = Field(None, description="추가 노트")


class RequiredPartsAdd(BaseModel):
    """필수 부품 추가 스키마"""
    repair_job_id: str = Field(..., description="정비 작업 ID")
    part_number: str = Field(..., description="부품 번호")
    part_name: str = Field(..., description="부품명")
    quantity: int = Field(..., ge=1, description="수량")
    unit_price: Optional[float] = Field(None, description="단가")
    supplier_id: Optional[str] = Field(None, description="공급업체 ID")
    urgency: Optional[str] = Field(None, description="긴급도")
    notes: Optional[str] = Field(None, description="부품 관련 노트")


class LaborEstimateUpdate(BaseModel):
    """인건비 견적 업데이트 스키마"""
    repair_job_id: str = Field(..., description="정비 작업 ID")
    estimated_hours: float = Field(..., ge=0, description="예상 작업 시간")
    hourly_rate: Optional[float] = Field(None, description="시간당 요금")
    labor_category: Optional[str] = Field(None, description="작업 카테고리")
    complexity_level: Optional[str] = Field(None, description="복잡도 수준")
    special_requirements: Optional[str] = Field(None, description="특별 요구사항")
    updated_by: Optional[str] = Field(None, description="업데이트 담당자")
