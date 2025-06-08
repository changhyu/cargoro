"""
CarGoro FastAPI 서비스

기본 FastAPI 서비스 진입점
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sys
from lib.core import app_setup
from lib.middleware import error_handlers
from lib.routes import api_routes
from shared.utils.response_utils import ApiException, ErrorResponse
from shared.utils.logging_utils import setup_logger
from shared.config.settings import get_settings

# 환경 설정 로드
settings = get_settings()

# 로깅 설정
logger = setup_logger("fastapi-api")

# 애플리케이션 초기화
app = FastAPI(
    title="CarGoro FastAPI", description="기본 FastAPI 서비스", version="0.1.0"
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(api_routes.router)


# 예외 핸들러 등록
@app.exception_handler(ApiException)
async def api_exception_handler(request: Request, exc: ApiException):
    """API 예외 처리기"""
    logger.error(f"API 예외: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            success=False,
            message=exc.message,
            error_code=exc.error_code,
            details=exc.details,
        ).dict(),
    )


# 루트 엔드포인트
@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {"message": "Welcome to CarGoro FastAPI Service"}


# 헬스체크 엔드포인트
@app.get("/health")
async def health():
    """서비스 상태 확인"""
    return {"status": "healthy", "version": "0.1.0"}
