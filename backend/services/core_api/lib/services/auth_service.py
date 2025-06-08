"""
인증 서비스

Prisma ORM을 사용하여 사용자 인증 및 권한 관리를 처리합니다.
"""
import os
import jwt
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

# JWT 설정
JWT_SECRET = os.environ.get("JWT_SECRET", "your-super-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION = 60 * 24  # 24시간

class AuthService:
    """
    인증 서비스 클래스
    사용자 인증, 토큰 관리, 권한 조회 등의 기능을 제공합니다.
    """

    async def get_user_by_clerk_id(self, clerk_id: str, db):
        """Clerk ID로 사용자 정보 조회"""
        user = await db.user.find_first(
            where={"clerk_id": clerk_id},
            include={
                "memberships": {
                    "include": {
                        "organization": True,
                        "role": True,
                    },
                },
            },
        )
        return user

    async def get_user_permissions(self, user_id: str, db) -> List[Any]:
        """사용자 ID로 권한 목록 조회"""
        # 사용자에게 직접 할당된 권한 조회
        user_permissions = await db.user_permission.find_many(
            where={"user_id": user_id},
            include={
                "permission": True,
            },
        )

        # 사용자 역할을 통한 권한 조회
        role_permissions = await db.organization_member.find_many(
            where={"user_id": user_id},
            include={
                "role": {
                    "include": {
                        "permissions": {
                            "include": {
                                "permission": True,
                            },
                        },
                    },
                },
            },
        )

        # 역할 기반 권한 추출
        role_based_permissions = []
        for member in role_permissions:
            if member.role and member.role.permissions:
                for permission in member.role.permissions:
                    role_based_permissions.append(permission.permission)

        # 사용자 직접 권한 추출
        direct_permissions = [up.permission for up in user_permissions]

        # 권한 병합하여 중복 제거
        all_permissions = direct_permissions + role_based_permissions
        unique_permissions = []
        permission_ids = set()

        for perm in all_permissions:
            if perm.id not in permission_ids:
                permission_ids.add(perm.id)
                unique_permissions.append(perm)

        return unique_permissions

    async def generate_access_token(self, user_id: str, organization_id: Optional[str] = None, db = None) -> Dict[str, Any]:
        """액세스 토큰 생성"""
        user = await db.user.find_unique(
            where={"id": user_id},
        )

        if not user:
            raise ValueError("사용자를 찾을 수 없습니다.")

        # 토큰 데이터 준비
        token_data = {"user_id": user.id}

        # 조직 및 권한 정보 추가
        if organization_id:
            membership = await db.organization_member.find_first(
                where={
                    "user_id": user.id,
                    "organization_id": organization_id,
                },
                include={
                    "role": True,
                },
            )

            if membership:
                token_data["organization_id"] = organization_id
                token_data["role_id"] = membership.role_id
                if membership.role:
                    token_data["role_name"] = membership.role.name

                # 권한 목록 추가
                permissions = await self.get_user_permissions(user.id, db)
                token_data["permissions"] = [p.name for p in permissions]

        # 토큰 서명
        expires_in = JWT_EXPIRATION * 60  # 분 단위를 초 단위로 변환
        token = jwt.encode(
            {
                **token_data,
                "exp": datetime.utcnow() + timedelta(seconds=expires_in)
            },
            JWT_SECRET,
            algorithm=JWT_ALGORITHM
        )

        # 로그인 시간 업데이트
        await db.user.update(
            where={"id": user.id},
            data={
                "last_login": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            },
        )

        # 인증 로그 기록
        await db.auth_log.create(
            data={
                "user_id": user.id,
                "action": "login",
                "success": True,
            },
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": expires_in,
            "user_id": user.id,
        }

    def validate_token(self, token: str) -> Optional[Dict[str, Any]]:
        """토큰 검증"""
        try:
            return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except jwt.PyJWTError:
            return None
