"""
Swagger/OpenAPI 설정

API 문서화를 위한 OpenAPI 설정을 제공합니다.
"""

from fastapi import FastAPI

# API 태그 메타데이터
tags_metadata = [
    {
        "name": "인증",
        "description": "로그인, 로그아웃, 토큰 관리 등 인증 관련 기능",
    },
    {
        "name": "사용자",
        "description": "사용자 CRUD, 프로필 관리, 비밀번호 변경 등",
    },
    {
        "name": "조직",
        "description": "조직 생성, 수정, 삭제, 멤버 관리 등",
    },
    {
        "name": "권한",
        "description": "사용자 권한, 역할 관리 등",
    },
]


def setup_openapi(app: FastAPI):
    """
    OpenAPI 설정을 FastAPI 앱에 적용합니다.

    Args:
        app: FastAPI 앱 인스턴스
    """

    def custom_openapi():
        if app.openapi_schema:
            return app.openapi_schema

        from fastapi.openapi.utils import get_openapi

        openapi_schema = get_openapi(
            title="CarGoro Core API",
            version="0.1.0",
            description="""
            CarGoro 플랫폼의 핵심 API 서비스입니다.

            이 API는 다음과 같은 기능을 제공합니다:
            - 사용자 인증 및 관리
            - 조직 관리
            - 권한 및 역할 관리
            """,
            routes=app.routes,
        )

        # 보안 스키마 추가
        openapi_schema["components"]["securitySchemes"] = {
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
            }
        }

        app.openapi_schema = openapi_schema
        return app.openapi_schema

    app.openapi = custom_openapi
