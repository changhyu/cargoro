"""
Fleet API 인증 유틸리티

사용자 인증 및 권한 검증 기능을 제공합니다.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

# HTTP Bearer 토큰 스키마
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Dict:
    """
    현재 인증된 사용자 정보를 반환합니다.

    Args:
        credentials: HTTP Authorization 헤더의 Bearer 토큰

    Returns:
        Dict: 사용자 정보

    Raises:
        HTTPException: 인증 실패 시
    """
    try:
        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="인증 토큰이 필요합니다.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = credentials.credentials

        # TODO: 실제 토큰 검증 로직 구현
        # 현재는 테스트를 위한 간단한 구현
        if not token or token == "invalid":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="유효하지 않은 토큰입니다.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # 모의 사용자 정보 반환 (실제 구현에서는 토큰을 디코딩하여 사용자 정보 추출)
        user_info = {
            "id": "test_user_123",
            "email": "test@example.com",
            "name": "Test User",
            "organization_id": "test_org_123",
            "role": "admin",
        }

        return user_info

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"사용자 인증 중 오류 발생: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="인증 처리 중 서버 오류가 발생했습니다.",
        )


def verify_user_permissions(user: Dict, required_permission: str) -> bool:
    """
    사용자가 필요한 권한을 가지고 있는지 확인합니다.

    Args:
        user: 사용자 정보
        required_permission: 필요한 권한

    Returns:
        bool: 권한 보유 여부
    """
    try:
        # TODO: 실제 권한 검증 로직 구현
        # 현재는 테스트를 위한 간단한 구현
        user_role = user.get("role", "")

        # 관리자는 모든 권한을 가짐
        if user_role == "admin":
            return True

        # 기타 권한 로직 구현 필요
        return False

    except Exception as e:
        logger.error(f"권한 검증 중 오류 발생: {str(e)}")
        return False


def get_user_organization_id(user: Dict) -> Optional[str]:
    """
    사용자의 조직 ID를 반환합니다.

    Args:
        user: 사용자 정보

    Returns:
        Optional[str]: 조직 ID
    """
    return user.get("organization_id")
