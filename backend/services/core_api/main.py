"""
간단한 CarGoro Core API 서버

최소한의 설정으로 FastAPI 서버를 실행합니다.
"""

import os
import sys
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 현재 디렉토리를 모듈 검색 경로에 추가
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../"))

# FastAPI 앱 생성
app = FastAPI(
    title="CarGoro Core API",
    description="인증 및 사용자 관리 API 서비스",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 기본 엔드포인트
@app.get("/")
async def root():
    return {
        "service": "CarGoro Core API",
        "version": "0.1.0",
        "status": "운영 중",
        "docs": "/docs",
    }


# 헬스 체크 엔드포인트
@app.get("/health")
async def health_check():
    try:
        # 데이터베이스 연결 상태 확인 시도
        from database.db_operations import get_database, check_database_health

        # 데이터베이스 상태 확인
        db_health = await check_database_health()
        db_status = "connected" if db_health else "disconnected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "database": db_status,
        "environment": os.getenv("ENV", "development"),
    }


# API 정보 엔드포인트
@app.get("/api/info")
async def api_info():
    return {
        "name": "CarGoro Core API",
        "version": "0.1.0",
        "description": "인증, 사용자 관리 및 권한 관리 API",
        "endpoints": {"health": "/health", "docs": "/docs", "redoc": "/redoc"},
    }


# 서버 실행
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8301, help="Port to run the server on")
    args = parser.parse_args()

    port = int(os.getenv("PORT", str(args.port)))
    print(f"🚀 CarGoro Core API 서버를 포트 {port}에서 시작합니다...")
    print(f"📖 API 문서: http://localhost:{port}/docs")
    print(f"💚 헬스 체크: http://localhost:{port}/health")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        reload=False,  # 개발 중에는 True로 설정 가능
        log_level="info",
    )
