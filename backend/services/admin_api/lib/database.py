from fastapi import Depends
from functools import lru_cache
import logging

# 로깅 설정
logger = logging.getLogger("admin-api")

# 개발 환경에서는 Mock Prisma 클라이언트 사용
logger.warning("⚠️ Mock Prisma 클라이언트를 사용합니다.")


# Prisma mock 구현 (개발/테스트용)
class Prisma:
    """Prisma 클라이언트 Mock 구현"""

    def __init__(self):
        self.auditlog = AuditlogModel()
        self.user = UserModel()

    async def connect(self):
        """데이터베이스 연결"""
        logger.info("Mock DB 연결됨")

    async def disconnect(self):
        """데이터베이스 연결 해제"""
        logger.info("Mock DB 연결 해제됨")


class AuditlogModel:
    """Auditlog 모델 Mock 구현"""

    async def count(self, where=None):
        """로그 개수 카운트"""
        return 0

    async def find_many(
        self, where=None, order=None, take=None, skip=None, include=None
    ):
        """여러 로그 조회"""
        return []

    async def create(self, data):
        """로그 생성"""
        return data

    async def find_unique(self, where=None, include=None):
        """단일 로그 조회"""
        return None

    async def group_by(self, by=None, where=None, _count=None, take=None, order=None):
        """그룹화 조회"""
        return []


class UserModel:
    """User 모델 Mock 구현"""

    async def find_unique(self, where=None):
        """단일 사용자 조회"""
        return None


# Mock Prisma 인스턴스 생성
prisma = Prisma()


@lru_cache
def get_prisma_client():
    """
    Prisma 클라이언트 싱글톤 인스턴스를 반환합니다.
    """
    return prisma


async def get_prisma():
    """
    Prisma 클라이언트를 FastAPI 의존성으로 주입하기 위한 함수입니다.
    """
    return get_prisma_client()
