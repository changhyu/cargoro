"""
보안 로깅 시스템
"""
import logging
import json
import sys
import os
from datetime import datetime
from typing import Any, Dict, Optional
from pathlib import Path
import traceback
from pythonjsonlogger import jsonlogger

from ..config import settings


class SecurityFilter(logging.Filter):
    """민감한 정보를 필터링하는 로깅 필터"""
    
    SENSITIVE_FIELDS = {
        'password', 'pwd', 'passwd', 'secret', 'token', 'api_key', 
        'access_token', 'refresh_token', 'authorization', 'cookie',
        'session', 'credit_card', 'card_number', 'cvv', 'ssn',
        'social_security', 'tax_id', 'driver_license'
    }
    
    def filter(self, record: logging.LogRecord) -> bool:
        """로그 레코드 필터링"""
        # 메시지 내 민감한 정보 마스킹
        if hasattr(record, 'msg'):
            record.msg = self._mask_sensitive_data(str(record.msg))
        
        # args 내 민감한 정보 마스킹
        if hasattr(record, 'args') and record.args:
            record.args = tuple(
                self._mask_sensitive_data(str(arg)) for arg in record.args
            )
        
        return True
    
    def _mask_sensitive_data(self, text: str) -> str:
        """민감한 데이터 마스킹"""
        import re
        
        # 이메일 부분 마스킹
        text = re.sub(
            r'([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',
            lambda m: f"{m.group(1)[:3]}***@{m.group(2)}",
            text
        )
        
        # 전화번호 마스킹
        text = re.sub(
            r'\b(\d{3})[-.]?(\d{4})[-.]?(\d{4})\b',
            r'\1-****-\3',
            text
        )
        
        # JWT 토큰 마스킹
        text = re.sub(
            r'Bearer\s+([A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+)',
            'Bearer [MASKED_TOKEN]',
            text
        )
        
        # 신용카드 번호 마스킹
        text = re.sub(
            r'\b(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})[\s-]?(\d{4})\b',
            r'\1-****-****-\4',
            text
        )
        
        return text


