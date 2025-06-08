"""
CSRF 보호 및 보안 헤더
"""
import secrets
from typing import Optional
from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
import hashlib
import time

class CSRFProtection:
    """CSRF 보호 클래스"""
    
    def __init__(self, secret_key: str, token_length: int = 32):
        self.secret_key = secret_key
        self.token_length = token_length
        self.token_name = "csrf_token"
        self.header_name = "X-CSRF-Token"
    
    def generate_token(self) -> str:
        """CSRF 토큰 생성"""
        return secrets.token_urlsafe(self.token_length)
    
    def generate_signed_token(self, session_id: str) -> str:
        """서명된 CSRF 토큰 생성"""
        timestamp = str(int(time.time()))
        token = secrets.token_urlsafe(self.token_length)
        
        # 서명 생성
        message = f"{session_id}:{timestamp}:{token}"
        signature = hashlib.sha256(
            f"{message}:{self.secret_key}".encode()
        ).hexdigest()
        
        return f"{timestamp}:{token}:{signature}"
    
    def verify_signed_token(
        self, 
        token: str, 
        session_id: str, 
        max_age: int = 3600
    ) -> bool:
        """서명된 CSRF 토큰 검증"""
        try:
            parts = token.split(":")
            if len(parts) != 3:
                return False
            
            timestamp, token_value, signature = parts
            
            # 시간 확인
            token_age = int(time.time()) - int(timestamp)
            if token_age > max_age:
                return False
            
            # 서명 확인
            message = f"{session_id}:{timestamp}:{token_value}"
            expected_signature = hashlib.sha256(
                f"{message}:{self.secret_key}".encode()
            ).hexdigest()
            
            return secrets.compare_digest(signature, expected_signature)
            
        except Exception:
            return False
    
    def get_token_from_request(self, request: Request) -> Optional[str]:
        """요청에서 CSRF 토큰 추출"""
        # 헤더에서 확인
        token = request.headers.get(self.header_name)
        if token:
            return token
        
        # 폼 데이터에서 확인
        if hasattr(request, "form"):
            form_data = request.form()
            if form_data:
                return form_data.get(self.token_name)
        
        # JSON 바디에서 확인
        if hasattr(request, "json"):
            try:
                json_data = request.json()
                if json_data and isinstance(json_data, dict):
                    return json_data.get(self.token_name)
            except:
                pass
        
        return None


class SecurityHeaders:
    """보안 헤더 설정"""
    
    @staticmethod
    def set_security_headers(response: Response):
        """보안 헤더 추가"""
        # HTTPS 강제
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # XSS 보호
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # 컨텐츠 타입 스니핑 방지
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # 클릭재킹 방지
        response.headers["X-Frame-Options"] = "DENY"
        
        # Referrer 정책
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # 권한 정책
        response.headers["Permissions-Policy"] = (
            "accelerometer=(), camera=(), geolocation=(), "
            "gyroscope=(), magnetometer=(), microphone=(), "
            "payment=(), usb=()"
        )
        
        # CSP (Content Security Policy)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://api.cargoro.com; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )
        
        return response


