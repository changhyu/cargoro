"""
인증 및 권한 관련 미들웨어

이 모듈은 API 요청에 대한 인증, 권한, 역할 확인을 위한 FastAPI 미들웨어를 제공합니다.
"""
import os
from fastapi import Depends, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from typing import List, Optional, Union, Callable
from functools import wraps

from ..utils.response_utils import unauthorized_exception, permission_denied_exception, bad_request_exception
from ..dependencies import get_db
from prisma.models import User

# JWT 설정
JWT_SECRET = os.environ.get("JWT_SECRET", "your-super-secret-key-change-in-production")
security = HTTPBearer()

# 보안 미들웨어 생성
auth_scheme = HTTPBearer()

async def authenticate(credentials: HTTPAuthorizationCredentials = Depends(security), db = Depends(get_db)):
    """
    인증 확인 미들웨어

    요청 헤더의 인증 토큰을 검증하고 사용자 정보를 반환합니다.
    """
    try:
        # 토큰 검증
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])

        # 사용자 ID가 없으면 실패
        if "user_id" not in payload:
            raise unauthorized_exception("유효하지 않은 토큰입니다.")

        # 사용자 정보 조회
        user = await db.user.find_unique(
            where={"id": payload["user_id"]},
            include={
                "permissions": True,
                "memberships": {
                    "include": {
                        "role": True,
                        "organization": True
                    }
                }
            }
        )

        if not user:
            raise unauthorized_exception("사용자를 찾을 수 없습니다.")

        return user
    except jwt.PyJWTError:
        raise unauthorized_exception("인증에 실패했습니다.")

async def require_org_membership(org_id: str, current_user: User = Depends(authenticate)):
    """
    조직 멤버십 확인 미들웨어

    사용자가 특정 조직의 멤버인지 확인합니다.
    """
    if not org_id:
        raise bad_request_exception("조직 ID가 필요합니다.")

    # 사용자의 조직 멤버십 확인
    memberships = current_user.memberships
    is_member = any(membership.organization_id == org_id for membership in memberships)

    if not is_member:
        raise permission_denied_exception("이 조직에 대한 접근")

    return True

def require_permission(required_permission: Union[str, List[str]]):
    """
    권한 확인 미들웨어

    사용자가 특정 권한을 가지고 있는지 확인합니다.
    """
    async def permission_dependency(current_user: User = Depends(authenticate)):
        permissions = [permission.name for permission in current_user.permissions]
        required_permissions = [required_permission] if isinstance(required_permission, str) else required_permission

        has_permission = any(perm in permissions for perm in required_permissions)

        if not has_permission:
            raise permission_denied_exception("이 작업 수행")

        return True

    return permission_dependency

def require_role(roles: Union[str, List[str]], org_id_param: str = "organization_id"):
    """
    역할 확인 미들웨어

    사용자가 특정 역할을 가지고 있는지 확인합니다.
    """
    async def role_dependency(request: Request, current_user: User = Depends(authenticate)):
        required_roles = [roles] if isinstance(roles, str) else roles

        # 요청 경로 또는 쿼리 파라미터에서 조직 ID 추출
        org_id = request.path_params.get(org_id_param) or request.query_params.get(org_id_param)

        if not org_id:
            # 요청 본문에서 조직 ID 추출 시도
            try:
                body = await request.json()
                org_id = body.get(org_id_param)
            except Exception:
                raise bad_request_exception("유효하지 않은 요청 본문입니다.")

        if not org_id:
            raise bad_request_exception("조직 ID가 필요합니다.")

        # 사용자의 조직 멤버십 및 역할 확인
        memberships = current_user.memberships
        membership = next((m for m in memberships if m.organization_id == org_id), None)

        if not membership or not membership.role:
            raise permission_denied_exception("이 조직에 대한 역할")

        # 역할 이름으로 확인
        has_role = membership.role.name in required_roles

        if not has_role:
            raise permission_denied_exception("이 작업을 수행할 적절한 역할")

        return True

    return role_dependency

def require_org_admin(org_id_param: str = "organization_id"):
    """
    조직 오너/관리자 확인 미들웨어

    사용자가 조직의 오너나 관리자인지 확인합니다.
    """
    async def org_admin_dependency(request: Request, current_user: User = Depends(authenticate)):
        # 요청 경로 또는 쿼리 파라미터에서 조직 ID 추출
        org_id = request.path_params.get(org_id_param) or request.query_params.get(org_id_param)

        if not org_id:
            # 요청 본문에서 조직 ID 추출 시도
            try:
                body = await request.json()
                org_id = body.get(org_id_param)
            except Exception:
                raise bad_request_exception("유효하지 않은 요청 본문입니다.")

        if not org_id:
            raise bad_request_exception("조직 ID가 필요합니다.")

        # 사용자의 조직 멤버십 확인
        memberships = current_user.memberships
        membership = next((m for m in memberships if m.organization_id == org_id), None)

        if not membership:
            raise permission_denied_exception("이 조직에 대한 접근")

        # 오너나 관리자인지 확인
        if membership.membership_type != "OWNER" and membership.membership_type != "ADMIN":
            raise permission_denied_exception("조직 관리자 권한")

        return True

    return org_admin_dependency

def require_super_admin():
    """
    슈퍼어드민 확인 미들웨어

    사용자가 시스템 관리자인지 확인합니다.
    """
    return require_permission("system:admin")
