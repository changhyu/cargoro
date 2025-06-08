"""
의존성 주입 모듈

FastAPI 의존성 주입을 위한 공통 함수들을 정의합니다.
"""
from prisma import Prisma
import logging

# 로깅 설정
logger = logging.getLogger("parts-api")

# 전역 Prisma 클라이언트 인스턴스
_prisma_client = None

async def get_prisma() -> Prisma:
    """
    Prisma 클라이언트를 FastAPI 의존성으로 주입하기 위한 함수입니다.
    """
    global _prisma_client

    if _prisma_client is None:
        _prisma_client = Prisma()
        await _prisma_client.connect()
        logger.info("Prisma 클라이언트 연결 생성됨")

    return _prisma_client

async def close_prisma():
    """
    애플리케이션 종료 시 Prisma 클라이언트 연결을 정리합니다.
    """
    global _prisma_client

    if _prisma_client is not None:
        await _prisma_client.disconnect()
        _prisma_client = None
        logger.info("Prisma 클라이언트 연결 종료됨")
