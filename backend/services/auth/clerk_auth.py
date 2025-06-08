"""
Clerk 인증 통합 모듈

Clerk 인증 서비스와 통합하여 인증 및 권한 관리 기능을 제공합니다.
"""

import os
import httpx
from typing import Dict, List, Optional, Any, Union
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Clerk API 설정
CLERK_API_KEY = os.getenv("CLERK_API_KEY", "YOUR_CLERK_API_KEY")
CLERK_API_BASE_URL = os.getenv("CLERK_API_BASE_URL", "https://api.clerk.dev/v1")

# HTTP 보안 의존성
security = HTTPBearer()


class ClerkAuth:
    """Clerk 인증 서비스와 통합하는 클래스"""

    def __init__(self, api_key: str = CLERK_API_KEY, base_url: str = CLERK_API_BASE_URL):
        """
        Clerk 인증 관리자 초기화

        Args:
            api_key: Clerk API 키
            base_url: Clerk API 기본 URL
        """
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    async def get_user_by_token(self, token: str) -> Dict[str, Any]:
        """
        세션 토큰으로 사용자 정보 조회

        Args:
            token: Clerk 세션 토큰

        Returns:
            사용자 정보

        Raises:
            HTTPException: 토큰이 유효하지 않거나 사용자를 찾을 수 없는 경우
        """
        try:
            # 토큰 확인 API 호출
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/sessions/{token}",
                    headers=self.headers
                )

                if response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="인증 실패: 유효하지 않은 토큰",
                        headers={"WWW-Authenticate": "Bearer"},
                    )

                session_data = response.json()
                user_id = session_data.get("user_id")

                if not user_id:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="인증 실패: 사용자 ID를 찾을 수 없음",
                        headers={"WWW-Authenticate": "Bearer"},
                    )

                # 사용자 정보 조회
                user_response = await client.get(
                    f"{self.base_url}/users/{user_id}",
                    headers=self.headers
                )

                if user_response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"사용자 ID {user_id}를 찾을 수 없습니다",
                    )

                user_data = user_response.json()

                # 권한 정보 포함
                user_data["permissions"] = await self.get_user_permissions(user_id)

                return user_data

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"인증 서버 오류: {str(e)}",
            )

    async def get_user_permissions(self, user_id: str) -> List[str]:
        """
        사용자의 권한 목록 조회

        Args:
            user_id: 사용자 ID

        Returns:
            권한 목록
        """
        try:
            # 사용자 메타데이터 조회에서 권한 정보 가져오기
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/users/{user_id}/metadata",
                    headers=self.headers
                )

                if response.status_code != 200:
                    return []

                metadata = response.json()
                permissions = metadata.get("public", {}).get("permissions", [])

                return permissions
        except Exception:
            return []

    async def verify_permission(self, token: str, required_permission: str) -> bool:
        """
        사용자가 특정 권한을 가지고 있는지 확인

        Args:
            token: 인증 토큰
            required_permission: 필요한 권한

        Returns:
            권한 보유 여부
        """
        try:
            user = await self.get_user_by_token(token)

            # 시스템 관리자는 모든 권한을 가짐
            if user.get("public_metadata", {}).get("role") == "admin":
                return True

            # 권한 목록 확인
            permissions = user.get("permissions", [])
            return required_permission in permissions
        except Exception:
            return False

    async def get_current_user(
        self, credentials: HTTPAuthorizationCredentials = Depends(security)
    ) -> Dict[str, Any]:
        """
        현재 요청의 인증된 사용자 정보 반환

        Args:
            credentials: HTTP 인증 정보

        Returns:
            사용자 정보

        Raises:
            HTTPException: 인증에 실패한 경우
        """
        token = credentials.credentials
        return await self.get_user_by_token(token)

    def has_permission(self, permission: str):
        """
        특정 권한이 있는지 확인하는 의존성 함수 생성

        Args:
            permission: 필요한 권한

        Returns:
            의존성 함수
        """
        async def check_permission(
            current_user: Dict[str, Any] = Depends(self.get_current_user)
        ) -> Dict[str, Any]:
            if not await self.verify_permission(current_user.get("id"), permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"권한 부족: {permission} 권한이 필요합니다",
                )
            return current_user
        return check_permission

    def has_role(self, role: str):
        """
        특정 역할이 있는지 확인하는 의존성 함수 생성

        Args:
            role: 필요한 역할

        Returns:
            의존성 함수
        """
        async def check_role(
            current_user: Dict[str, Any] = Depends(self.get_current_user)
        ) -> Dict[str, Any]:
            user_role = current_user.get("public_metadata", {}).get("role", "")
            if user_role != role and user_role != "admin":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"권한 부족: {role} 역할이 필요합니다",
                )
            return current_user
        return check_role

    def get_client_token(self, request: Request) -> Optional[str]:
        """
        요청 헤더에서 인증 토큰 추출

        Args:
            request: FastAPI 요청 객체

        Returns:
            토큰 또는 None
        """
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            return auth_header[7:]
        return None


# 기본 Clerk 인증 객체
clerk_auth = ClerkAuth()

# 편의성 함수 노출
get_current_user = clerk_auth.get_current_user
has_permission = clerk_auth.has_permission
has_role = clerk_auth.has_role