class AuditLogger:
    """감사 로그 기록"""
    
    def __init__(self, logger_name: str = "audit"):
        self.logger = logging.getLogger(logger_name)
        self._setup_logger()
    
    def _setup_logger(self):
        """감사 로거 설정"""
        # 감사 로그는 별도 파일에 저장
        log_dir = Path("logs/audit")
        log_dir.mkdir(parents=True, exist_ok=True)
        
        handler = logging.handlers.RotatingFileHandler(
            log_dir / f"audit_{datetime.now().strftime('%Y%m%d')}.log",
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=90  # 90일 보관
        )
        
        # JSON 포맷터
        formatter = jsonlogger.JsonFormatter(
            fmt='%(timestamp)s %(level)s %(name)s %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
    
    def log_auth_event(
        self,
        event_type: str,
        user_id: Optional[str] = None,
        email: Optional[str] = None,
        ip_address: Optional[str] = None,
        success: bool = True,
        details: Optional[Dict[str, Any]] = None
    ):
        """인증 이벤트 로깅"""
        event = {
            "event_type": event_type,
            "user_id": user_id,
            "email": email,
            "ip_address": ip_address,
            "success": success,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details or {}
        }
        
        if success:
            self.logger.info(f"AUTH_EVENT: {event_type}", extra=event)
        else:
            self.logger.warning(f"AUTH_FAILURE: {event_type}", extra=event)
    
    def log_access_event(
        self,
        resource: str,
        action: str,
        user_id: str,
        resource_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        allowed: bool = True,
        details: Optional[Dict[str, Any]] = None
    ):
        """접근 이벤트 로깅"""
        event = {
            "resource": resource,
            "action": action,
            "user_id": user_id,
            "resource_id": resource_id,
            "ip_address": ip_address,
            "allowed": allowed,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details or {}
        }
        
        if allowed:
            self.logger.info(f"ACCESS_GRANTED: {resource}.{action}", extra=event)
        else:
            self.logger.warning(f"ACCESS_DENIED: {resource}.{action}", extra=event)
    
    def log_data_change(
        self,
        entity: str,
        entity_id: str,
        action: str,
        user_id: str,
        old_value: Optional[Dict[str, Any]] = None,
        new_value: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ):
        """데이터 변경 로깅"""
        event = {
            "entity": entity,
            "entity_id": entity_id,
            "action": action,
            "user_id": user_id,
            "old_value": old_value,
            "new_value": new_value,
            "ip_address": ip_address,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        self.logger.info(f"DATA_CHANGE: {entity}.{action}", extra=event)
    
    def log_security_event(
        self,
        event_type: str,
        severity: str,
        ip_address: Optional[str] = None,
        user_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        """보안 이벤트 로깅"""
        event = {
            "event_type": event_type,
            "severity": severity,
            "ip_address": ip_address,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details or {}
        }
        
        if severity in ["HIGH", "CRITICAL"]:
            self.logger.critical(f"SECURITY_EVENT: {event_type}", extra=event)
        elif severity == "MEDIUM":
            self.logger.warning(f"SECURITY_EVENT: {event_type}", extra=event)
        else:
            self.logger.info(f"SECURITY_EVENT: {event_type}", extra=event)


class ErrorLogger:
    """에러 로깅 및 모니터링"""
    
    def __init__(self, logger_name: str = "error"):
        self.logger = logging.getLogger(logger_name)
        self._setup_logger()
    
    def _setup_logger(self):
        """에러 로거 설정"""
        log_dir = Path("logs/errors")
        log_dir.mkdir(parents=True, exist_ok=True)
        
        handler = logging.handlers.RotatingFileHandler(
            log_dir / f"error_{datetime.now().strftime('%Y%m%d')}.log",
            maxBytes=50 * 1024 * 1024,  # 50MB
            backupCount=30  # 30일 보관
        )
        
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.ERROR)
    
    def log_exception(
        self,
        exc: Exception,
        context: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None,
        request_id: Optional[str] = None
    ):
        """예외 로깅"""
        error_data = {
            "error_type": type(exc).__name__,
            "error_message": str(exc),
            "traceback": traceback.format_exc(),
            "context": context or {},
            "user_id": user_id,
            "request_id": request_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        self.logger.error(
            f"EXCEPTION: {type(exc).__name__}: {str(exc)}",
            extra=error_data,
            exc_info=True
        )


def setup_logging():
    """전체 로깅 시스템 설정"""
    # 로그 디렉토리 생성
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # 루트 로거 설정
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.log_level.upper()))
    
    # 기존 핸들러 제거
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # 콘솔 핸들러
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    
    # 파일 핸들러
    file_handler = logging.handlers.RotatingFileHandler(
        log_dir / "app.log",
        maxBytes=100 * 1024 * 1024,  # 100MB
        backupCount=10
    )
    file_handler.setLevel(logging.DEBUG)
    
    # 포맷터 설정
    if settings.log_format == "json":
        json_formatter = jsonlogger.JsonFormatter(
            fmt='%(timestamp)s %(level)s %(name)s %(message)s'
        )
        console_handler.setFormatter(json_formatter)
        file_handler.setFormatter(json_formatter)
    else:
        text_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        console_handler.setFormatter(text_formatter)
        file_handler.setFormatter(text_formatter)
    
    # 보안 필터 추가
    security_filter = SecurityFilter()
    console_handler.addFilter(security_filter)
    file_handler.addFilter(security_filter)
    
    # 핸들러 추가
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    
    # SQL 로깅 (개발 환경에서만)
    if settings.is_development():
        logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)
    else:
        logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    
    # 외부 라이브러리 로깅 레벨 조정
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)
    
    return root_logger


# 전역 로거 인스턴스
audit_logger = AuditLogger()
error_logger = ErrorLogger()
app_logger = logging.getLogger("app")

# 로깅 시스템 초기화
setup_logging()
