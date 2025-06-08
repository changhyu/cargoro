"""
Swagger/OpenAPI 문서 설정

API 문서화를 위한 설정으로, 모든 API 엔드포인트와 모델을 자동으로 문서화합니다.
"""
import json
import os

# package.json에서 버전 정보 가져오기
try:
    with open(os.path.join(os.path.dirname(__file__), '../../../package.json'), 'r') as f:
        package_data = json.load(f)
        version = package_data.get('version', '0.1.0')
except:
    version = '0.1.0'

# FastAPI용 OpenAPI 설정
openapi_config = {
    "title": "CarGoro API",
    "version": version,
    "description": "CarGoro 플랫폼 REST API 문서",
    "license_info": {
        "name": "© 2024 CarGoro. 모든 권리 보유.",
    },
    "contact": {
        "name": "CarGoro 개발팀",
        "email": "dev@cargoro.com",
    },
}

# 서버 설정
servers = [
    {"url": "/api", "description": "현재 서버"},
    {"url": "https://api.cargoro.com", "description": "운영 서버"},
    {"url": "https://api.staging.cargoro.com", "description": "스테이징 서버"},
    {"url": "https://api.dev.cargoro.com", "description": "개발 서버"},
    {"url": "http://localhost:4000", "description": "로컬 개발 서버"},
]

# 보안 스키마 설정
security_schemes = {
    "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
    }
}

# 태그 설정
tags_metadata = [
    {
        "name": "인증",
        "description": "로그인, 회원가입, 토큰 갱신 등 인증 관련 API",
    },
    {
        "name": "사용자",
        "description": "사용자 관리 및 프로필 관련 API",
    },
    {
        "name": "조직",
        "description": "조직 생성, 조회, 멤버 관리 등 조직 관련 API",
    },
    {
        "name": "역할과 권한",
        "description": "역할 및 권한 관리 관련 API",
    },
    {
        "name": "정비소",
        "description": "정비소 관리 및 예약 관련 API",
    },
    {
        "name": "차량",
        "description": "차량 정보 및 상태 관련 API",
    },
    {
        "name": "부품",
        "description": "부품 재고 및 주문 관련 API",
    },
    {
        "name": "탁송",
        "description": "탁송 주문 및 배정 관련 API",
    },
    {
        "name": "시스템",
        "description": "시스템 상태 및 설정 관련 API",
    },
]

# Swagger UI 설정
swagger_ui_config = {
    "swagger_ui_parameters": {
        "docExpansion": "none",
        "filter": True,
        "persistAuthorization": True
    },
    "swagger_ui_oauth2_redirect_url": "/api/docs/oauth2-redirect",
    "swagger_ui_init_oauth": None,
    "swagger_ui_disabled": False,
}

# FastAPI 앱에 적용할 함수
def setup_openapi(app):
    """
    FastAPI 앱에 OpenAPI 및 Swagger UI 설정을 적용합니다.
    """
    app.title = openapi_config["title"]
    app.version = openapi_config["version"]
    app.description = openapi_config["description"]
    app.openapi_tags = tags_metadata

    # Swagger UI 설정
    for key, value in swagger_ui_config.items():
        setattr(app, key, value)

    # 커스텀 OpenAPI 스키마 설정
    def custom_openapi():
        if app.openapi_schema:
            return app.openapi_schema

        openapi_schema = app.openapi()
        # 서버 정보 추가
        openapi_schema["servers"] = servers
        # 보안 스키마 추가
        if "components" not in openapi_schema:
            openapi_schema["components"] = {}
        openapi_schema["components"]["securitySchemes"] = security_schemes
        openapi_schema["security"] = [{"bearerAuth": []}]

        app.openapi_schema = openapi_schema
        return app.openapi_schema

    app.openapi = custom_openapi

    return app
