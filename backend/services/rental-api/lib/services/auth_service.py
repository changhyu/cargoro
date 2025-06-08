"""
인증 서비스
"""
from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from ..models.user import User
from ..schemas.auth import UserCreate, UserUpdate
from ..auth.utils import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    check_account_locked,
    reset_login_attempts,
    increment_login_attempts
)


class AuthService:
    """인증 서비스"""

    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """사용자 생성"""
        # 이메일 중복 확인
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise ValueError("이미 등록된 이메일입니다.")
        
        # 사용자 생성
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            email=user_data.email,
            name=user_data.name,
            hashed_password=hashed_password,
            is_active=user_data.is_active,
            is_superuser=user_data.is_superuser,
            role=user_data.role
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return db_user

    @staticmethod
    def authenticate_user(
        db: Session,
        email: str,
        password: str
    ) -> Optional[User]:
        """사용자 인증"""
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            return None
        
        # 계정 잠금 확인
        if check_account_locked(user):
            raise ValueError("계정이 잠겨있습니다. 잠시 후 다시 시도해주세요.")
        
        # 비밀번호 확인
        if not verify_password(password, user.hashed_password):
            increment_login_attempts(db, user)
            return None
        
        # 로그인 성공
        reset_login_attempts(db, user)
        return user

    @staticmethod
    def create_tokens(user: User) -> dict:
        """액세스 토큰과 리프레시 토큰 생성"""
        access_token_expires = timedelta(minutes=30)
        
        # 토큰에 포함할 데이터
        token_data = {
            "sub": user.id,
            "email": user.email,
            "role": user.role
        }
        
        access_token = create_access_token(
            data=token_data,
            expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(data=token_data)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": 1800  # 30분
        }

    @staticmethod
    def get_user(db: Session, user_id: str) -> Optional[User]:
        """사용자 조회"""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """이메일로 사용자 조회"""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def update_user(
        db: Session,
        user_id: str,
        user_update: UserUpdate
    ) -> Optional[User]:
        """사용자 정보 업데이트"""
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return None
        
        update_data = user_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        
        return user

    @staticmethod
    def change_password(
        db: Session,
        user: User,
        current_password: str,
        new_password: str
    ) -> bool:
        """비밀번호 변경"""
        # 현재 비밀번호 확인
        if not verify_password(current_password, user.hashed_password):
            return False
        
        # 새 비밀번호 설정
        user.hashed_password = get_password_hash(new_password)
        user.updated_at = datetime.utcnow()
        db.commit()
        
        return True

    @staticmethod
    def deactivate_user(db: Session, user_id: str) -> bool:
        """사용자 비활성화"""
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return False
        
        user.is_active = False
        user.updated_at = datetime.utcnow()
        db.commit()
        
        return True

    @staticmethod
    def reactivate_user(db: Session, user_id: str) -> bool:
        """사용자 재활성화"""
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return False
        
        user.is_active = True
        user.updated_at = datetime.utcnow()
        db.commit()
        
        return True
