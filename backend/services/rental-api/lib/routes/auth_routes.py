"""
인증 API 라우트
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..models import get_db
from ..schemas.auth import (
    UserCreate,
    UserUpdate,
    UserResponse,
    Token,
    LoginRequest,
    ChangePasswordRequest,
    RefreshTokenRequest
)
from ..services.auth_service import AuthService
from ..auth.utils import (
    get_current_active_user,
    get_current_admin,
    decode_token
)
from ..models.user import User
from ..security.rate_limit import limiter, activity_detector
from ..security.validation import InputValidator

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
@limiter.limit("3/hour")
def register(
    request: Request,
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """사용자 등록 (관리자만)"""
    # 입력 검증
    try:
        user_data.email = InputValidator.validate_email(user_data.email)
        user_data.name = InputValidator.sanitize_string(user_data.name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    try:
        user = AuthService.create_user(db, user_data)
        return UserResponse.model_validate(user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """로그인"""
    client_ip = request.client.host if request.client else "unknown"
    
    # 이메일 검증
    try:
        email = InputValidator.validate_email(form_data.username)
    except ValueError:
        activity_detector.record_failed_login(client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 이메일 형식입니다"
        )
    
    try:
        user = AuthService.authenticate_user(
            db,
            email,
            form_data.password
        )
        
        if not user:
            # 로그인 실패 기록
            activity_detector.record_failed_login(client_ip)
            
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="이메일 또는 비밀번호가 올바르지 않습니다",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        tokens = AuthService.create_tokens(user)
        return Token(**tokens)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/refresh", response_model=Token)
def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """토큰 갱신"""
    payload = decode_token(refresh_data.refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 리프레시 토큰입니다"
        )
    
    user_id = payload.get("sub")
    user = AuthService.get_user(db, user_id)
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사용자를 찾을 수 없습니다"
        )
    
    tokens = AuthService.create_tokens(user)
    return Token(**tokens)


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """현재 사용자 정보"""
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """현재 사용자 정보 수정"""
    updated_user = AuthService.update_user(db, current_user.id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    
    return UserResponse.model_validate(updated_user)


@router.post("/change-password")
@limiter.limit("3/hour")
def change_password(
    request: Request,
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """비밀번호 변경"""
    # 비밀번호 복잡도 확인
    if len(password_data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="비밀번호는 최소 8자 이상이어야 합니다"
        )
    
    # 비밀번호에 숫자, 문자, 특수문자 포함 확인
    if not any(c.isdigit() for c in password_data.new_password):
        raise HTTPException(
            status_code=400,
            detail="비밀번호에는 숫자가 포함되어야 합니다"
        )
    
    if not any(c.isalpha() for c in password_data.new_password):
        raise HTTPException(
            status_code=400,
            detail="비밀번호에는 문자가 포함되어야 합니다"
        )
    
    success = AuthService.change_password(
        db,
        current_user,
        password_data.current_password,
        password_data.new_password
    )
    
    if not success:
        raise HTTPException(
            status_code=400,
            detail="현재 비밀번호가 올바르지 않습니다"
        )
    
    return {"message": "비밀번호가 성공적으로 변경되었습니다"}


@router.post("/users", response_model=UserResponse)
def create_user_by_admin(
    user_data: UserCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """사용자 생성 (관리자)"""
    try:
        user = AuthService.create_user(db, user_data)
        return UserResponse.model_validate(user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user_by_admin(
    user_id: str,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """사용자 정보 수정 (관리자)"""
    updated_user = AuthService.update_user(db, user_id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    
    return UserResponse.model_validate(updated_user)


@router.delete("/users/{user_id}")
def deactivate_user_by_admin(
    user_id: str,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """사용자 비활성화 (관리자)"""
    success = AuthService.deactivate_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    
    return {"message": "사용자가 비활성화되었습니다"}


@router.post("/users/{user_id}/reactivate")
def reactivate_user_by_admin(
    user_id: str,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """사용자 재활성화 (관리자)"""
    success = AuthService.reactivate_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    
    return {"message": "사용자가 재활성화되었습니다"}
