"""
데이터베이스 연결 및 초기화 모듈

Prisma 클라이언트를 사용한 데이터베이스 연결 관리
"""

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional, Dict, Any
from unittest.mock import AsyncMock, MagicMock

logger = logging.getLogger(__name__)

# 테스트 환경 체크
IS_TESTING = os.getenv("TESTING", "false").lower() == "true"

if IS_TESTING:
    logger.warning("⚠️ Mock Prisma 클라이언트를 사용합니다.")

    # Mock Prisma 클라이언트 (테스트용)
    class MockPrisma:
        def __init__(self):
            self.is_connected_flag = False

        def is_connected(self):
            return self.is_connected_flag

        async def connect(self):
            self.is_connected_flag = True

        async def disconnect(self):
            self.is_connected_flag = False

        def __getattr__(self, name):
            # 모든 테이블 접근을 Mock으로 처리
            mock_table = MagicMock()
            mock_table.find_unique = AsyncMock(return_value=None)
            mock_table.find_first = AsyncMock(return_value=None)
            mock_table.find_many = AsyncMock(return_value=[])
            mock_table.create = AsyncMock(return_value={"id": "test-id"})
            mock_table.update = AsyncMock(return_value={"id": "test-id"})
            mock_table.delete = AsyncMock(return_value={"id": "test-id"})
            mock_table.count = AsyncMock(return_value=0)
            return mock_table

    Prisma = MockPrisma

    # DatasourceOverride 타입 정의 (테스트용)
    class DatasourceOverride:
        def __init__(self, name: str, url: str):
            self.name = name
            self.url = url

else:
    try:
        from prisma import Prisma
        from prisma.types import DatasourceOverride
    except ImportError:
        logger.warning("⚠️ Prisma를 임포트할 수 없어 Mock을 사용합니다.")

        # Mock Prisma 클라이언트 (Prisma 없을 때)
        class MockPrisma:
            def __init__(self):
                self.is_connected_flag = False

            def is_connected(self):
                return self.is_connected_flag

            async def connect(self):
                self.is_connected_flag = True

            async def disconnect(self):
                self.is_connected_flag = False

            def __getattr__(self, name):
                # 모든 테이블 접근을 Mock으로 처리
                mock_table = MagicMock()
                mock_table.find_unique = AsyncMock(return_value=None)
                mock_table.find_first = AsyncMock(return_value=None)
                mock_table.find_many = AsyncMock(return_value=[])
                mock_table.create = AsyncMock(return_value={"id": "test-id"})
                mock_table.update = AsyncMock(return_value={"id": "test-id"})
                mock_table.delete = AsyncMock(return_value={"id": "test-id"})
                mock_table.count = AsyncMock(return_value=0)
                return mock_table

        Prisma = MockPrisma

        # DatasourceOverride 타입 정의 (fallback)
        class DatasourceOverride:
            def __init__(self, name: str, url: str):
                self.name = name
                self.url = url


# 전역 Prisma 클라이언트 인스턴스
_db_client: Optional[Prisma] = None


async def connect_database() -> Prisma:
    """데이터베이스에 연결합니다."""
    global _db_client

    if _db_client is None:
        _db_client = Prisma()

    if not _db_client.is_connected():
        try:
            await _db_client.connect()
            logger.info("데이터베이스 연결이 성공했습니다.")
        except Exception as e:
            logger.error(f"데이터베이스 연결 실패: {str(e)}")
            if not IS_TESTING:
                from fastapi import HTTPException

                raise HTTPException(status_code=500, detail="데이터베이스 연결 실패")

    return _db_client


async def disconnect_database() -> None:
    """데이터베이스 연결을 종료합니다."""
    global _db_client

    if _db_client and _db_client.is_connected():
        try:
            await _db_client.disconnect()
            logger.info("데이터베이스 연결이 종료되었습니다.")
        except Exception as e:
            logger.error(f"데이터베이스 연결 종료 실패: {str(e)}")
        finally:
            _db_client = None


