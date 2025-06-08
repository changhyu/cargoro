# 실시간 성능 모니터링 및 알림 시스템
import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum

import structlog
from prometheus_client import Counter, Histogram, Gauge, start_http_server
from pydantic import BaseModel
import redis.asyncio as redis

# 구조화된 로깅 설정
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer(),
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


class AlertLevel(Enum):
    """알림 레벨"""

    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class MetricType(Enum):
    """메트릭 타입"""

    COUNTER = "counter"
    HISTOGRAM = "histogram"
    GAUGE = "gauge"


@dataclass
class PerformanceMetric:
    """성능 메트릭 데이터 클래스"""

    name: str
    value: float
    labels: Dict[str, str]
    timestamp: datetime
    metric_type: MetricType


@dataclass
class Alert:
    """알림 데이터 클래스"""

    level: AlertLevel
    title: str
    message: str
    source: str
    timestamp: datetime
    metadata: Dict[str, Any]


class PerformanceMonitor:
    """성능 모니터링 클래스"""

    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis = redis.from_url(redis_url)
        self.metrics_buffer: List[PerformanceMetric] = []
        self.alert_handlers: List[callable] = []

        # Prometheus 메트릭 정의
        self.api_requests_total = Counter(
            "cargoro_api_requests_total",
            "Total API requests",
            ["method", "endpoint", "status_code"],
        )

        self.api_request_duration = Histogram(
            "cargoro_api_request_duration_seconds",
            "API request duration in seconds",
            ["method", "endpoint"],
        )

        self.active_drivers = Gauge(
            "cargoro_active_drivers_total", "Number of active drivers"
        )

        self.performance_scores = Histogram(
            "cargoro_driver_performance_scores",
            "Driver performance scores",
            ["score_type", "organization_id"],
            buckets=(60, 70, 80, 85, 90, 95, 100),
        )

        self.database_connections = Gauge(
            "cargoro_database_connections_active", "Active database connections"
        )

        self.cache_hit_rate = Gauge(
            "cargoro_cache_hit_rate", "Cache hit rate percentage"
        )

    async def start_monitoring(self, port: int = 8000):
        """모니터링 서버 시작"""
        logger.info("performance_monitoring_started", port=port)

        # Prometheus 메트릭 서버 시작
        start_http_server(port)

        # 백그라운드 태스크 시작
        await asyncio.gather(
            self._flush_metrics_periodically(),
            self._collect_system_metrics(),
            self._check_performance_thresholds(),
        )

    async def record_api_request(
        self,
        method: str,
        endpoint: str,
        status_code: int,
        duration: float,
        user_id: Optional[str] = None,
    ):
        """API 요청 메트릭 기록"""
        # Prometheus 메트릭 업데이트
        self.api_requests_total.labels(
            method=method, endpoint=endpoint, status_code=str(status_code)
        ).inc()

        self.api_request_duration.labels(method=method, endpoint=endpoint).observe(
            duration
        )

        # 구조화된 로그 기록
        logger.info(
            "api_request_completed",
            method=method,
            endpoint=endpoint,
            status_code=status_code,
            duration_ms=duration * 1000,
            user_id=user_id,
        )

        # 성능 임계값 확인
        if duration > 2.0:  # 2초 이상
            await self._create_alert(
                AlertLevel.WARNING,
                "API 응답 시간 초과",
                f"{endpoint} 엔드포인트가 {duration:.2f}초 걸렸습니다.",
                "performance_monitor",
                {
                    "method": method,
                    "endpoint": endpoint,
                    "duration": duration,
                    "threshold": 2.0,
                },
            )

    async def record_driver_performance(
        self,
        driver_id: str,
        organization_id: str,
        safety_score: float,
        eco_score: float,
        overall_score: float,
    ):
        """운전자 성능 메트릭 기록"""
        labels = {"organization_id": organization_id}

        self.performance_scores.labels(
            score_type="safety", organization_id=organization_id
        ).observe(safety_score)

        self.performance_scores.labels(
            score_type="eco", organization_id=organization_id
        ).observe(eco_score)

        self.performance_scores.labels(
            score_type="overall", organization_id=organization_id
        ).observe(overall_score)

        logger.info(
            "driver_performance_recorded",
            driver_id=driver_id,
            organization_id=organization_id,
            safety_score=safety_score,
            eco_score=eco_score,
            overall_score=overall_score,
        )

        # 성능 임계값 확인
        if overall_score < 60:
            await self._create_alert(
                AlertLevel.ERROR,
                "운전자 성능 저하 감지",
                f"운전자 {driver_id}의 종합 점수가 {overall_score}점으로 기준치(60점) 미만입니다.",
                "performance_monitor",
                {
                    "driver_id": driver_id,
                    "organization_id": organization_id,
                    "overall_score": overall_score,
                    "threshold": 60,
                },
            )

    async def record_cache_metrics(self, operation: str, hit: bool):
        """캐시 메트릭 기록"""
        cache_key = f"cache_stats:{datetime.now().strftime('%Y%m%d%H')}"

        # Redis에 캐시 통계 저장
        if hit:
            await self.redis.hincrby(cache_key, "hits", 1)
        else:
            await self.redis.hincrby(cache_key, "misses", 1)

        await self.redis.expire(cache_key, 3600)  # 1시간 보관

        # 캐시 히트율 계산 및 업데이트
        stats = await self.redis.hgetall(cache_key)
        if stats:
            hits = int(stats.get(b"hits", 0))
            misses = int(stats.get(b"misses", 0))
            total = hits + misses

            if total > 0:
                hit_rate = (hits / total) * 100
                self.cache_hit_rate.set(hit_rate)

    async def record_database_connections(self, active_connections: int):
        """데이터베이스 연결 메트릭 기록"""
        self.database_connections.set(active_connections)

        if active_connections > 50:  # 임계값 50개 연결
            await self._create_alert(
                AlertLevel.WARNING,
                "데이터베이스 연결 수 증가",
                f"활성 데이터베이스 연결이 {active_connections}개로 임계값(50개)을 초과했습니다.",
                "database_monitor",
                {"active_connections": active_connections, "threshold": 50},
            )

    async def _collect_system_metrics(self):
        """시스템 메트릭 주기적 수집"""
        while True:
            try:
                # 활성 운전자 수 수집
                active_count = await self._get_active_drivers_count()
                self.active_drivers.set(active_count)

                # 데이터베이스 연결 수 수집
                db_connections = await self._get_database_connections()
                await self.record_database_connections(db_connections)

                logger.debug(
                    "system_metrics_collected",
                    active_drivers=active_count,
                    db_connections=db_connections,
                )

                await asyncio.sleep(30)  # 30초마다 수집

            except Exception as e:
                logger.error(
                    "system_metrics_collection_failed",
                    error=str(e),
                    error_type=type(e).__name__,
                )
                await asyncio.sleep(60)  # 오류 시 1분 대기

    async def _check_performance_thresholds(self):
        """성능 임계값 모니터링"""
        while True:
            try:
                # 최근 5분간 API 응답 시간 체크
                slow_endpoints = await self._get_slow_endpoints()
                for endpoint_data in slow_endpoints:
                    await self._create_alert(
                        AlertLevel.WARNING,
                        f"느린 API 엔드포인트 감지: {endpoint_data['endpoint']}",
                        f"평균 응답시간: {endpoint_data['avg_duration']:.2f}초",
                        "threshold_monitor",
                        endpoint_data,
                    )

                # 에러율 체크
                error_rate = await self._get_error_rate()
                if error_rate > 5.0:  # 5% 이상 에러율
                    await self._create_alert(
                        AlertLevel.ERROR,
                        "높은 에러율 감지",
                        f"최근 5분간 에러율이 {error_rate:.2f}%입니다.",
                        "threshold_monitor",
                        {"error_rate": error_rate, "threshold": 5.0},
                    )

                await asyncio.sleep(300)  # 5분마다 체크

            except Exception as e:
                logger.error(
                    "threshold_monitoring_failed",
                    error=str(e),
                    error_type=type(e).__name__,
                )
                await asyncio.sleep(300)

    async def _create_alert(
        self,
        level: AlertLevel,
        title: str,
        message: str,
        source: str,
        metadata: Dict[str, Any],
    ):
        """알림 생성 및 전송"""
        alert = Alert(
            level=level,
            title=title,
            message=message,
            source=source,
            timestamp=datetime.now(),
            metadata=metadata,
        )

        logger.warning(
            "alert_created",
            level=level.value,
            title=title,
            message=message,
            source=source,
            metadata=metadata,
        )

        # 알림 핸들러 실행
        for handler in self.alert_handlers:
            try:
                await handler(alert)
            except Exception as e:
                logger.error(
                    "alert_handler_failed", handler=handler.__name__, error=str(e)
                )

    def add_alert_handler(self, handler: callable):
        """알림 핸들러 추가"""
        self.alert_handlers.append(handler)

    async def _flush_metrics_periodically(self):
        """메트릭 주기적 플러시"""
        while True:
            try:
                if self.metrics_buffer:
                    await self._flush_metrics()

                await asyncio.sleep(60)  # 1분마다 플러시

            except Exception as e:
                logger.error(
                    "metrics_flush_failed",
                    error=str(e),
                    buffer_size=len(self.metrics_buffer),
                )
                await asyncio.sleep(60)

    async def _flush_metrics(self):
        """메트릭 데이터 플러시"""
        if not self.metrics_buffer:
            return

        # Redis에 메트릭 저장
        pipeline = self.redis.pipeline()
        timestamp = datetime.now().isoformat()

        for metric in self.metrics_buffer:
            key = f"metrics:{metric.name}:{timestamp}"
            data = asdict(metric)
            data["timestamp"] = data["timestamp"].isoformat()

            pipeline.hset(key, mapping=data)
            pipeline.expire(key, 86400)  # 24시간 보관

        await pipeline.execute()

        logger.info(
            "metrics_flushed", count=len(self.metrics_buffer), timestamp=timestamp
        )

        self.metrics_buffer.clear()

    async def _get_active_drivers_count(self) -> int:
        """활성 운전자 수 조회"""
        # 실제 구현에서는 데이터베이스 쿼리
        # 여기서는 모의 데이터 반환
        return 125

    async def _get_database_connections(self) -> int:
        """데이터베이스 연결 수 조회"""
        # 실제 구현에서는 DB 연결 풀 상태 조회
        return 15

    async def _get_slow_endpoints(self) -> List[Dict[str, Any]]:
        """느린 엔드포인트 목록 조회"""
        # 실제 구현에서는 메트릭 분석
        return []

    async def _get_error_rate(self) -> float:
        """에러율 조회"""
        # 실제 구현에서는 에러 메트릭 분석
        return 2.1


