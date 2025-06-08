"""
초기 사용자 데이터 생성 스크립트
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lib.models import SessionLocal, init_db
from lib.models.user import User
from lib.auth.utils import get_password_hash
from datetime import datetime

def create_initial_users():
    """초기 사용자 생성"""
    db = SessionLocal()
    
    try:
        # 관리자 계정
        admin = db.query(User).filter(User.email == "admin@cargoro.com").first()
        if not admin:
            admin = User(
                email="admin@cargoro.com",
                name="시스템 관리자",
                hashed_password=get_password_hash("admin1234"),
                role="ADMIN",
                is_active=True,
                is_superuser=True
            )
            db.add(admin)
            print("관리자 계정 생성: admin@cargoro.com / admin1234")
        
        # 매니저 계정
        manager = db.query(User).filter(User.email == "manager@cargoro.com").first()
        if not manager:
            manager = User(
                email="manager@cargoro.com",
                name="김매니저",
                hashed_password=get_password_hash("manager1234"),
                role="MANAGER",
                is_active=True,
                is_superuser=False
            )
            db.add(manager)
            print("매니저 계정 생성: manager@cargoro.com / manager1234")
        
        # 일반 사용자 계정
        user = db.query(User).filter(User.email == "user@cargoro.com").first()
        if not user:
            user = User(
                email="user@cargoro.com",
                name="이사용자",
                hashed_password=get_password_hash("user1234"),
                role="USER",
                is_active=True,
                is_superuser=False
            )
            db.add(user)
            print("사용자 계정 생성: user@cargoro.com / user1234")
        
        db.commit()
        print("초기 사용자 생성 완료!")
        
    except Exception as e:
        print(f"오류 발생: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    # DB 초기화
    init_db()
    
    # 초기 사용자 생성
    create_initial_users()
