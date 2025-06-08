"""
GraphQL Gateway 메인 서버
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter

from shared.config.settings import settings
from shared.utils.logging_utils import get_logger
from graphql.schema import create_graphql_router
from middleware.auth import get_current_token

logger = get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    앱 시작 및 종료 시 실행될 로직
    """
    logger.info(f"GraphQL Gateway 서버 시작 (환경: {settings.ENV})")
    yield
    logger.info("GraphQL Gateway 서버 종료")

# FastAPI 앱 생성
app = FastAPI(
    title="CarGoro GraphQL Gateway",
    description="마이크로서비스 통합 GraphQL API Gateway",
    version="0.1.0",
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

# GraphQL 엔드포인트 추가
graphql_app = create_graphql_router()

# 컨텍스트 생성 함수
async def get_context(
    request: Request,
    token: str = Depends(get_current_token)
):
    """GraphQL 컨텍스트 생성"""
    return {
        "request": request,
        "token": token
    }

# GraphQL 라우터 등록
app.include_router(
    graphql_app,
    prefix="/graphql",
    dependencies=[Depends(get_context)]
)

# 헬스 체크 엔드포인트
@app.get("/health")
async def health_check():
    """서버 상태 확인"""
    # 각 마이크로서비스 상태 확인
    services_status = {
        "core-api": "unknown",
        "repair-api": "unknown",
        "parts-api": "unknown",
        "delivery-api": "unknown",
        "fleet-api": "unknown"
    }
    
    # TODO: 실제 서비스 헬스 체크 구현
    
    return {
        "status": "healthy",
        "service": "graphql-gateway",
        "version": "0.1.0",
        "environment": settings.ENV,
        "services": services_status
    }

# 루트 엔드포인트
@app.get("/")
async def root():
    """API 정보"""
    return {
        "service": "CarGoro GraphQL Gateway",
        "version": "0.1.0",
        "description": "마이크로서비스 통합 GraphQL API Gateway",
        "graphql_endpoint": "/graphql",
        "graphql_playground": "/graphql"
    }

# REST API 프록시 (선택적)
@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy_to_services(request: Request, path: str):
    """
    REST API 요청을 해당 마이크로서비스로 프록시
    """
    # TODO: 경로 기반 라우팅 구현
    # 예: /api/auth/* -> core-api
    #     /api/repairs/* -> repair-api
    #     /api/parts/* -> parts-api
    
    return {
        "error": "Not implemented",
        "path": path,
        "message": "REST API 프록시는 아직 구현되지 않았습니다. GraphQL 엔드포인트를 사용해주세요."
    }
