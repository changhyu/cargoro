from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import jwt
import secrets
from passlib.context import CryptContext
from ..dependencies import get_db, get_current_user
from ..models import TokenResponse, UserResponse
from prisma.models import User, UserPermission, RolePermission
from ..utils.response_utils import create_response, ApiResponse, unauthorized_exception, bad_request_exception

# 보안 설정
SECRET_KEY = "토큰_생성에_사용할_시크릿_키_실제_환경에서는_환경변수로_관리"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24시간
REFRESH_TOKEN_EXPIRE_DAYS = 30  # 30일

# 패스워드 해싱 컨텍스트
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 스키마
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

router = APIRouter(prefix="/api/auth", tags=["인증"])

# 토큰 관련 모델
class RefreshTokenRequest(BaseModel):
    refresh_token: str

# 비밀번호 관련 모델
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ResetPasswordRequest(BaseModel):
    email: str

class ConfirmResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# 비밀번호 검증
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# 비밀번호 해싱
def get_password_hash(password):
    return pwd_context.hash(password)

# 사용자 인증
async def authenticate_user(email: str, password: str, db):
    user = await db.user.find_unique(
        where={"email": email}
    )

    if not user or not user.isActive:
        return False

    if not verify_password(password, user.passwordHash):
        return False

    return user

# JWT 토큰 생성 (액세스 토큰)
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt

# JWT 토큰 생성 (리프레시 토큰)
def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt

# 토큰 발급 엔드포인트
@router.post("/token", response_model=ApiResponse)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db = Depends(get_db)
):
    """
    사용자 인증 후 액세스 토큰을 발급합니다.
    """
    user = await authenticate_user(form_data.username, form_data.password, db)

    if not user:
        raise unauthorized_exception("이메일 또는 비밀번호가 올바르지 않습니다.")

    # 로그인 시간 업데이트
    await db.user.update(
        where={"id": user.id},
        data={"updatedAt": datetime.utcnow()}
    )

    # 사용자 권한 조회
    permissions = []

    # 역할 기반 권한 조회
    role_permissions = await db.rolePermission.find_many(
        where={"role": user.role},
        include={"permission": True}
    )

    # 사용자 특정 권한 조회
    user_permissions = await db.userPermission.find_many(
        where={"userId": user.id, "granted": True},
        include={"permission": True}
    )

    # 권한 목록 생성
    for rp in role_permissions:
        permissions.append(rp.permission.code)

    for up in user_permissions:
        if up.permission.code not in permissions:
            permissions.append(up.permission.code)

    # 토큰 데이터 준비
    token_data = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "permissions": permissions
    }

    # 토큰 생성
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token({"sub": user.id})

    # 리프레시 토큰 저장
    expiry = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    await db.session.create(
        data={
            "userId": user.id,
            "token": access_token,
            "refreshToken": refresh_token,
            "expiresAt": expiry
        }
    )

    token_data = {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # 초 단위로 변환
        "refresh_token": refresh_token,
        "user": UserResponse.from_orm(user)
    }

    return create_response(data=token_data)

@router.post("/refresh-token", response_model=ApiResponse)
async def refresh_access_token(
    refresh_data: RefreshTokenRequest,
    db = Depends(get_db)
):
    """
    리프레시 토큰을 사용하여 새 액세스 토큰을 발급합니다.
    """
    try:
        # 리프레시 토큰 디코딩
        payload = jwt.decode(refresh_data.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if user_id is None:
            raise unauthorized_exception("유효하지 않은 리프레시 토큰")

        # 만료 시간 검증
        exp = payload.get("exp")
        if exp is None or datetime.fromtimestamp(exp) < datetime.utcnow():
            raise unauthorized_exception("만료된 리프레시 토큰")

    except jwt.PyJWTError:
        raise unauthorized_exception("유효하지 않은 리프레시 토큰")

    # 데이터베이스에서 세션 조회
    session = await db.session.find_first(
        where={
            "userId": user_id,
            "refreshToken": refresh_data.refresh_token,
            "expiresAt": {"gt": datetime.utcnow()}
        }
    )

    if not session:
        raise credentials_exception

    # 사용자 정보 조회
    user = await db.user.find_unique(
        where={"id": user_id}
    )

    if not user or not user.isActive:
        raise credentials_exception

    # 사용자 권한 조회
    permissions = []

    # 역할 기반 권한 조회
    role_permissions = await db.rolePermission.find_many(
        where={"role": user.role},
        include={"permission": True}
    )

    # 사용자 특정 권한 조회
    user_permissions = await db.userPermission.find_many(
        where={"userId": user.id, "granted": True},
        include={"permission": True}
    )

    # 권한 목록 생성
    for rp in role_permissions:
        permissions.append(rp.permission.code)

    for up in user_permissions:
        if up.permission.code not in permissions:
            permissions.append(up.permission.code)

    # 토큰 데이터 준비
    token_data = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "permissions": permissions
    }

    # 새 액세스 토큰 생성
    new_access_token = create_access_token(token_data)

    # 세션 업데이트
    await db.session.update(
        where={"id": session.id},
        data={"token": new_access_token}
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # 초 단위로 변환
        "refresh_token": refresh_data.refresh_token,  # 리프레시 토큰은 재사용
        "user": UserResponse.from_orm(user)
    }

