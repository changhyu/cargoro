"""
공통 설정 모듈
환경 변수 기반의 설정 관리를 담당합니다.
"""

import os
import sys
from typing import Optional, List, TYPE_CHECKING

# 테스트 환경 감지
IS_TEST_ENV = "pytest" in sys.modules or "test" in sys.argv[0] if sys.argv else False

# pydantic_settings를 조건부로 임포트
try:
    from pydantic_settings import BaseSettings
except ImportError:
    # pydantic v1 호환성을 위한 fallback
    try:
        from pydantic import BaseSettings
    except ImportError:
        # 테스트 환경에서 pydantic이 없는 경우 mock 클래스 사용
        class BaseSettings:
            def __init__(self, **kwargs):
                for key, value in kwargs.items():
                    setattr(self, key, value)


try:
    from pydantic import Field
except ImportError:
    # 테스트 환경에서 pydantic이 없는 경우 mock Field 함수
    def Field(default=None, env=None, description=None, **kwargs):
        return default


class CommonSettings(BaseSettings):
    """공통 설정 클래스"""

    # 환경 설정
    DEBUG: bool = Field(
        default=False, env="DEBUG", description="디버그 모드 활성화 여부"
    )

    ENV: str = Field(
        default="development",
        env="ENV",
        description="실행 환경 (development, staging, production)",
    )
    
    ENVIRONMENT: str = Field(
        default="development",
        env="ENVIRONMENT",
        description="실행 환경 (development, staging, production)",
    )

    # 데이터베이스 설정
    database_url: str = Field(
        default="postgresql://user:password@localhost:5432/cargoro_db",
        env="DATABASE_URL",
        description="데이터베이스 연결 URL",
    )

    # Redis 설정
    redis_url: str = Field(
        default="redis://localhost:6379/0",
        env="REDIS_URL",
        description="Redis 연결 URL",
    )

    # JWT 설정
    SECRET_KEY: str = Field(
        default="your-secret-key-here",
        env="SECRET_KEY",
        description="JWT 토큰 서명 키",
    )
    jwt_secret_key: str = Field(
        default="your-secret-key-here",
        env="JWT_SECRET_KEY",
        description="JWT 토큰 서명 키",
    )
    jwt_algorithm: str = Field(
        default="HS256", env="JWT_ALGORITHM", description="JWT 알고리즘"
    )
    jwt_expiration_hours: int = Field(
        default=24, env="JWT_EXPIRATION_HOURS", description="JWT 토큰 만료 시간(시간)"
    )

    # API 설정
    api_host: str = Field(
        default="0.0.0.0", env="API_HOST", description="API 서버 호스트"
    )
    api_port: int = Field(default=8000, env="API_PORT", description="API 서버 포트")
    api_debug: bool = Field(
        default=False, env="API_DEBUG", description="API 디버그 모드"
    )

    # CORS 설정
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"],
        env="ALLOWED_ORIGINS",
        description="CORS 허용 도메인",
    )
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"],
        env="CORS_ORIGINS",
        description="CORS 허용 도메인",
    )

    # 로깅 설정
    log_level: str = Field(default="INFO", env="LOG_LEVEL", description="로깅 레벨")

    # 외부 서비스 설정
    clerk_secret_key: Optional[str] = Field(
        default=None, env="CLERK_SECRET_KEY", description="Clerk 인증 서비스 시크릿 키"
    )

    # Pydantic v2 설정 (통합)
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "allow",  # 추가 필드 허용
    }


# 전역 설정 인스턴스 (타입 힌트를 조건부로 처리)
if TYPE_CHECKING or not IS_TEST_ENV:
    _settings: Optional[CommonSettings] = None
else:
    _settings = None


def get_settings() -> CommonSettings:
    """설정 인스턴스를 반환합니다 (싱글톤 패턴)"""
    global _settings
    if _settings is None:
        _settings = CommonSettings()
    return _settings


# 전역으로 사용할 수 있는 settings 인스턴스
settings = get_settings()
