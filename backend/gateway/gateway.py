"""
간단한 CarGoro GraphQL 게이트웨이

카고로 마이크로서비스들을 통합하는 GraphQL API 게이트웨이입니다.
"""

import os
import sys
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
import json

# FastAPI 앱 생성
app = FastAPI(
    title="CarGoro GraphQL Gateway",
    description="카고로 마이크로서비스 통합 API 게이트웨이",
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

# 마이크로서비스 엔드포인트 설정 (새로운 포트 체계)
SERVICES = {
    "core_api": "http://localhost:8301",
    "repair_api": "http://localhost:8302",
    "fleet_api": "http://localhost:8303",
    "parts_api": "http://localhost:8304",
    "admin_api": "http://localhost:8305",
    "delivery_api": "http://localhost:8308",
}


# 기본 엔드포인트
@app.get("/")
async def root():
    return {
        "service": "CarGoro GraphQL Gateway",
        "version": "0.1.0",
        "status": "운영 중",
        "services": SERVICES,
        "docs": "/docs",
    }


# 헬스 체크 엔드포인트
@app.get("/health")
async def health_check():
    """게이트웨이 및 모든 마이크로서비스의 상태를 확인합니다."""
    service_status = {}

    async with httpx.AsyncClient() as client:
        for service_name, service_url in SERVICES.items():
            try:
                response = await client.get(f"{service_url}/health", timeout=5.0)
                if response.status_code == 200:
                    service_status[service_name] = {
                        "status": "healthy",
                        "url": service_url,
                        "response_time": response.elapsed.total_seconds(),
                    }
                else:
                    service_status[service_name] = {
                        "status": "unhealthy",
                        "url": service_url,
                        "error": f"HTTP {response.status_code}",
                    }
            except Exception as e:
                service_status[service_name] = {
                    "status": "unreachable",
                    "url": service_url,
                    "error": str(e),
                }

    # 전체 상태 판단
    healthy_services = sum(
        1 for status in service_status.values() if status["status"] == "healthy"
    )
    total_services = len(SERVICES)

    overall_status = "healthy" if healthy_services == total_services else "degraded"
    if healthy_services == 0:
        overall_status = "unhealthy"

    return {
        "status": overall_status,
        "services": service_status,
        "summary": f"{healthy_services}/{total_services} services healthy",
        "environment": os.getenv("ENV", "development"),
    }


# API 프록시 엔드포인트들
@app.get("/api/core/{path:path}")
async def proxy_core_api(path: str):
    """Core API로 요청을 프록시합니다."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{SERVICES['core_api']}/{path}")
            return response.json()
        except Exception as e:
            return {"error": f"Core API 요청 실패: {str(e)}"}


@app.get("/api/repair/{path:path}")
async def proxy_repair_api(path: str):
    """Repair API로 요청을 프록시합니다."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{SERVICES['repair_api']}/{path}")
            return response.json()
        except Exception as e:
            return {"error": f"Repair API 요청 실패: {str(e)}"}


@app.get("/api/fleet/{path:path}")
async def proxy_fleet_api(path: str):
    """Fleet API로 요청을 프록시합니다."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{SERVICES['fleet_api']}/{path}")
            return response.json()
        except Exception as e:
            return {"error": f"Fleet API 요청 실패: {str(e)}"}


@app.get("/api/parts/{path:path}")
async def proxy_parts_api(path: str):
    """Parts API로 요청을 프록시합니다."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{SERVICES['parts_api']}/{path}")
            return response.json()
        except Exception as e:
            return {"error": f"Parts API 요청 실패: {str(e)}"}


# GraphQL 스타일 통합 쿼리 엔드포인트
@app.get("/graphql/services")
async def get_all_services_info():
    """모든 마이크로서비스의 정보를 통합해서 반환합니다."""
    results = {}

    async with httpx.AsyncClient() as client:
        for service_name, service_url in SERVICES.items():
            try:
                response = await client.get(f"{service_url}/api/info", timeout=5.0)
                if response.status_code == 200:
                    results[service_name] = response.json()
                else:
                    results[service_name] = {"error": f"HTTP {response.status_code}"}
            except Exception as e:
                results[service_name] = {"error": str(e)}

    return {
        "gateway": {
            "name": "CarGoro GraphQL Gateway",
            "version": "0.1.0",
            "status": "running",
        },
        "services": results,
    }


# 서버 실행
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8300, help="Port to run the server on")
    args = parser.parse_args()

    port = int(os.getenv("PORT", str(args.port)))
    print(f"🌐 CarGoro GraphQL Gateway를 포트 {port}에서 시작합니다...")
    print(f"📖 API 문서: http://localhost:{port}/docs")
    print(f"💚 헬스 체크: http://localhost:{port}/health")
    print(f"🔗 서비스 통합 정보: http://localhost:{port}/graphql/services")

    uvicorn.run(app, host="0.0.0.0", port=port, reload=False, log_level="info")
