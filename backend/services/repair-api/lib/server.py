"""
Repair API 서버 설정
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prisma import Prisma

from shared.config.settings import settings
from shared.utils.logging_utils import get_logger

# 라우터 임포트
from lib.routes import repair_requests, workshops

logger = get_logger(__name__)

# Prisma 인스턴스
prisma = Prisma()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    앱 시작 및 종료 시 실행될 로직
    """
    # 앱 시작 시 실행될 코드
    logger.info(f"Repair API 서버 시작 (환경: {settings.ENV})")
    
    try:
        await prisma.connect()
        logger.info("데이터베이스 연결 성공")
    except Exception as e:
        logger.error(f"데이터베이스 연결 실패: {str(e)}")
        raise

    yield

    # 앱 종료 시 실행될 코드
    await prisma.disconnect()
    logger.info("Repair API 서버 종료")

# FastAPI 앱 생성
app = FastAPI(
    title="CarGoro Repair API",
    description="정비 요청 및 정비소 관리 API",
    version="0.1.0",
    docs_url="/api-docs",
    redoc_url="/api-redoc",
    openapi_url="/api-docs.json",
    lifespan=lifespan,
    debug=settings.DEBUG
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(repair_requests.router, prefix="/api/v1")
app.include_router(workshops.router, prefix="/api/v1")

# 헬스 체크 엔드포인트
@app.get("/health")
async def health_check():
    """서버 상태 확인"""
    try:
        # 데이터베이스 연결 확인
        await prisma.execute_raw("SELECT 1")
        db_status = "connected"
    except Exception as e:
        logger.error(f"데이터베이스 상태 확인 실패: {str(e)}")
        db_status = "disconnected"
    
    return {
        "status": "healthy" if db_status == "connected" else "unhealthy",
        "service": "repair-api",
        "version": "0.1.0",
        "database": db_status,
        "environment": settings.ENV
    }

# 루트 엔드포인트
@app.get("/")
async def root():
    """API 정보"""
    return {
        "service": "CarGoro Repair API",
        "version": "0.1.0",
        "description": "정비 요청 및 정비소 관리 API",
        "documentation": {
            "swagger": "/api-docs",
            "redoc": "/api-redoc"
        }
    }
