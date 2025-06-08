from fastapi import APIRouter, Depends, HTTPException, Query, Response
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, cast
from datetime import datetime, timedelta
from services.admin_api.lib.database import get_prisma
from enum import Enum
import json
import logging
from shared.utils.response_utils import (
    ApiResponse,
    ApiException,
    create_response,
    not_found_exception,
    server_error_exception,
    validation_exception,
)

router = APIRouter()
logger = logging.getLogger("admin-api:audit")


# 감사 로그 레벨 열거형
class AuditLogLevel(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


# 감사 로그 카테고리 열거형
class AuditCategory(str, Enum):
    AUTHENTICATION = "authentication"
    AUTHORIZATION = "authorization"
    DATA_ACCESS = "data_access"
    CONFIGURATION = "configuration"
    OPERATION = "operation"
    SECURITY = "security"


# 서비스 타입 열거형
class ServiceType(str, Enum):
    WORKSHOP = "workshop"
    FLEET = "fleet"
    DELIVERY = "delivery"
    PARTS = "parts"
    ADMIN = "admin"
    GATEWAY = "gateway"
    AUTH = "auth"


# 감사 로그 요청 모델
class AuditLogCreate(BaseModel):
    level: AuditLogLevel
    service: ServiceType
    category: AuditCategory
    message: str
    user_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    action: Optional[str] = None
    resource: Optional[str] = None
    resource_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    success: bool = True


# 감사 로그 응답 모델
class AuditLogResponse(BaseModel):
    id: str
    timestamp: datetime
    level: str
    service: str
    category: str
    message: str
    user_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    action: Optional[str] = None
    resource: Optional[str] = None
    resource_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    success: bool


# 감사 로그 통계 응답 모델
class AuditLogStats(BaseModel):
    info: int = 0
    warning: int = 0
    error: int = 0
    critical: int = 0
    total: int = 0


# 감사 로그 페이지네이션 응답 모델
class AuditLogPaginatedResponse(BaseModel):
    items: List[AuditLogResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    statistics: AuditLogStats


# 대시보드 통계 응답 모델
class DashboardStats(BaseModel):
    audit_log_summary: AuditLogStats
    recent_errors: List[AuditLogResponse]
    activity_by_service: Dict[str, int]
    activity_by_category: Dict[str, int]
    activity_by_day: Dict[str, int]
    top_resources: List[Dict[str, Any]]
    top_users: List[Dict[str, Any]]
    failure_rate: float
    average_actions_per_day: float


# 시스템 상태 응답 모델
class SystemHealth(BaseModel):
    status: str
    database: str
    version: str
    uptime: str
    environment: str


# 대시보드 통계 모델
class DashboardStats(BaseModel):
    audit_log_summary: AuditLogStats
    recent_errors: List[AuditLogResponse]
    activity_by_service: Dict[str, int]
    activity_by_category: Dict[str, int]
    activity_by_day: Dict[str, int]
    top_resources: List[Dict[str, Any]]
    top_users: List[Dict[str, Any]]
    failure_rate: float
    average_actions_per_day: float


# 감사 로그 생성 API
@router.post(
    "/audit-logs", status_code=201
)
async def create_audit_log(audit_log: AuditLogCreate, prisma=Depends(get_prisma)):
    """
    새로운 감사 로그를 생성합니다.
    """
    try:
        data = audit_log.model_dump(exclude_unset=True)

        # snake_case to camelCase 변환
        if "user_id" in data:
            data["userId"] = data.pop("user_id")
        if "ip_address" in data:
            data["ipAddress"] = data.pop("ip_address")
        if "user_agent" in data:
            data["userAgent"] = data.pop("user_agent")
        if "resource_id" in data:
            data["resourceId"] = data.pop("resource_id")

        created_log = await prisma.auditlog.create(data=data)

        return create_response(data=created_log, status_code=201)
    except Exception as e:
        logger.error(f"감사 로그 생성 실패: {str(e)}")
        raise server_error_exception(f"감사 로그 생성 중 오류가 발생했습니다: {str(e)}")


# 감사 로그 조회 API
@router.get("/audit-logs")
async def get_audit_logs(
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(10, ge=1, le=100, description="페이지 당 항목 수"),
    level: Optional[AuditLogLevel] = None,
    category: Optional[AuditCategory] = None,
    service: Optional[ServiceType] = None,
    search_query: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    prisma=Depends(get_prisma),
):
    """
    감사 로그를 필터링하여 조회합니다.
    """
    try:
        # 필터 조건 구성
        where: Dict[str, Any] = {}

        if level:
            where["level"] = level

        if category:
            where["category"] = category

        if service:
            where["service"] = service.value

        if search_query:
            where["OR"] = [
                {"message": {"contains": search_query}},
                {
                    "user": {
                        "OR": [
                            {"email": {"contains": search_query}},
                            {"firstName": {"contains": search_query}},
                            {"lastName": {"contains": search_query}},
                        ]
                    }
                },
            ]

        if start_date and end_date:
            where["timestamp"] = {"gte": start_date, "lte": end_date}
        elif start_date:
            where["timestamp"] = {"gte": start_date}
        elif end_date:
            where["timestamp"] = {"lte": end_date}

        # 총 로그 수 조회
        total_logs = await prisma.auditlog.count(where=where)

        # 페이지네이션 계산
        skip = (page - 1) * page_size
        total_pages = (total_logs + page_size - 1) // page_size

        # 로그 조회
        logs = await prisma.auditlog.find_many(
            where=where,
            skip=skip,
            take=page_size,
            order={"timestamp": "desc"},
            include={"user": True},
        )

        # 통계 정보 조회
        stats = AuditLogStats(
            info=await prisma.auditlog.count(where={"level": "info", **where}),
            warning=await prisma.auditlog.count(where={"level": "warning", **where}),
            error=await prisma.auditlog.count(where={"level": "error", **where}),
            critical=await prisma.auditlog.count(where={"level": "critical", **where}),
            total=total_logs,
        )

        # 응답 구성
        response_data = AuditLogPaginatedResponse(
            items=logs,
            total=total_logs,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            statistics=stats,
        )

        return create_response(data=response_data)
    except Exception as e:
        logger.error(f"감사 로그 조회 실패: {str(e)}")
        raise server_error_exception(f"감사 로그 조회 중 오류가 발생했습니다: {str(e)}")


# 감사 로그 통계 조회 API (정적 경로를 먼저 정의)
@router.get("/audit-logs/statistics")
async def get_audit_log_statistics(
    days: int = Query(30, ge=1, le=365, description="조회할 기간(일)"),
    service: Optional[ServiceType] = None,
    prisma=Depends(get_prisma),
):
    """
    감사 로그 통계 정보를 조회합니다.
    """
    try:
        # 기간 설정
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        where: Dict[str, Any] = {"timestamp": {"gte": start_date, "lte": end_date}}

        if service:
            where["service"] = service.value

        # 레벨별 통계
        stats = AuditLogStats(
            info=await prisma.auditlog.count(where={"level": "info", **where}),
            warning=await prisma.auditlog.count(where={"level": "warning", **where}),
            error=await prisma.auditlog.count(where={"level": "error", **where}),
            critical=await prisma.auditlog.count(where={"level": "critical", **where}),
        )
        stats.total = stats.info + stats.warning + stats.error + stats.critical

        return create_response(data=stats)
    except Exception as e:
        logger.error(f"감사 로그 통계 조회 실패: {str(e)}")
        raise server_error_exception(f"감사 로그 통계 조회 중 오류가 발생했습니다: {str(e)}")


# 감사 로그 내보내기 API (정적 경로)
@router.get("/audit-logs/export")
async def export_audit_logs(
    format: str = Query(..., description="내보내기 형식 (csv 또는 json)"),
    level: Optional[AuditLogLevel] = None,
    category: Optional[AuditCategory] = None,
    service: Optional[ServiceType] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    prisma=Depends(get_prisma),
):
    """
    감사 로그를 CSV 또는 JSON 형식으로 내보냅니다.
    """
    try:
        if format.lower() not in ["csv", "json"]:
            raise HTTPException(
                status_code=422,
                detail="지원하지 않는 내보내기 형식입니다. 'csv' 또는 'json'을 사용하세요."
            )

        # 필터 조건 구성
        where: Dict[str, Any] = {}

        if level:
            where["level"] = level
        if category:
            where["category"] = category
        if service:
            where["service"] = service.value
        if start_date and end_date:
            where["timestamp"] = {"gte": start_date, "lte": end_date}

        # 로그 조회 (최대 10,000개)
        logs = await prisma.auditlog.find_many(
            where=where,
            order={"timestamp": "desc"},
            take=10000
        )

        if format.lower() == "csv":
            import csv
            import io

            output = io.StringIO()
            writer = csv.writer(output)

            # 헤더 작성
            writer.writerow([
                "ID", "타임스탬프", "레벨", "서비스", "카테고리", "메시지",
                "사용자ID", "IP주소", "작업", "리소스", "성공"
            ])

            # 데이터 작성
            for log in logs:
                writer.writerow([
                    log.id, log.timestamp, log.level, log.service, log.category,
                    log.message, log.userId, log.ipAddress, log.action,
                    log.resource, log.success
                ])

            return Response(
                content=output.getvalue(),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=audit_logs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
            )
        else:  # json
            logs_data = []
            for log in logs:
                logs_data.append({
                    "id": log.id,
                    "timestamp": log.timestamp.isoformat() if log.timestamp else None,
                    "level": log.level,
                    "service": log.service,
                    "category": log.category,
                    "message": log.message,
                    "user_id": log.userId,
                    "ip_address": log.ipAddress,
                    "action": log.action,
                    "resource": log.resource,
                    "success": log.success
                })

            return Response(
                content=json.dumps(logs_data, ensure_ascii=False),
                media_type="application/json",
                headers={"Content-Disposition": f"attachment; filename=audit_logs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"}
            )

    except ApiException as e:
        # shared의 ApiException을 HTTPException으로 변환
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"감사 로그 내보내기 실패: {str(e)}")
        raise server_error_exception(f"감사 로그 내보내기 중 오류가 발생했습니다: {str(e)}")


# 특정 감사 로그 조회 API (동적 경로는 나중에 정의)
@router.get("/audit-logs/{log_id}")
async def get_audit_log(log_id: str, prisma=Depends(get_prisma)):
    """
    특정 ID의 감사 로그를 조회합니다.
    """
    try:
        log = await prisma.auditlog.find_unique(
            where={"id": log_id}, include={"user": True}
        )

        if not log:
            raise not_found_exception("감사 로그", log_id)

        return create_response(data=log)
    except ApiException as e:
        # shared의 ApiException을 HTTPException으로 변환
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"감사 로그 조회 실패: {str(e)}")
        raise server_error_exception(f"감사 로그 조회 중 오류가 발생했습니다: {str(e)}")