@router.post("/register")
async def register_user(
    email: str,
    password: str,
    full_name: str,
    db = Depends(get_db)
):
    """
    새 사용자를 등록합니다.
    """
    # 이메일 중복 확인
    existing_user = await db.user.find_unique(
        where={"email": email}
    )

    if existing_user:
        raise bad_request_exception("이미 사용 중인 이메일입니다.", "EMAIL_ALREADY_EXISTS")

    # 비밀번호 해싱
    hashed_password = get_password_hash(password)

    # 사용자 생성
    user = await db.user.create(
        data={
            "email": email,
            "passwordHash": hashed_password,
            "fullName": full_name,
            "role": "CUSTOMER"  # 기본 역할: 고객
        }
    )

    # 토큰 데이터 준비
    token_data = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "permissions": []  # 기본 고객 권한은 별도로 설정 필요
    }

    # 토큰 생성
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token({"sub": user.id})

    # 리프레시 토큰 저장
    expiry = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    await db.session.create(
        data={
            "userId": user.id,
            "token": access_token,
            "refreshToken": refresh_token,
            "expiresAt": expiry
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "refresh_token": refresh_token,
        "user": UserResponse.from_orm(user)
    }

@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    로그인한 사용자의 비밀번호를 변경합니다.
    """
    # 현재 비밀번호 확인
    if not verify_password(data.current_password, current_user.passwordHash):
        raise bad_request_exception("현재 비밀번호가 일치하지 않습니다.", "PASSWORD_MISMATCH")

    # 새 비밀번호 해싱
    hashed_password = get_password_hash(data.new_password)

    # 비밀번호 업데이트
    await db.user.update(
        where={"id": current_user.id},
        data={
            "passwordHash": hashed_password,
            "updatedAt": datetime.utcnow()
        }
    )

    # 모든 기존 세션 무효화
    await db.session.delete_many(
        where={"userId": current_user.id}
    )

    return {"message": "비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요."}

@router.post("/reset-password-request", response_model=ApiResponse)
async def request_password_reset(
    data: ResetPasswordRequest,
    db = Depends(get_db)
):
    """
    비밀번호 재설정 요청을 처리합니다.
    """
    # 사용자 이메일 확인
    user = await db.user.find_unique(
        where={"email": data.email}
    )

    if not user or not user.isActive:
        # 보안상 사용자가 존재하지 않아도 동일한 응답 제공
        return create_response(data={"message": "비밀번호 재설정 링크가 이메일로 전송되었습니다."})

    # 재설정 토큰 생성
    reset_token = secrets.token_urlsafe(32)
    token_expiry = datetime.utcnow() + timedelta(hours=24)  # 24시간 유효

    # 이전 재설정 토큰이 있으면 삭제
    await db.resetToken.delete_many(
        where={"userId": user.id}
    )

    # 새 재설정 토큰 저장
    await db.resetToken.create(
        data={
            "userId": user.id,
            "token": reset_token,
            "expiresAt": token_expiry
        }
    )

    # 실제 환경에서는 이메일 전송 로직 추가
    # send_reset_email(user.email, reset_token)

    return create_response(data={"message": "비밀번호 재설정 링크가 이메일로 전송되었습니다."})

@router.post("/reset-password-confirm")
async def confirm_password_reset(
    data: ConfirmResetPasswordRequest,
    db = Depends(get_db)
):
    """
    비밀번호 재설정 확인을 처리합니다.
    """
    # 재설정 토큰 확인
    reset_record = await db.resetToken.find_unique(
        where={
            "token": data.token,
            "expiresAt": {"gt": datetime.utcnow()}
        },
        include={"user": True}
    )

    if not reset_record:
        raise bad_request_exception("유효하지 않거나 만료된 재설정 토큰입니다.", "INVALID_OR_EXPIRED_RESET_TOKEN")

    # 새 비밀번호 해싱
    hashed_password = get_password_hash(data.new_password)

    # 비밀번호 업데이트
    await db.user.update(
        where={"id": reset_record.userId},
        data={
            "passwordHash": hashed_password,
            "updatedAt": datetime.utcnow()
        }
    )

    # 모든 기존 세션 무효화
    await db.session.delete_many(
        where={"userId": reset_record.userId}
    )

    # 사용된 재설정 토큰 삭제
    await db.resetToken.delete(
        where={"id": reset_record.id}
    )

    return {"message": "비밀번호가 성공적으로 재설정되었습니다. 새 비밀번호로 로그인해주세요."}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user = Depends(get_current_user),
):
    """
    현재 로그인한 사용자 정보를 반환합니다.
    """
    return UserResponse.from_orm(current_user)

@router.post("/verify-permission")
async def verify_permission(
    permission: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    사용자가 특정 권한을 가지고 있는지 확인합니다.
    """
    # 관리자는 모든 권한을 가짐
    if current_user.role == "ADMIN":
        return {"hasPermission": True}

    # 역할 기반 권한 확인
    role_permission = await db.rolePermission.find_first(
        where={
            "role": current_user.role,
            "permission": {
                "code": permission
            }
        },
        include={"permission": True}
    )

    if role_permission:
        return {"hasPermission": True}

    # 사용자 특정 권한 확인
    user_permission = await db.userPermission.find_first(
        where={
            "userId": current_user.id,
            "granted": True,
            "permission": {
                "code": permission
            }
        },
        include={"permission": True}
    )

    return {"hasPermission": user_permission is not None}

# 외부 모듈에서 사용할 함수
async def get_current_user_from_token(token: str, db):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="유효하지 않은 인증 정보",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    user = await db.user.find_unique(
        where={"id": user_id}
    )

    if user is None or not user.isActive:
        raise credentials_exception

    return user