class SlackAlertHandler:
    """Slack 알림 핸들러"""

    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url

    async def __call__(self, alert: Alert):
        """Slack으로 알림 전송"""
        color_map = {
            AlertLevel.INFO: "#36a64f",
            AlertLevel.WARNING: "#ff9500",
            AlertLevel.ERROR: "#ff4444",
            AlertLevel.CRITICAL: "#ff0000",
        }

        payload = {
            "attachments": [
                {
                    "color": color_map.get(alert.level, "#333333"),
                    "title": alert.title,
                    "text": alert.message,
                    "fields": [
                        {"title": "소스", "value": alert.source, "short": True},
                        {
                            "title": "시간",
                            "value": alert.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                            "short": True,
                        },
                        {
                            "title": "레벨",
                            "value": alert.level.value.upper(),
                            "short": True,
                        },
                    ],
                    "footer": "카고로 모니터링 시스템",
                }
            ]
        }

        # 실제 구현에서는 HTTP 요청으로 Slack에 전송
        logger.info(
            "slack_alert_sent", alert_title=alert.title, alert_level=alert.level.value
        )


class EmailAlertHandler:
    """이메일 알림 핸들러"""

    def __init__(self, smtp_config: Dict[str, str]):
        self.smtp_config = smtp_config

    async def __call__(self, alert: Alert):
        """이메일로 알림 전송"""
        if alert.level in [AlertLevel.ERROR, AlertLevel.CRITICAL]:
            # 중요한 알림만 이메일 전송
            logger.info(
                "email_alert_sent",
                alert_title=alert.title,
                alert_level=alert.level.value,
                recipients=self.smtp_config.get("recipients", []),
            )


# 전역 모니터 인스턴스
performance_monitor = PerformanceMonitor()

# 알림 핸들러 설정
slack_handler = SlackAlertHandler("https://hooks.slack.com/services/...")
email_handler = EmailAlertHandler(
    {
        "smtp_server": "smtp.gmail.com",
        "smtp_port": 587,
        "username": "alerts@cargoro.com",
        "password": "app_password",
        "recipients": ["admin@cargoro.com", "dev@cargoro.com"],
    }
)

performance_monitor.add_alert_handler(slack_handler)
performance_monitor.add_alert_handler(email_handler)