class SecureSession:
    """안전한 세션 관리"""
    
    def __init__(self, secret_key: str):
        self.secret_key = secret_key
    
    def create_session_id(self) -> str:
        """세션 ID 생성"""
        return secrets.token_urlsafe(32)
    
    def create_secure_cookie(
        self, 
        name: str, 
        value: str,
        max_age: int = 3600,
        httponly: bool = True,
        secure: bool = True,
        samesite: str = "Strict"
    ) -> str:
        """보안 쿠키 생성"""
        # 서명 추가
        timestamp = str(int(time.time()))
        signature = hashlib.sha256(
            f"{value}:{timestamp}:{self.secret_key}".encode()
        ).hexdigest()
        
        signed_value = f"{value}:{timestamp}:{signature}"
        
        # 쿠키 속성
        cookie_parts = [
            f"{name}={signed_value}",
            f"Max-Age={max_age}",
            "Path=/",
        ]
        
        if httponly:
            cookie_parts.append("HttpOnly")
        
        if secure:
            cookie_parts.append("Secure")
        
        if samesite:
            cookie_parts.append(f"SameSite={samesite}")
        
        return "; ".join(cookie_parts)
    
    def verify_secure_cookie(self, cookie_value: str, max_age: int = 3600) -> Optional[str]:
        """보안 쿠키 검증"""
        try:
            parts = cookie_value.split(":")
            if len(parts) != 3:
                return None
            
            value, timestamp, signature = parts
            
            # 시간 확인
            cookie_age = int(time.time()) - int(timestamp)
            if cookie_age > max_age:
                return None
            
            # 서명 확인
            expected_signature = hashlib.sha256(
                f"{value}:{timestamp}:{self.secret_key}".encode()
            ).hexdigest()
            
            if secrets.compare_digest(signature, expected_signature):
                return value
            
            return None
            
        except Exception:
            return None


# CORS 보안 설정
def get_cors_config(allowed_origins: list = None):
    """CORS 설정 반환"""
    if allowed_origins is None:
        # 프로덕션에서는 특정 도메인만 허용
        allowed_origins = [
            "https://cargoro.com",
            "https://www.cargoro.com",
            "https://app.cargoro.com",
        ]
    
    return {
        "allow_origins": allowed_origins,
        "allow_credentials": True,
        "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": [
            "Content-Type",
            "Authorization",
            "X-CSRF-Token",
            "X-Request-ID",
        ],
        "expose_headers": [
            "X-Total-Count",
            "X-Page-Count",
            "X-Current-Page",
            "X-Per-Page",
        ],
        "max_age": 86400,  # 24시간
    }


# 보안 미들웨어
async def security_middleware(request: Request, call_next):
    """통합 보안 미들웨어"""
    # 요청 ID 추가
    request_id = request.headers.get("X-Request-ID", secrets.token_urlsafe(16))
    
    # IP 차단 확인
    from .rate_limit import ip_blocklist
    client_ip = request.client.host if request.client else "unknown"
    is_blocked, reason = ip_blocklist.is_blocked(client_ip)
    
    if is_blocked:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": reason}
        )
    
    # 의심스러운 활동 확인
    from .validation import InputValidator
    from .rate_limit import activity_detector
    
    # URL 경로 확인
    if InputValidator.check_path_traversal(str(request.url)):
        activity_detector.check_suspicious_pattern(client_ip, "path_traversal")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "잘못된 요청입니다"}
        )
    
    # 쿼리 파라미터 확인
    for param, value in request.query_params.items():
        if InputValidator.check_sql_injection(value):
            activity_detector.check_suspicious_pattern(client_ip, "sql_injection")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "잘못된 파라미터입니다"}
            )
    
    # 응답 처리
    response = await call_next(request)
    
    # 보안 헤더 추가
    SecurityHeaders.set_security_headers(response)
    
    # 요청 ID 헤더 추가
    response.headers["X-Request-ID"] = request_id
    
    return response


# HTTPS 리다이렉트 미들웨어
async def https_redirect_middleware(request: Request, call_next):
    """HTTP를 HTTPS로 리다이렉트"""
    # 개발 환경에서는 비활성화
    if request.url.hostname in ["localhost", "127.0.0.1"]:
        return await call_next(request)
    
    # X-Forwarded-Proto 헤더 확인 (프록시/로드밸런서 뒤에 있을 때)
    forwarded_proto = request.headers.get("X-Forwarded-Proto", "")
    
    if forwarded_proto == "http" or (
        not forwarded_proto and request.url.scheme == "http"
    ):
        # HTTPS로 리다이렉트
        https_url = request.url.replace(scheme="https")
        return JSONResponse(
            status_code=status.HTTP_301_MOVED_PERMANENTLY,
            headers={"Location": str(https_url)}
        )
    
    return await call_next(request)
