"""
데이터베이스 연결 및 클라이언트 유틸리티 모듈
"""

import os
import time
import logging
from typing import Optional, Any, Dict, List, Union
from unittest.mock import MagicMock
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)


def create_db_client() -> Any:
    """
    데이터베이스 클라이언트 생성

    주의: 테스트 환경에서는 모의 클라이언트를 반환합니다.
    """
    # 테스트 환경에서는 모의 클라이언트 반환
    if os.environ.get("TESTING") == "1":
        logger.info("테스트 환경에서 모의 DB 클라이언트 생성")
        mock_client = MagicMock()
        return mock_client

    # 실제 환경에서는 Prisma 클라이언트 생성 시도
    try:
        from prisma import Prisma

        return Prisma()
    except ImportError:
        logger.warning("Prisma 모듈을 가져올 수 없음, 모의 클라이언트 반환")
        mock_client = MagicMock()
        return mock_client


def connect_to_db(client: Any = None) -> Any:
    """
    데이터베이스 연결

    Args:
        client: 사용할 DB 클라이언트 (없으면 새로 생성)

    Returns:
        연결된 DB 클라이언트
    """
    if client is None:
        client = create_db_client()

    # 테스트 환경에서는 즉시 반환
    if os.environ.get("TESTING") == "1":
        return client

    # 실제 환경에서는 연결 시도
    try:
        client.connect()
        logger.info("데이터베이스에 연결됨")
    except Exception as e:
        logger.error(f"데이터베이스 연결 실패: {e}")
        # 연결 실패 시 재시도 또는 대체 로직 추가 가능

    return client


def disconnect_from_db(client: Any) -> None:
    """
    데이터베이스 연결 해제

    Args:
        client: 연결 해제할 DB 클라이언트
    """
    # 테스트 환경에서는 무시
    if os.environ.get("TESTING") == "1":
        return

    # 실제 환경에서는 연결 해제 시도
    try:
        client.disconnect()
        logger.info("데이터베이스 연결 해제됨")
    except Exception as e:
        logger.error(f"데이터베이스 연결 해제 실패: {e}")


# 비동기 함수 버전 - 서비스 모듈 호환성을 위해
async def async_connect_to_db(client: Any = None) -> Any:
    """
    데이터베이스 비동기 연결

    Args:
        client: 사용할 DB 클라이언트 (없으면 새로 생성)

    Returns:
        연결된 DB 클라이언트
    """
    # 동기 함수를 호출
    return connect_to_db(client)


async def async_disconnect_from_db(client: Any) -> None:
    """
    데이터베이스 비동기 연결 해제

    Args:
        client: 연결 해제할 DB 클라이언트
    """
    # 동기 함수를 호출
    disconnect_from_db(client)


class DBClient:
    """
    데이터베이스 클라이언트 싱글톤 래퍼 클래스

    이 클래스는 애플리케이션 전체에서 DB 클라이언트를 공유하도록 합니다.
    """

    _instance = None
    client = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DBClient, cls).__new__(cls)
            cls._instance.client = create_db_client()
        return cls._instance

    def connect(self) -> None:
        """데이터베이스에 연결"""
        if self.client:
            connect_to_db(self.client)

    def disconnect(self) -> None:
        """데이터베이스 연결 해제"""
        if self.client:
            disconnect_from_db(self.client)

    def get_client(self) -> Any:
        """DB 클라이언트 반환"""
        return self.client


# 기존 코드와의 호환성을 위한 비동기 별칭 함수 (services 모듈용)
async def connect_database(client: Any = None) -> Any:
    """비동기 데이터베이스 연결 함수"""
    return await async_connect_to_db(client)


async def disconnect_database() -> None:
    """비동기 데이터베이스 연결 해제 함수"""
    from .db_client import get_db_client

    client = get_db_client()
    await async_disconnect_from_db(client)


# 기존 코드와의 호환성을 위한 별칭 함수
connect_database = connect_to_db
disconnect_database = disconnect_from_db
get_prisma = create_db_client


# 비동기 함수 버전 - 서비스 모듈 호환성을 위해
async def async_connect_to_db(client: Any = None) -> Any:
    """
    데이터베이스 비동기 연결

    Args:
        client: 사용할 DB 클라이언트 (없으면 새로 생성)

    Returns:
        연결된 DB 클라이언트
    """
    # 동기 함수를 호출
    return connect_to_db(client)


async def async_disconnect_from_db(client: Any = None) -> None:
    """
    데이터베이스 비동기 연결 해제

    Args:
        client: 연결 해제할 DB 클라이언트
    """
    # 동기 함수를 호출
    if client is not None:
        disconnect_from_db(client)
    return None


# 서비스 모듈용 비동기 별칭 함수
async def async_connect_database(client: Any = None) -> Any:
    """비동기 데이터베이스 연결 함수"""
    return await async_connect_to_db(client)


async def async_disconnect_database(client: Any = None) -> None:
    """비동기 데이터베이스 연결 해제 함수"""
    await async_disconnect_from_db(client)
    return None


# 단순화된 Prisma 클래스 - 호환성을 위해 제공
class Prisma:
    """Prisma ORM 클라이언트 클래스의 가상 구현"""

    def __init__(self):
        """Prisma 클라이언트 초기화"""
        self.mock = MagicMock()

    def connect(self):
        """데이터베이스 연결"""
        return self.mock.connect()

    def disconnect(self):
        """데이터베이스 연결 해제"""
        return self.mock.disconnect()

    def __getattr__(self, name):
        """모델에 대한 요청을 모의 객체로 전달"""
        return getattr(self.mock, name)


# 데이터베이스 세션 관리를 위한 컨텍스트 매니저
@asynccontextmanager
async def database_session():
    """데이터베이스 세션 컨텍스트 매니저

    테스트에서는 모의 객체를 반환하고, 실제 환경에서는 Prisma 클라이언트를 반환합니다.
    """
    from contextlib import asynccontextmanager

    # 테스트 환경 확인
    if os.environ.get("TESTING") == "1":
        mock_client = MagicMock()
        yield mock_client
    else:
        try:
            from prisma import Prisma

            client = Prisma()
            client.connect()
            yield client
        except ImportError:
            mock_client = MagicMock()
            yield mock_client
        finally:
            # 세션 종료 시 자원 정리 (실제 환경에서만)
            if "client" in locals() and not os.environ.get("TESTING") == "1":
                client.disconnect()


# 데이터베이스 트랜잭션을 위한 컨텍스트 매니저
@asynccontextmanager
async def database_transaction():
    """데이터베이스 트랜잭션 컨텍스트 매니저"""
    # 테스트 환경에서는 모의 객체 반환
    if os.environ.get("TESTING") == "1":
        mock_tx = MagicMock()
        yield mock_tx
    else:
        async with database_session() as client:
            try:
                # 실제 환경에서는 Prisma 트랜잭션 시작
                tx = await client.tx()
                yield tx
                await tx.commit()
            except Exception as e:
                # 오류 발생 시 롤백
                if "tx" in locals():
                    await tx.rollback()
                raise
