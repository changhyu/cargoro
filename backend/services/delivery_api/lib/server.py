"""
FastAPI 서버 설정

FastAPI 앱 설정 및 라우터 등록을 담당합니다.
"""

from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import os
from contextlib import asynccontextmanager
from prisma import Prisma

# 공통 유틸리티 임포트
from shared.utils.logging_utils import setup_logger
from shared.utils.response_utils import ApiException, ErrorResponse
from shared.config.settings import get_settings

# 라우터 임포트
from .routes import delivery_routes
from .routes import driver_schedule_routes
from .routes import route_routes

# 환경 설정 로드
settings = get_settings()

# 로깅 설정
logger = setup_logger("delivery-api")

# Prisma 클라이언트 인스턴스
prisma = Prisma()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    앱 시작 및 종료 시 실행될 로직
    """
    # 앱 시작 시 실행될 코드
    logger.info(f"서버 시작 (환경: {settings.ENV})")
    await prisma.connect()
    logger.info("데이터베이스 연결 성공")

    yield

    # 앱 종료 시 실행될 코드
    await prisma.disconnect()
    logger.info("서버 종료")


# FastAPI 앱 생성
app = FastAPI(
    title="CarGoro Delivery API",
    description="탁송 관리, 기사 일정 관리, 경로 관리, 탁송 이력 관리 API",
    version="0.1.0",
    docs_url="/api-docs",
    redoc_url="/api-redoc",
    openapi_url="/api-docs.json",
    lifespan=lifespan,
    debug=settings.DEBUG,
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# 전역 예외 처리기
@app.exception_handler(ApiException)
async def api_exception_handler(request: Request, exc: ApiException):
    """표준 API 예외 처리기"""
    logger.error(f"API 예외: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            success=False,
            message=exc.message,
            error_code=exc.error_code,
            details=exc.details,
        ).to_dict(),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """요청 유효성 검사 예외 처리기"""
    logger.error(f"유효성 검사 오류: {str(exc)}")

    # 오류 상세 정보 수집
    error_details = {}
    for error in exc.errors():
        field = ".".join([str(loc) for loc in error["loc"][1:]])
        error_details[field] = error["msg"]

    error_response = ErrorResponse(
        success=False,
        message="요청 데이터 유효성 검사 실패",
        error_code="VALIDATION_ERROR",
        details=error_details,
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response.to_dict(),
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """일반 예외 처리기"""
    logger.error(f"처리되지 않은 예외 발생: {str(exc)}")
    error_response = ErrorResponse(
        success=False,
        message="서버 내부 오류가 발생했습니다.",
        error_code="SERVER_ERROR",
        details={"error": str(exc)},
    )
    return JSONResponse(status_code=500, content=error_response.to_dict())


# 라우터 등록
app.include_router(delivery_routes.router)
app.include_router(driver_schedule_routes.router)
app.include_router(route_routes.router)

# 나중에 구현할 라우터들
# app.include_router(delivery_log_routes.router)


# 루트 엔드포인트
@app.get("/")
async def root():
    return {
        "service": "CarGoro Delivery API",
        "version": "0.1.0",
        "status": "운영 중",
        "docs": "/api-docs",
    }


# 헬스 체크 엔드포인트
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected" if prisma is not None else "disconnected",
    }
