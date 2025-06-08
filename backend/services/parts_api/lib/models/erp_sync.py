"""
ERP 동기화 관련 데이터 모델 정의
이 모듈은 Pydantic v2를 사용하여 API에서 사용하는 데이터 모델을 정의합니다.
"""
from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class SyncStatus(str, Enum):
    """동기화 상태"""

    PENDING = "pending"  # 대기 중
    IN_PROGRESS = "in_progress"  # 진행 중
    COMPLETED = "completed"  # 완료됨
    FAILED = "failed"  # 실패함
    PARTIAL = "partial"  # 일부 완료


class SyncDirection(str, Enum):
    """동기화 방향"""

    IMPORT = "import"  # ERP -> 시스템
    EXPORT = "export"  # 시스템 -> ERP
    BIDIRECTIONAL = "bidirectional"  # 양방향


class ERPSystem(str, Enum):
    """지원되는 ERP 시스템"""

    SAP = "sap"
    ORACLE = "oracle"
    MICROSOFT_DYNAMICS = "microsoft_dynamics"
    CUSTOM = "custom"


class ERPSyncConfigBase(BaseModel):
    """ERP 동기화 설정 기본 모델"""

    name: str = Field(..., description="설정 이름")
    erp_system: ERPSystem = Field(..., description="ERP 시스템 유형")
    connection_url: str = Field(..., description="ERP 연결 URL")
    username: str = Field(..., description="연결 사용자명")
    sync_direction: SyncDirection = Field(
        default=SyncDirection.IMPORT, description="동기화 방향"
    )
    sync_interval: Optional[int] = Field(None, description="자동 동기화 간격(분)", ge=5)
    sync_enabled: bool = Field(default=False, description="자동 동기화 활성화 여부")
    last_sync_time: Optional[datetime] = Field(None, description="마지막 동기화 시간")
    mapping_config: Dict[str, Any] = Field(
        default_factory=dict, description="필드 매핑 설정"
    )
    filters: Dict[str, Any] = Field(
        default_factory=dict, description="동기화 필터 설정"
    )
    organization_id: str = Field(..., description="조직 ID")


class ERPSyncConfigCreate(ERPSyncConfigBase):
    """ERP 동기화 설정 생성 모델"""

    password: str = Field(..., description="연결 비밀번호")

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "SAP 부품 동기화",
                "erp_system": "sap",
                "connection_url": "https://sap-api.example.com",
                "username": "api_user",
                "password": "api_password",
                "sync_direction": "import",
                "sync_interval": 60,
                "sync_enabled": True,
                "mapping_config": {
                    "part_number": "material_number",
                    "part_name": "material_description",
                    "price": "standard_price",
                },
                "filters": {
                    "categories": ["엔진", "브레이크", "전기"],
                    "status": ["active"],
                },
                "organization_id": "org123",
            }
        }
    }


class ERPSyncConfigUpdate(BaseModel):
    """ERP 동기화 설정 업데이트 모델"""

    name: Optional[str] = None
    connection_url: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    sync_direction: Optional[SyncDirection] = None
    sync_interval: Optional[int] = Field(None, ge=5)
    sync_enabled: Optional[bool] = None
    mapping_config: Optional[Dict[str, Any]] = None
    filters: Optional[Dict[str, Any]] = None


class ERPSyncConfigResponse(ERPSyncConfigBase):
    """ERP 동기화 설정 응답 모델"""

    id: str
    created_at: datetime
    updated_at: datetime
    password: Optional[str] = Field(None, exclude=True)

    model_config = {"from_attributes": True}  # Pydantic v2 형식


class ERPSyncLogBase(BaseModel):
    """ERP 동기화 로그 기본 모델"""

    config_id: str = Field(..., description="동기화 설정 ID")
    status: SyncStatus = Field(..., description="동기화 상태")
    start_time: datetime = Field(..., description="시작 시간")
    end_time: Optional[datetime] = Field(None, description="종료 시간")
    direction: SyncDirection = Field(..., description="동기화 방향")
    total_items: Optional[int] = Field(None, description="전체 항목 수")
    processed_items: Optional[int] = Field(None, description="처리된 항목 수")
    success_items: Optional[int] = Field(None, description="성공한 항목 수")
    failed_items: Optional[int] = Field(None, description="실패한 항목 수")
    error_details: Optional[str] = Field(None, description="오류 상세 정보")
    organization_id: str = Field(..., description="조직 ID")


class ERPSyncLogCreate(ERPSyncLogBase):
    """ERP 동기화 로그 생성 모델"""

    pass


class ERPSyncLogUpdate(BaseModel):
    """ERP 동기화 로그 업데이트 모델"""

    status: Optional[SyncStatus] = None
    end_time: Optional[datetime] = None
    total_items: Optional[int] = None
    processed_items: Optional[int] = None
    success_items: Optional[int] = None
    failed_items: Optional[int] = None
    error_details: Optional[str] = None


class ERPSyncLogResponse(ERPSyncLogBase):
    """ERP 동기화 로그 응답 모델"""

    id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}  # Pydantic v2 형식


class SyncDataRequest(BaseModel):
    """데이터 동기화 요청 모델"""

    config_id: str = Field(..., description="동기화 설정 ID")
    direction: Optional[SyncDirection] = Field(
        None, description="동기화 방향 (설정값 오버라이드)"
    )
    filters: Optional[Dict[str, Any]] = Field(
        None, description="추가 필터 (설정값에 병합)"
    )


class SyncDataResponse(BaseModel):
    """데이터 동기화 응답 모델"""

    sync_log_id: str = Field(..., description="생성된 동기화 로그 ID")
    status: SyncStatus = Field(..., description="동기화 상태")
    message: str = Field(..., description="상태 메시지")
    details: Optional[Dict[str, Any]] = Field(None, description="추가 상세 정보")


class ERPSyncConfigListResponse(BaseModel):
    """ERP 동기화 설정 목록 응답"""

    items: List[ERPSyncConfigResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ERPSyncLogListResponse(BaseModel):
    """ERP 동기화 로그 목록 응답"""

    items: List[ERPSyncLogResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