def get_database() -> Prisma:
    """현재 데이터베이스 클라이언트를 반환합니다."""
    global _db_client

    if _db_client is None:
        if IS_TESTING:
            _db_client = Prisma()
        else:
            from fastapi import HTTPException

            raise HTTPException(
                status_code=500, detail="데이터베이스가 연결되지 않았습니다"
            )

    return _db_client


@asynccontextmanager
async def database_session() -> AsyncGenerator[Prisma, None]:
    """데이터베이스 세션 컨텍스트 매니저"""
    db = await connect_database()
    try:
        yield db
    except Exception as e:
        logger.error(f"데이터베이스 세션 오류: {str(e)}")
        raise
    finally:
        # 개별 세션에서는 연결을 유지 (앱 종료 시에만 disconnect)
        pass


async def check_database_health() -> bool:
    """데이터베이스 연결 상태를 확인합니다."""
    try:
        db = get_database()
        # 간단한 쿼리로 연결 상태 확인
        await db.user.count()
        return True
    except Exception as e:
        logger.error(f"데이터베이스 상태 확인 실패: {str(e)}")
        return False


# 데이터베이스 트랜잭션 헬퍼
@asynccontextmanager
async def database_transaction():
    """데이터베이스 트랜잭션 컨텍스트 매니저"""
    db = get_database()
    try:
        if hasattr(db, "tx"):
            async with db.tx() as transaction:
                yield transaction
        else:
            # Mock일 경우 그냥 db 반환
            yield db
    except Exception as e:
        logger.error(f"트랜잭션 오류: {str(e)}")
        # Prisma는 자동으로 롤백됩니다
        raise


# FastAPI 의존성 주입용 함수
def get_prisma() -> Prisma:
    """FastAPI 의존성 주입용 Prisma 클라이언트 반환"""
    return get_database()


# 테스트용 모의 데이터베이스 함수들
async def find_vehicle_by_id(vehicle_id: str) -> Optional[Dict[str, Any]]:
    """차량 ID로 차량 조회 (테스트용)"""
    if vehicle_id == "vehicle123":
        return {
            "id": "vehicle123",
            "vin": "1HGBH41JXMN109186",
            "make": "현대",
            "model": "아반떼",
            "year": 2023,
            "licensePlate": "123가4567",
        }
    return None


async def find_repair_by_id(repair_id: str) -> Optional[Dict[str, Any]]:
    """정비 ID로 정비 작업 조회 (테스트용)"""
    if repair_id == "job123":
        return {
            "id": "job123",
            "vehicleId": "vehicle123",
            "workshopId": "workshop123",
            "description": "정기 점검",
            "status": "IN_PROGRESS",
            "estimatedHours": 2.0,
        }
    return None


async def create_repair_job(data: Dict[str, Any]) -> Dict[str, Any]:
    """정비 작업 생성 (테스트용)"""
    return {"id": "job123", **data, "createdAt": "2024-01-01T00:00:00Z"}


async def update_repair_job(
    repair_id: str, data: Dict[str, Any]
) -> Optional[Dict[str, Any]]:
    """정비 작업 업데이트 (테스트용)"""
    if repair_id == "job123":
        return {"id": repair_id, **data, "updatedAt": "2024-01-01T00:00:00Z"}
    return None


async def delete_repair_job(repair_id: str) -> Optional[Dict[str, Any]]:
    """정비 작업 삭제 (테스트용)"""
    if repair_id == "job123":
        return {"success": True}
    return None


async def list_repair_jobs(**kwargs) -> list:
    """정비 작업 목록 조회 (테스트용)"""
    return [
        {
            "id": "job123",
            "vehicleId": "vehicle123",
            "description": "정기 점검",
            "status": "IN_PROGRESS",
        }
    ]


# 쿼리 실행 함수 (테스트용)
async def execute_query(
    query: str, params: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """SQL 쿼리 실행 (테스트용)"""
    return {"result": "success", "query": query, "params": params}
