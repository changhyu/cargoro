"""
환경 설정 관리
"""
from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    """애플리케이션 설정"""
    
    # 환경
    environment: str = "development"
    debug: bool = True
    
    # 서버
    host: str = "0.0.0.0"
    port: int = 8004
    workers: int = 1
    
    # 데이터베이스
    database_url: str = "postgresql://postgres:password@localhost:5432/cargoro_rental"
    db_pool_size: int = 10
    db_max_overflow: int = 20
    
    # JWT
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # 보안
    csrf_secret_key: str = "csrf-secret-key"
    session_secret_key: str = "session-secret-key"
    bcrypt_rounds: int = 12
    
    # CORS
    cors_allowed_origins: List[str] = ["*"]
    cors_allow_credentials: bool = True
    cors_allowed_methods: List[str] = ["*"]
    cors_allowed_headers: List[str] = ["*"]
    
    # Rate Limiting
    rate_limit_enabled: bool = True
    rate_limit_storage: str = "memory://"  # 또는 "redis://localhost:6379"
    
    # 로깅
    log_level: str = "INFO"
    log_format: str = "json"  # "json" 또는 "text"
    
    # 파일 업로드
    max_upload_size: int = 10 * 1024 * 1024  # 10MB
    allowed_upload_extensions: List[str] = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"]
    upload_directory: str = "uploads"
    
    # 이메일 (선택사항)
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = 587
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_tls: bool = True
    email_from: str = "noreply@cargoro.com"
    
    # SMS (선택사항)
    sms_api_key: Optional[str] = None
    sms_from: str = "CarGoro"
    
    # 외부 API
    google_maps_api_key: Optional[str] = None
    payment_gateway_api_key: Optional[str] = None
    
    # 보안 헤더
    hsts_max_age: int = 31536000  # 1년
    csp_enabled: bool = True
    
    # 세션
    session_lifetime: int = 86400  # 24시간
    session_cookie_secure: bool = True
    session_cookie_httponly: bool = True
    session_cookie_samesite: str = "Strict"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        
    def is_production(self) -> bool:
        """프로덕션 환경 여부"""
        return self.environment.lower() == "production"
    
    def is_development(self) -> bool:
        """개발 환경 여부"""
        return self.environment.lower() == "development"
    
    def get_database_url(self) -> str:
        """데이터베이스 URL 반환"""
        # 환경 변수에서 DATABASE_URL 우선 사용
        return os.getenv("DATABASE_URL", self.database_url)
    
    def get_cors_origins(self) -> List[str]:
        """CORS 허용 도메인 반환"""
        if self.is_production():
            return [
                "https://cargoro.com",
                "https://www.cargoro.com",
                "https://app.cargoro.com",
            ]
        return self.cors_allowed_origins
    
    def get_trusted_hosts(self) -> List[str]:
        """신뢰할 수 있는 호스트 반환"""
        if self.is_production():
            return [
                "api.cargoro.com",
                "*.cargoro.com",
                "localhost",
            ]
        return ["*"]
    
    def validate_environment(self):
        """환경 설정 검증"""
        errors = []
        
        # 프로덕션 환경 검증
        if self.is_production():
            if self.secret_key == "your-secret-key-here":
                errors.append("프로덕션 환경에서는 SECRET_KEY를 변경해야 합니다")
            
            if self.debug:
                errors.append("프로덕션 환경에서는 DEBUG를 False로 설정해야 합니다")
            
            if "*" in self.cors_allowed_origins:
                errors.append("프로덕션 환경에서는 CORS_ALLOWED_ORIGINS를 특정 도메인으로 제한해야 합니다")
            
            if not self.session_cookie_secure:
                errors.append("프로덕션 환경에서는 SESSION_COOKIE_SECURE를 True로 설정해야 합니다")
        
        # 필수 설정 확인
        if len(self.secret_key) < 32:
            errors.append("SECRET_KEY는 최소 32자 이상이어야 합니다")
        
        if errors:
            raise ValueError("환경 설정 오류:\n" + "\n".join(errors))


# 전역 설정 인스턴스
settings = Settings()

# 환경 설정 검증
try:
    settings.validate_environment()
except ValueError as e:
    import warnings
    warnings.warn(str(e))
