"""
FastAPI 서버 설정

FastAPI 앱 설정 및 라우터 등록을 담당합니다.
"""

from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.gzip import GZipMiddleware
import os
import logging
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi.exceptions import RequestValidationError
import uvicorn

# 환경 변수 로드
load_dotenv()

# 설정 및 라우터 임포트
from config.swagger import setup_openapi, tags_metadata
from routes.auth_routes import router as auth_router
from routes.user_routes_enhanced import router as user_router
from routes.organization_routes import router as organization_router
from routes.permission_routes import router as permission_router

# 로깅 설정
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("server")

# 환경 변수
ENV = os.getenv("ENV", "development")
DEBUG = ENV != "production"
host = os.getenv("HOST", "0.0.0.0")
port = int(os.getenv("PORT", "8000"))
reload = os.getenv("RELOAD", "False").lower() == "true"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    앱 시작 및 종료 시 실행될 로직
    """
    # 앱 시작 시 실행될 코드
    logger.info(f"서버 시작 (환경: {ENV})")

    yield

    # 앱 종료 시 실행될 코드
    logger.info("서버 종료")


# FastAPI 앱 생성
app = FastAPI(
    title="CarGoro Core API",
    description="인증, 사용자 관리 및 권한 관리 API",
    version="0.1.0",
    docs_url="/api-docs",
    redoc_url="/api-redoc",
    openapi_url="/api-docs.json",
    openapi_tags=tags_metadata,
    lifespan=lifespan,
    debug=DEBUG,
)

# Swagger UI 설정 적용
setup_openapi(app)

# 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if ENV == "development" else ["https://api.cargoro.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)


# 예외 처리기
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """요청 유효성 검사 예외 처리기"""
    logger.error(f"유효성 검사 오류: {str(exc)}")

    # 오류 상세 정보 수집
    error_details = {}
    for error in exc.errors():
        field = ".".join([str(loc) for loc in error["loc"][1:]])
        error_details[field] = error["msg"]

    from shared.utils.response_utils import create_error_response

    return create_error_response(
        message="요청 데이터 유효성 검사 실패",
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        error_code="VALIDATION_ERROR",
        details=error_details,
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """일반 예외 처리기"""
    logger.error(f"처리되지 않은 예외 발생: {str(exc)}")

    from shared.utils.response_utils import create_error_response

    return create_error_response(
        message="서버 내부 오류가 발생했습니다.",
        status_code=500,
        error_code="SERVER_ERROR",
        details={"error": str(exc) if DEBUG else None},
    )


# 라우터 등록
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(organization_router)
app.include_router(permission_router)


# 기본 라우트
@app.get("/", response_class=HTMLResponse)
async def root():
    """기본 홈페이지"""
    return """
    <html>
        <head>
            <title>CarGoro API</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                h1 { color: #333; }
                a { color: #0066cc; }
            </style>
        </head>
        <body>
            <h1>CarGoro API 서버가 실행 중입니다.</h1>
            <p>API 문서는 <a href="/api-docs">여기</a>에서 확인할 수 있습니다.</p>
        </body>
    </html>
    """


# 헬스 체크 엔드포인트
@app.get("/health")
async def health_check():
    """서버 상태 확인"""
    return {"status": "healthy", "environment": ENV}


# 404 처리
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """404 에러 처리"""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "code": "NOT_FOUND",
            "message": "요청한 리소스를 찾을 수 없습니다.",
            "details": {"path": request.url.path},
        },
    )


# 서버 실행 (직접 실행 시에만)
if __name__ == "__main__":
    print(f"FastAPI 서버 시작 중... (Host: {host}, Port: {port})")
    uvicorn.run("server:app", host=host, port=port, reload=reload)
