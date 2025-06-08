from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional, Dict, Any
import os
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext

try:
    from clerk_sdk_python import Clerk
except ImportError:
    # Clerk is optional for testing
    Clerk = None
import asyncpg
import json
import logging
import sys

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("core-api")

# 환경 변수 로드
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET = os.getenv("JWT_SECRET", "your-super-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION = 60 * 24  # 24시간

# Clerk 클라이언트 초기화
clerk = Clerk(secret_key=CLERK_SECRET_KEY) if CLERK_SECRET_KEY else None

# 패스워드 해싱 컨텍스트
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 애플리케이션 초기화
app = FastAPI(
    title="CarGoro Core API",
    description="인증, 사용자 관리 및 권한 관리 API",
    version="0.1.0",
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터베이스 연결 풀
db_pool = None


# 모델 정의
class UserBase(BaseModel):
    email: EmailStr
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    phoneNumber: Optional[str] = None
    profileImage: Optional[str] = None


class UserCreate(UserBase):
    clerkId: str


class UserResponse(UserBase):
    id: str
    clerkId: str
    active: bool
    createdAt: datetime
    updatedAt: datetime
    lastLogin: Optional[datetime] = None

    model_config = {"from_attributes": True}


class OrganizationBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    Logo: Optional[str] = None
    tier: str = "free"


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationResponse(OrganizationBase):
    id: str
    active: bool
    createdAt: datetime
    updatedAt: datetime

    model_config = {"from_attributes": True}


class MembershipCreate(BaseModel):
    userId: str
    organizationId: str
    roleId: int
    isOwner: bool = False
    isAdmin: bool = False


class MembershipResponse(BaseModel):
    id: str
    userId: str
    organizationId: str
    roleId: int
    isOwner: bool
    isAdmin: bool
    joinedAt: datetime
    updatedAt: datetime
    status: str

    model_config = {"from_attributes": True}


class PermissionResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    scope: str

    model_config = {"from_attributes": True}


class RoleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    permissions: List[PermissionResponse] = []

    model_config = {"from_attributes": True}


class TokenData(BaseModel):
    userId: str
    organizationId: Optional[str] = None
    roles: List[str] = []
    permissions: List[str] = []
    exp: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


# 애플리케이션 시작 및 종료 이벤트
@app.on_event("startup")
async def startup():
    global db_pool
    try:
        db_pool = await asyncpg.create_pool(DATABASE_URL)
        logger.info("데이터베이스 연결 풀 생성 완료")
    except Exception as e:
        logger.error(f"데이터베이스 연결 풀 생성 실패: {e}")
        raise


@app.on_event("shutdown")
async def shutdown():
    global db_pool
    if db_pool:
        await db_pool.close()
        logger.info("데이터베이스 연결 풀 종료")


# 유틸리티 함수
async def get_db_conn():
    async with db_pool.acquire() as connection:
        yield connection


def create_jwt_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


async def verify_token(token: str, conn):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("userId")
        if user_id is None:
            return None

        # 사용자 존재 확인
        user = await conn.fetchrow(
            "SELECT * FROM users WHERE id = $1 AND active = true", user_id
        )
        if not user:
            return None

        return payload
    except jwt.PyJWTError:
        return None


async def get_user_permissions(user_id: str, organization_id: str, conn):
    # 사용자 역할 가져오기
    role_query = """
    SELECT r.*
    FROM roles r
    JOIN organization_members om ON r.id = om.role_id
    WHERE om.user_id = $1 AND om.organization_id = $2 AND om.status = 'active'
    """
    role = await conn.fetchrow(role_query, user_id, organization_id)

    if not role:
        return []

    # 역할에 할당된 권한 가져오기
    permission_query = """
    SELECT p.*
    FROM permissions p
    JOIN role_permissions rp ON p.id = rp.permission_id
    WHERE rp.role_id = $1
    """
    permissions = await conn.fetch(permission_query, role["id"])

    # 사용자에게 직접 할당된 권한 가져오기
    direct_permission_query = """
    SELECT p.*
    FROM permissions p
    JOIN user_permissions up ON p.id = up.permission_id
    WHERE up.user_id = $1
    """
    direct_permissions = await conn.fetch(direct_permission_query, user_id)

    # 권한 이름 목록 생성
    permission_names = set()
    for p in permissions:
        permission_names.add(p["name"])
    for p in direct_permissions:
        permission_names.add(p["name"])

    return list(permission_names)


# 엔드포인트
@app.get("/")
async def root():
    return {"message": "CarGoro Core API 서비스가 정상 작동 중입니다"}


@app.post("/api/users", response_model=UserResponse)
async def create_user(user: UserCreate, conn=Depends(get_db_conn)):
    # 사용자 생성
    query = """
    INSERT INTO users (clerk_id, email, first_name, last_name, phone_number, profile_image)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    """
    try:
        user_record = await conn.fetchrow(
            query,
            user.clerkId,
            user.email,
            user.firstName,
            user.lastName,
            user.phoneNumber,
            user.profileImage,
        )

        # JSON 응답을 위한 데이터 변환
        return {
            "id": str(user_record["id"]),
            "clerkId": user_record["clerk_id"],
            "email": user_record["email"],
            "firstName": user_record["first_name"],
            "lastName": user_record["last_name"],
            "phoneNumber": user_record["phone_number"],
            "profileImage": user_record["profile_image"],
            "active": user_record["active"],
            "createdAt": user_record["created_at"],
            "updatedAt": user_record["updated_at"],
            "lastLogin": user_record["last_login"],
        }
    except Exception as e:
        logger.error(f"사용자 생성 실패: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"사용자 생성 중 오류가 발생했습니다: {str(e)}",
        )


@app.get("/api/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, conn=Depends(get_db_conn)):
    query = "SELECT * FROM users WHERE id = $1"
    user_record = await conn.fetchrow(query, user_id)

    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="사용자를 찾을 수 없습니다"
        )

    return {
        "id": str(user_record["id"]),
        "clerkId": user_record["clerk_id"],
        "email": user_record["email"],
        "firstName": user_record["first_name"],
        "lastName": user_record["last_name"],
        "phoneNumber": user_record["phone_number"],
        "profileImage": user_record["profile_image"],
        "active": user_record["active"],
        "createdAt": user_record["created_at"],
        "updatedAt": user_record["updated_at"],
        "lastLogin": user_record["last_login"],
    }


@app.post("/api/organizations", response_model=OrganizationResponse)
async def create_organization(org: OrganizationCreate, conn=Depends(get_db_conn)):
    # 조직 생성
    query = """
    INSERT INTO organizations (name, slug, description, Logo, tier)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    """
    try:
        org_record = await conn.fetchrow(
            query, org.name, org.slug, org.description, org.Logo, org.tier
        )

        return {
            "id": str(org_record["id"]),
            "name": org_record["name"],
            "slug": org_record["slug"],
            "description": org_record["description"],
            "Logo": org_record["Logo"],
            "tier": org_record["tier"],
            "active": org_record["active"],
            "createdAt": org_record["created_at"],
            "updatedAt": org_record["updated_at"],
        }
    except Exception as e:
        logger.error(f"조직 생성 실패: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"조직 생성 중 오류가 발생했습니다: {str(e)}",
        )


@app.post("/api/memberships", response_model=MembershipResponse)
async def create_membership(membership: MembershipCreate, conn=Depends(get_db_conn)):
    # 멤버십 생성 (사용자를 조직에 추가)
    query = """
    INSERT INTO organization_members (user_id, organization_id, role_id, is_owner, is_admin)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    """
    try:
        member_record = await conn.fetchrow(
            query,
            membership.userId,
            membership.organizationId,
            membership.roleId,
            membership.isOwner,
            membership.isAdmin,
        )

        return {
            "id": str(member_record["id"]),
            "userId": str(member_record["user_id"]),
            "organizationId": str(member_record["organization_id"]),
            "roleId": member_record["role_id"],
            "isOwner": member_record["is_owner"],
            "isAdmin": member_record["is_admin"],
            "joinedAt": member_record["joined_at"],
            "updatedAt": member_record["updated_at"],
            "status": member_record["status"],
        }
    except Exception as e:
        logger.error(f"멤버십 생성 실패: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"멤버십 생성 중 오류가 발생했습니다: {str(e)}",
        )


@app.get(
    "/api/users/{user_id}/organizations", response_model=List[OrganizationResponse]
)
async def get_user_organizations(user_id: str, conn=Depends(get_db_conn)):
    query = """
    SELECT o.*
    FROM organizations o
    JOIN organization_members om ON o.id = om.organization_id
    WHERE om.user_id = $1 AND om.status = 'active' AND o.active = true
    """
    org_records = await conn.fetch(query, user_id)

    orgs = []
    for record in org_records:
        orgs.append(
            {
                "id": str(record["id"]),
                "name": record["name"],
                "slug": record["slug"],
                "description": record["description"],
                "Logo": record["Logo"],
                "tier": record["tier"],
                "active": record["active"],
                "createdAt": record["created_at"],
                "updatedAt": record["updated_at"],
            }
        )

    return orgs


@app.get("/api/users/{user_id}/roles", response_model=List[RoleResponse])
async def get_user_roles(user_id: str, organization_id: str, conn=Depends(get_db_conn)):
    # 사용자의 역할 조회
    role_query = """
    SELECT r.*
    FROM roles r
    JOIN organization_members om ON r.id = om.role_id
    WHERE om.user_id = $1 AND om.organization_id = $2 AND om.status = 'active'
    """
    role_records = await conn.fetch(role_query, user_id, organization_id)

    roles = []
    for role in role_records:
        # 역할에 할당된 권한 조회
        permission_query = """
        SELECT p.*
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = $1
        """
        permission_records = await conn.fetch(permission_query, role["id"])

        permissions = []
        for perm in permission_records:
            permissions.append(
                {
                    "id": perm["id"],
                    "name": perm["name"],
                    "description": perm["description"],
                    "scope": perm["scope"],
                }
            )

        roles.append(
            {
                "id": role["id"],
                "name": role["name"],
                "description": role["description"],
                "permissions": permissions,
            }
        )

    return roles


@app.post("/api/auth/token", response_model=TokenResponse)
async def login_for_access_token(
    clerk_id: str, organization_id: Optional[str] = None, conn=Depends(get_db_conn)
):
    # Clerk ID로 사용자 찾기
    user_query = "SELECT * FROM users WHERE clerk_id = $1 AND active = true"
    user = await conn.fetchrow(user_query, clerk_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="인증 실패",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 로그인 시간 업데이트
    await conn.execute(
        "UPDATE users SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        user["id"],
    )

    # 인증 로그 기록
    await conn.execute(
        "INSERT INTO auth_logs (user_id, action, success) VALUES ($1, $2, $3)",
        user["id"],
        "login",
        True,
    )

    # 토큰 데이터 준비
    user_id = str(user["id"])
    token_data = {"userId": user_id}

    # 조직 및 권한 정보 추가
    if organization_id:
        # 해당 조직의 멤버십 확인
        membership_query = """
        SELECT om.*, r.name as role_name
        FROM organization_members om
        JOIN roles r ON om.role_id = r.id
        WHERE om.user_id = $1 AND om.organization_id = $2 AND om.status = 'active'
        """
        membership = await conn.fetchrow(membership_query, user_id, organization_id)

        if membership:
            token_data["organizationId"] = organization_id
            token_data["roles"] = [membership["role_name"]]

            # 권한 목록 가져오기
            permissions = await get_user_permissions(user_id, organization_id, conn)
            token_data["permissions"] = permissions

    # 토큰 생성
    access_token = create_jwt_token(token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": JWT_EXPIRATION * 60,  # 초 단위로 변환
    }


@app.get("/api/auth/validate")
async def validate_token(token: str, conn=Depends(get_db_conn)):
    payload = await verify_token(token, conn)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 토큰",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
