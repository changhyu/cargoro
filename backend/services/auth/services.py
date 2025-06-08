"""
인증 및 권한 관련 서비스

사용자 인증, 토큰 관리, 권한 검사 등의 기능을 제공합니다.
"""

import jwt
from fastapi import HTTPException, status
from datetime import datetime, timedelta
from passlib.context import CryptContext
from typing import Dict, List, Optional, Any

# 비밀번호 해싱 컨텍스트
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT 설정
SECRET_KEY = "your_super_secret_key_change_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# 비밀번호 해싱 및 검증 함수
def hash_password(password: str) -> str:
    """
    비밀번호를 안전하게 해싱하여 반환

    Args:
        password: 원본 비밀번호

    Returns:
        해싱된 비밀번호
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    비밀번호가 해시된 비밀번호와 일치하는지 확인

    Args:
        plain_password: 검증할 원본 비밀번호
        hashed_password: 저장된 해시 비밀번호

    Returns:
        비밀번호 일치 여부
    """
    return pwd_context.verify(plain_password, hashed_password)


# 토큰 관련 함수
async def create_token(user_data: Dict[str, Any]) -> str:
    """
    사용자 데이터로 JWT 토큰 생성

    Args:
        user_data: 토큰에 저장할 사용자 정보

    Returns:
        생성된 JWT 토큰
    """
    to_encode = {
        "sub": str(user_data["id"]),
        "role": user_data.get("role", "user"),
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def verify_token(token: str) -> bool:
    """
    JWT 토큰의 유효성 검증

    Args:
        token: 검증할 JWT 토큰

    Returns:
        토큰 유효성 여부

    Raises:
        HTTPException: 토큰이 유효하지 않은 경우
    """
    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return True
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="인증 실패: 유효하지 않은 토큰",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_user_from_token(token: str) -> Dict[str, Any]:
    """
    토큰에서 사용자 정보를 추출하고 사용자 데이터 반환

    Args:
        token: JWT 토큰

    Returns:
        사용자 정보

    Raises:
        HTTPException: 토큰이 유효하지 않거나 사용자를 찾을 수 없는 경우
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="인증 실패: 유효하지 않은 토큰",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="인증 실패: 유효하지 않은 토큰",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 사용자 ID로 사용자 정보 조회
    user = await get_user_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"사용자 ID {user_id}를 찾을 수 없습니다",
        )

    return user


# 권한 관련 함수
def check_permission(user: Dict[str, Any], required_permission: str) -> bool:
    """
    사용자가 특정 권한을 가지고 있는지 확인

    Args:
        user: 사용자 정보
        required_permission: 필요한 권한

    Returns:
        권한 보유 여부
    """
    # 슈퍼관리자는 모든 권한을 가짐
    if user.get("role") in ["superadmin", "admin"]:
        return True

    # 사용자 권한 목록 확인
    user_permissions = user.get("permissions", [])
    return required_permission in user_permissions


# 사용자 조회 함수 (데이터베이스 연동 필요)
async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """
    사용자 ID로 사용자 정보 조회

    이 함수는 실제 구현에서 데이터베이스 연동이 필요합니다.
    테스트를 위해 Mock 구현을 사용합니다.

    Args:
        user_id: 조회할 사용자 ID

    Returns:
        사용자 정보 또는 없을 경우 None
    """
    # 테스트용 Mock 사용자 데이터
    # 실제 구현에서는 DB 조회 로직으로 대체
    if user_id == "user-1":
        return {
            "id": "user-1",
            "email": "test@cargoro.com",
            "name": "테스트 사용자",
            "role": "admin",
            "permissions": ["read:all", "write:all"],
        }
    return None
