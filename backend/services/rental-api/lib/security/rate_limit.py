"""
Rate Limiting 설정
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi import Request, Response
from fastapi.responses import JSONResponse
import redis
from typing import Optional

# Redis 클라이언트 (선택적)
try:
    redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)
    redis_client.ping()
    REDIS_AVAILABLE = True
except:
    redis_client = None
    REDIS_AVAILABLE = False

# Rate limiter 설정
def get_real_client_ip(request: Request) -> str:
    """실제 클라이언트 IP 추출"""
    # X-Forwarded-For 헤더 확인 (프록시/로드밸런서 뒤에 있을 때)
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    
    # X-Real-IP 헤더 확인
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # 기본 클라이언트 IP
    return request.client.host if request.client else "127.0.0.1"

# Limiter 인스턴스 생성
limiter = Limiter(
    key_func=get_real_client_ip,
    default_limits=["200 per hour", "50 per minute"],
    storage_uri="redis://localhost:6379" if REDIS_AVAILABLE else "memory://",
    headers_enabled=True  # X-RateLimit 헤더 추가
)

# Rate limit 초과 시 응답 커스터마이징
async def custom_rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> Response:
    response = JSONResponse(
        status_code=429,
        content={
            "detail": "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
            "error": "rate_limit_exceeded"
        }
    )
    response.headers["Retry-After"] = str(exc.retry_after)
    response.headers["X-RateLimit-Limit"] = str(exc.limit)
    response.headers["X-RateLimit-Remaining"] = "0"
    response.headers["X-RateLimit-Reset"] = str(exc.reset)
    return response

# 특정 엔드포인트별 rate limit 설정
RATE_LIMITS = {
    "auth": {
        "login": "5 per minute",  # 로그인: 분당 5회
        "register": "3 per hour",  # 회원가입: 시간당 3회
        "change_password": "3 per hour",  # 비밀번호 변경: 시간당 3회
    },
    "payment": {
        "process": "10 per minute",  # 결제 처리: 분당 10회
        "refund": "5 per hour",  # 환불: 시간당 5회
    },
    "api": {
        "default": "100 per minute",  # 기본 API: 분당 100회
        "search": "30 per minute",  # 검색: 분당 30회
        "export": "10 per hour",  # 내보내기: 시간당 10회
    }
}

# IP 기반 차단 리스트 관리
class IPBlocklist:
    def __init__(self):
        self.blocked_ips = set()
        self.temp_blocked = {}  # IP: (block_until_timestamp, reason)
    
    def block_ip(self, ip: str, duration_minutes: int = 30, reason: str = ""):
        """IP 임시 차단"""
        from datetime import datetime, timedelta
        block_until = datetime.now() + timedelta(minutes=duration_minutes)
        self.temp_blocked[ip] = (block_until, reason)
    
    def unblock_ip(self, ip: str):
        """IP 차단 해제"""
        self.blocked_ips.discard(ip)
        self.temp_blocked.pop(ip, None)
    
    def is_blocked(self, ip: str) -> tuple[bool, Optional[str]]:
        """IP 차단 여부 확인"""
        # 영구 차단 확인
        if ip in self.blocked_ips:
            return True, "영구 차단된 IP입니다"
        
        # 임시 차단 확인
        if ip in self.temp_blocked:
            from datetime import datetime
            block_until, reason = self.temp_blocked[ip]
            if datetime.now() < block_until:
                return True, f"일시적으로 차단되었습니다: {reason}"
            else:
                # 차단 기간 만료
                del self.temp_blocked[ip]
        
        return False, None

# 전역 차단 리스트
ip_blocklist = IPBlocklist()

# 의심스러운 활동 감지
class SuspiciousActivityDetector:
    def __init__(self):
        self.failed_attempts = {}  # IP: [timestamp1, timestamp2, ...]
        self.suspicious_patterns = {}  # IP: {pattern_type: count}
    
    def record_failed_login(self, ip: str):
        """실패한 로그인 시도 기록"""
        from datetime import datetime
        if ip not in self.failed_attempts:
            self.failed_attempts[ip] = []
        
        self.failed_attempts[ip].append(datetime.now())
        
        # 최근 10분간의 시도만 유지
        cutoff = datetime.now().timestamp() - 600  # 10분
        self.failed_attempts[ip] = [
            t for t in self.failed_attempts[ip] 
            if t.timestamp() > cutoff
        ]
        
        # 10분 내 10회 이상 실패 시 차단
        if len(self.failed_attempts[ip]) >= 10:
            ip_blocklist.block_ip(ip, 60, "과도한 로그인 시도")
            return True
        
        return False
    
    def check_suspicious_pattern(self, ip: str, pattern: str):
        """의심스러운 패턴 확인"""
        if ip not in self.suspicious_patterns:
            self.suspicious_patterns[ip] = {}
        
        if pattern not in self.suspicious_patterns[ip]:
            self.suspicious_patterns[ip][pattern] = 0
        
        self.suspicious_patterns[ip][pattern] += 1
        
        # 패턴별 임계값
        thresholds = {
            "sql_injection": 5,
            "xss_attempt": 5,
            "path_traversal": 3,
            "invalid_token": 10,
            "rate_limit_exceeded": 20
        }
        
        threshold = thresholds.get(pattern, 10)
        if self.suspicious_patterns[ip][pattern] >= threshold:
            ip_blocklist.block_ip(ip, 120, f"의심스러운 활동 감지: {pattern}")
            return True
        
        return False

# 전역 감지기
activity_detector = SuspiciousActivityDetector()