# 대시보드 통계 API
@router.get("/dashboard/stats")
async def get_dashboard_stats(
    days: int = Query(30, ge=1, le=365, description="조회할 기간(일)"),
    service: Optional[ServiceType] = None,
    prisma=Depends(get_prisma),
):
    """
    대시보드에 표시할 통계 정보를 조회합니다.
    """
    try:
        # 기간 설정
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        where: Dict[str, Any] = {"timestamp": {"gte": start_date, "lte": end_date}}

        if service:
            where["service"] = service.value

        # 레벨별 통계
        stats = AuditLogStats(
            info=await prisma.auditlog.count(where={"level": "info", **where}),
            warning=await prisma.auditlog.count(where={"level": "warning", **where}),
            error=await prisma.auditlog.count(where={"level": "error", **where}),
            critical=await prisma.auditlog.count(where={"level": "critical", **where}),
        )
        stats.total = stats.info + stats.warning + stats.error + stats.critical

        # 최근 오류들
        recent_errors = await prisma.auditlog.find_many(
            where={"level": {"in": ["error", "critical"]}, **where},
            take=10,
            order={"timestamp": "desc"}
        )

        # 서비스별 활동
        activity_by_service = {}
        for service_type in ServiceType:
            count = await prisma.auditlog.count(
                where={"service": service_type.value, **where}
            )
            activity_by_service[service_type.value] = count

        # 카테고리별 활동
        activity_by_category = {}
        for category_type in AuditCategory:
            count = await prisma.auditlog.count(
                where={"category": category_type.value, **where}
            )
            activity_by_category[category_type.value] = count

        dashboard_data = {
            "audit_log_summary": stats,
            "recent_errors": recent_errors,
            "activity_by_service": activity_by_service,
            "activity_by_category": activity_by_category,
            "failure_rate": 0.0,  # 간단한 구현
            "average_actions_per_day": stats.total / days if days > 0 else 0
        }

        return create_response(data=dashboard_data)
    except Exception as e:
        logger.error(f"대시보드 통계 조회 실패: {str(e)}")
        raise server_error_exception(f"대시보드 통계 조회 중 오류가 발생했습니다: {str(e)}")


# 시스템 상태 확인 API
@router.get("/system/health")
async def system_health_check(prisma=Depends(get_prisma)):
    """
    시스템 상태를 확인합니다.
    """
    try:
        # 데이터베이스 연결 상태 확인
        try:
            await prisma.auditlog.count()
            db_status = "connected"
        except Exception:
            db_status = "disconnected"

        health_data = {
            "status": "healthy" if db_status == "connected" else "unhealthy",
            "database": db_status,
            "version": "1.0.0",
            "uptime": "unknown",
            "environment": "development"
        }

        return create_response(data=health_data)
    except Exception as e:
        logger.error(f"시스템 상태 확인 실패: {str(e)}")
        raise server_error_exception(f"시스템 상태 확인 중 오류가 발생했습니다: {str(e)}")
