from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
import os
from .models import Base

# 데이터베이스 URL 가져오기
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/cargoro_realtime"
)

# SQLAlchemy 엔진 생성
engine = create_engine(DATABASE_URL)

# 세션 팩토리 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 데이터베이스 의존성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 테이블 생성
def create_tables():
    Base.metadata.create_all(bind=engine)

# 초기 데이터베이스 설정
def init_db():
    create_tables()
    print("✅ 데이터베이스 테이블이 생성되었습니다.")
