from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from datetime import datetime
from typing import Optional
import os
import logging
from prisma import Prisma

# 환경 변수 로드
SECRET_KEY = os.getenv("JWT_SECRET", "토큰_생성에_사용할_시크릿_키_실제_환경에서는_환경변수로_관리")
ALGORITHM = "HS256"

# OAuth2 스키마
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

# 로깅 설정
logger = logging.getLogger("core-api")

# 데이터베이스 연결 의존성 (Prisma ORM)
async def get_db():
    prisma = Prisma()
    await prisma.connect()
    try:
        yield prisma
    finally:
        await prisma.disconnect()

# 현재 인증된 사용자 가져오기
async def get_current_user(token: str = Depends(oauth2_scheme), prisma: Prisma = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="유효하지 않은 인증 정보",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # 토큰 디코딩
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")

        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError as e:
        logger.error(f"토큰 검증 오류: {str(e)}")
        raise credentials_exception

    # 사용자 조회
    user = await prisma.user.find_unique(
        where={"id": user_id}
    )

    if user is None or not user.isActive:
        raise credentials_exception

    return user

# 관리자 권한 확인 의존성
async def admin_required(current_user = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 작업을 수행할 권한이 없습니다. 관리자 권한이 필요합니다."
        )
    return current_user

# 특정 권한 확인 의존성
def permission_required(required_permission: str):
    async def check_permission(
        current_user = Depends(get_current_user),
        prisma: Prisma = Depends(get_db)
    ):
        # 관리자는 모든 권한을 가짐
        if current_user.role == UserRole.ADMIN:
            return current_user

        # 역할 기반 권한 조회
        role_permissions = await prisma.rolepermission.find_many(
            where={"role": current_user.role},
            include={"permission": True}
        )

        # 사용자 특정 권한 조회
        user_permissions = await prisma.userpermission.find_many(
            where={"userId": current_user.id, "granted": True},
            include={"permission": True}
        )

        # 권한 목록 생성
        permission_codes = set()
        for rp in role_permissions:
            permission_codes.add(rp.permission.code)

        for up in user_permissions:
            permission_codes.add(up.permission.code)

        # 권한 확인
        if required_permission not in permission_codes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"이 작업을 수행할 권한이 없습니다. '{required_permission}' 권한이 필요합니다."
            )

        return current_user

    return check_permission

# 권한 확인 헬퍼 함수
async def has_permission(user, permission_code: str, prisma: Prisma) -> bool:
    """사용자가 특정 권한을 가지고 있는지 확인"""
    from prisma.models import UserRole

    # 관리자는 모든 권한을 가짐
    if user.role == UserRole.ADMIN:
        return True

    # 역할 기반 권한 조회
    role_permissions = await prisma.rolepermission.find_many(
        where={"role": user.role},
        include={"permission": True}
    )

    # 사용자 특정 권한 조회
    user_permissions = await prisma.userpermission.find_many(
        where={"userId": user.id, "granted": True},
        include={"permission": True}
    )

    # 권한 목록 생성
    permission_codes = set()
    for rp in role_permissions:
        permission_codes.add(rp.permission.code)

    for up in user_permissions:
        permission_codes.add(up.permission.code)

    return permission_code in permission_codes

# 조직 관리자 권한 확인 함수
async def has_organization_admin(user, organization_id: str, prisma: Prisma) -> bool:
    """사용자가 특정 조직의 관리자 권한을 가지고 있는지 확인"""
    from prisma.enums import UserRole

    # 시스템 관리자는 모든 조직에 대한 권한을 가짐
    if user.role == UserRole.ADMIN:
        return True

    # 조직 멤버십 확인
    membership = await prisma.organizationmember.find_first(
        where={
            "userId": user.id,
            "organizationId": organization_id,
            "isActive": True
        }
    )

    if not membership:
        return False

    # 조직 관리자 또는 매니저 권한 확인
    return membership.role in [UserRole.ADMIN, UserRole.MANAGER]
