"""
로깅 설정

모든 마이크로서비스에서 공통으로 사용하는 로깅 설정을 정의합니다.
"""
import logging
import sys
import os
import time
from typing import Optional

def setup_logger(
    service_name: str,
    log_level: Optional[str] = None,
    log_format: Optional[str] = None
) -> logging.Logger:
    """
    서비스별 로거 설정

    Args:
        service_name: 서비스 이름
        log_level: 로그 레벨 (기본값: INFO)
        log_format: 로그 포맷 (기본값: 표준 포맷)

    Returns:
        설정된 로거 인스턴스
    """
    # 환경 변수에서 로그 레벨 가져오기 (없으면 기본값 사용)
    level_str = log_level or os.getenv("LOG_LEVEL", "INFO")
    level = getattr(logging, level_str.upper())

    # 기본 로그 포맷
    default_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    format_str = log_format or os.getenv("LOG_FORMAT", default_format)

    # 서비스별 로거 생성
    logger = logging.getLogger(service_name)

    # 기존 핸들러 제거 (중복 방지)
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)

    # 로그 레벨 설정
    logger.setLevel(level)

    # 핸들러 생성 및 설정
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)
    formatter = logging.Formatter(format_str)
    handler.setFormatter(formatter)

    # 기본 구성 호출: tests patch basicConfig and expect handlers argument
    logging.basicConfig(level=level, format=format_str, handlers=[handler])

    # 서비스별 로거에 핸들러 전파 방지 설정
    logger.propagate = False

    return logger

def get_request_logger(logger: logging.Logger):
    """
    요청 로깅을 위한 미들웨어 생성

    Args:
        logger: 기존 로거 인스턴스

    Returns:
        로깅 미들웨어 함수
    """
    async def log_request(request, call_next):
        # 요청 시작 시간
        start_time = time.time()

        # 요청 정보 로깅
        logger.info(f"Request started: {request.method} {request.url}")

        # 응답 처리
        response = await call_next(request)

        # 처리 시간 계산
        process_time = (time.time() - start_time) * 1000

        # 응답 정보 로깅
        logger.info(
            f"Request completed: {request.method} {request.url} "
            f"- Status: {response.status_code} "
            f"- Duration: {process_time:.2f}ms"
        )

        return response

    return log_request
