from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from .routes import router
from .websocket_manager import WebSocketManager
import asyncio

# FastAPI 앱 초기화
app = FastAPI(
    title="CarGoro Realtime API",
    description="실시간 통신을 위한 WebSocket API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인만 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(router, prefix="", tags=["realtime"])

# 헬스체크 엔드포인트
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "realtime-api",
        "version": "1.0.0"
    }

# 서버 시작 시 실행
@app.on_event("startup")
async def startup_event():
    print("🚀 CarGoro Realtime API 서버가 시작되었습니다!")
    # WebSocket 매니저의 하트비트 태스크 시작
    # asyncio.create_task(manager.send_heartbeat())

# 서버 종료 시 실행
@app.on_event("shutdown")
async def shutdown_event():
    print("👋 CarGoro Realtime API 서버가 종료됩니다.")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
