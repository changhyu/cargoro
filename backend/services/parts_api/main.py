"""
간단한 CarGoro Parts API 서버

부품 관리 API 서비스를 위한 최소한의 설정으로 FastAPI 서버를 실행합니다.
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
    title="CarGoro Parts API",
    description="부품 관리 및 재고 관리 API 서비스",
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
        "service": "CarGoro Parts API",
        "version": "0.1.0",
        "status": "운영 중",
        "docs": "/docs",
    }


# 헬스 체크 엔드포인트
@app.get("/health")
async def health_check():
    try:
        from database.db_operations import db

        db_status = (
            "connected"
            if hasattr(db, "is_connected") and db.is_connected()
            else "unknown"
        )
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
        "name": "CarGoro Parts API",
        "version": "0.1.0",
        "description": "부품 관리, 재고 관리, 부품 주문 시스템 API",
        "endpoints": {"health": "/health", "docs": "/docs", "redoc": "/redoc"},
    }


# 부품 목록 조회 (예시 엔드포인트)
@app.get("/parts")
async def get_parts():
    return {
        "message": "부품 목록 조회 API",
        "data": [],
        "note": "실제 구현은 부품 핸들러에서 처리됩니다.",
    }


# 서버 실행
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8304, help="Port to run the server on")
    args = parser.parse_args()

    port = int(os.getenv("PORT", str(args.port)))
    print(f"🔧 CarGoro Parts API 서버를 포트 {port}에서 시작합니다...")
    print(f"📖 API 문서: http://localhost:{port}/docs")
    print(f"💚 헬스 체크: http://localhost:{port}/health")

    uvicorn.run(app, host="0.0.0.0", port=port, reload=False, log_level="info")
