"""
FastAPI 서버 설정 (보안 강화)
"""
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from .models import init_db
from .routes import (
    vehicle_routes, 
    customer_routes, 
    rental_contract_routes, 
    lease_contract_routes, 
    reservation_routes, 
    auth_routes, 
    payment_routes
)
from .security.rate_limit import limiter, custom_rate_limit_exceeded_handler
from .security.headers import (
    security_middleware, 
    https_redirect_middleware,
    get_cors_config
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    # 시작 시 DB 초기화
    init_db()
    yield
    # 종료 시 정리 작업


# FastAPI 앱 생성
app = FastAPI(
    title="CarGoro 렌터카/리스 관리 API",
    description="차량 렌탈 및 리스 계약 통합 관리 시스템",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if os.getenv("ENVIRONMENT", "development") == "development" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT", "development") == "development" else None,
)

# Rate limiting 설정
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, custom_rate_limit_exceeded_handler)

# Trusted Host 미들웨어 (Host 헤더 검증)
if os.getenv("ENVIRONMENT") == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "api.cargoro.com",
            "*.cargoro.com",
            "localhost",
        ]
    )

# CORS 설정
if os.getenv("ENVIRONMENT") == "production":
    # 프로덕션: 특정 도메인만 허용
    cors_config = get_cors_config()
else:
    # 개발: 모든 도메인 허용
    cors_config = {
        "allow_origins": ["*"],
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }

app.add_middleware(CORSMiddleware, **cors_config)

# 커스텀 보안 미들웨어
@app.middleware("http")
async def add_security_middleware(request: Request, call_next):
    return await security_middleware(request, call_next)

# HTTPS 리다이렉트 미들웨어 (프로덕션 환경에서만)
if os.getenv("ENVIRONMENT") == "production":
    @app.middleware("http")
    async def add_https_redirect(request: Request, call_next):
        return await https_redirect_middleware(request, call_next)

# 라우터 등록
app.include_router(auth_routes.router)
app.include_router(vehicle_routes.router)
app.include_router(customer_routes.router)
app.include_router(rental_contract_routes.router)
app.include_router(lease_contract_routes.router)
app.include_router(reservation_routes.router)
app.include_router(payment_routes.router)


@app.get("/", include_in_schema=False)
@limiter.limit("10/minute")
def read_root(request: Request):
    """API 루트"""
    return {
        "message": "CarGoro 렌터카/리스 관리 API",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "endpoints": {
            "auth": "/auth",
            "vehicles": "/vehicles",
            "customers": "/customers",
            "rental_contracts": "/rental-contracts",
            "lease_contracts": "/lease-contracts",
            "reservations": "/reservations",
            "payments": "/payments"
        }
    }


@app.get("/health", include_in_schema=False)
@limiter.limit("30/minute")
def health_check(request: Request):
    """헬스 체크"""
    return {
        "status": "healthy",
        "timestamp": int(request.app.state.limiter._storage.get_expiry(
            f"LIMITER/{request.client.host}/health/30/minute"
        ) or 0)
    }


# 404 핸들러
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """404 에러 핸들러"""
    return {
        "detail": "요청한 리소스를 찾을 수 없습니다",
        "path": str(request.url.path)
    }


# 500 핸들러
@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """500 에러 핸들러"""
    # 프로덕션에서는 상세 정보 숨김
    if os.getenv("ENVIRONMENT") == "production":
        return {
            "detail": "내부 서버 오류가 발생했습니다"
        }
    else:
        return {
            "detail": "내부 서버 오류가 발생했습니다",
            "error": str(exc)
        }
