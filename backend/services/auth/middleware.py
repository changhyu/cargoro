"""
인증 및 권한 관리 미들웨어

API 엔드포인트에 대한 인증 및 권한 관리를 위한 미들웨어 모듈
"""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Callable, Dict, List, Optional, Any
import logging

from .clerk_auth import clerk_auth

logger = logging.getLogger("auth-middleware")


class AuthMiddleware:
    """인증 및 권한 관리 미들웨어 클래스"""

    def __init__(self):
        """미들웨어 초기화"""
        self.public_paths = set()
        self.protected_paths = {}
        self.role_protected_paths = {}

    def register_public_path(self, path: str, methods: List[str] = None):
        """
        공개 경로 등록 (인증 불필요)

        Args:
            path: API 경로
            methods: HTTP 메소드 목록 (None이면 모든 메소드)
        """
        if methods:
            for method in methods:
                self.public_paths.add(f"{method.upper()}:{path}")
        else:
            self.public_paths.add(f"*:{path}")

    def register_protected_path(self, path: str, permission: str, methods: List[str] = None):
        """
        보호된 경로 등록 (특정 권한 필요)

        Args:
            path: API 경로
            permission: 필요한 권한
            methods: HTTP 메소드 목록 (None이면 모든 메소드)
        """
        if methods:
            for method in methods:
                self.protected_paths[f"{method.upper()}:{path}"] = permission
        else:
            self.protected_paths[f"*:{path}"] = permission

    def register_role_path(self, path: str, role: str, methods: List[str] = None):
        """
        역할 보호 경로 등록 (특정 역할 필요)

        Args:
            path: API 경로
            role: 필요한 역할
            methods: HTTP 메소드 목록 (None이면 모든 메소드)
        """
        if methods:
            for method in methods:
                self.role_protected_paths[f"{method.upper()}:{path}"] = role
        else:
            self.role_protected_paths[f"*:{path}"] = role

    async def __call__(self, request: Request, call_next: Callable):
        """
        미들웨어 핵심 로직

        Args:
            request: FastAPI 요청 객체
            call_next: 다음 미들웨어 호출 함수

        Returns:
            HTTP 응답
        """
        path = request.url.path
        method = request.method

        # 요청 경로 키
        path_key = f"{method}:{path}"
        wildcard_key = f"*:{path}"

        # 공개 경로 확인
        if path_key in self.public_paths or wildcard_key in self.public_paths:
            return await call_next(request)

        # 인증 토큰 확인
        token = clerk_auth.get_client_token(request)
        if not token:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "인증이 필요합니다"},
            )

        try:
            # 보호된 경로 확인
            if path_key in self.protected_paths:
                permission = self.protected_paths[path_key]
                if not await clerk_auth.verify_permission(token, permission):
                    return JSONResponse(
                        status_code=status.HTTP_403_FORBIDDEN,
                        content={"detail": f"권한 부족: {permission} 권한이 필요합니다"},
                    )
            elif wildcard_key in self.protected_paths:
                permission = self.protected_paths[wildcard_key]
                if not await clerk_auth.verify_permission(token, permission):
                    return JSONResponse(
                        status_code=status.HTTP_403_FORBIDDEN,
                        content={"detail": f"권한 부족: {permission} 권한이 필요합니다"},
                    )

            # 역할 보호 경로 확인
            if path_key in self.role_protected_paths or wildcard_key in self.role_protected_paths:
                role = self.role_protected_paths.get(path_key) or self.role_protected_paths.get(wildcard_key)
                user = await clerk_auth.get_user_by_token(token)
                user_role = user.get("public_metadata", {}).get("role", "")

                if user_role != role and user_role != "admin":
                    return JSONResponse(
                        status_code=status.HTTP_403_FORBIDDEN,
                        content={"detail": f"권한 부족: {role} 역할이 필요합니다"},
                    )

            # 인증 및 권한 검사 통과, 다음 핸들러로 진행
            return await call_next(request)

        except HTTPException as e:
            return JSONResponse(
                status_code=e.status_code,
                content={"detail": e.detail},
            )
        except Exception as e:
            logger.error(f"인증 미들웨어 오류: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "서버 오류가 발생했습니다"},
            )


# 기본 인증 미들웨어 인스턴스
auth_middleware = AuthMiddleware()

# 공개 경로 등록 (예시)
auth_middleware.register_public_path("/api/health", ["GET"])
auth_middleware.register_public_path("/api/docs", ["GET"])
auth_middleware.register_public_path("/api/openapi.json", ["GET"])
auth_middleware.register_public_path("/api/auth/login", ["POST"])
auth_middleware.register_public_path("/api/auth/register", ["POST"])

# 보호된 경로 등록 (예시)
auth_middleware.register_protected_path("/api/vehicles", "vehicles:read", ["GET"])
auth_middleware.register_protected_path("/api/vehicles", "vehicles:write", ["POST", "PUT", "PATCH", "DELETE"])
auth_middleware.register_protected_path("/api/vehicles/report", "vehicles:reports", ["GET"])

# 역할 보호 경로 등록 (예시)
auth_middleware.register_role_path("/api/admin", "admin")
auth_middleware.register_role_path("/api/fleet-manager", "fleet_manager")
