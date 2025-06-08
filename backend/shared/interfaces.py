"""
공통 인터페이스

마이크로서비스 간 공통 인터페이스를 정의합니다.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel


# 공통 응답 모델
class ApiResponse(BaseModel):
    """표준 API 응답"""

    success: bool = True
    data: Optional[Any] = None
    message: Optional[str] = None


# 마이크로서비스 인터페이스
class MicroserviceInterface(ABC):
    """
    마이크로서비스 공통 인터페이스

    모든 마이크로서비스는 이 인터페이스를 구현해야 합니다.
    """

    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """서비스 상태 확인"""
        pass

    @abstractmethod
    async def get_version(self) -> str:
        """서비스 버전 정보"""
        pass


# 데이터베이스 클라이언트 인터페이스
class DBClient:
    """
    데이터베이스 클라이언트 인터페이스

    Prisma 클라이언트를 추상화하는 인터페이스입니다.
    """

    def __init__(self):
        self.vehicle = None
        self.user = None
        self.repairRecord = None
        self.workshop = None
        self.part = None
        self.partInventory = None
        self.delivery = None
        self.notification = None
        self.auditLog = None
        self.connected = False

    async def connect(self) -> None:
        """데이터베이스 연결"""
        self.connected = True

    async def disconnect(self) -> None:
        """데이터베이스 연결 해제"""
        self.connected = False

    async def execute_raw(self, query: str) -> Any:
        """원시 쿼리 실행"""
        pass


# 데이터 액세스 인터페이스
class DataAccessInterface(ABC):
    """
    데이터 액세스 공통 인터페이스

    모든 데이터 액세스 계층은 이 인터페이스를 구현해야 합니다.
    """

    @abstractmethod
    async def connect(self) -> None:
        """데이터베이스 연결"""
        pass

    @abstractmethod
    async def disconnect(self) -> None:
        """데이터베이스 연결 해제"""
        pass

    @abstractmethod
    async def find_by_id(self, model: str, id: str) -> Optional[Dict[str, Any]]:
        """ID로 항목 조회"""
        pass

    @abstractmethod
    async def find_many(self, model: str, **filters) -> List[Dict[str, Any]]:
        """필터 조건으로 여러 항목 조회"""
        pass

    @abstractmethod
    async def create(self, model: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """항목 생성"""
        pass

    @abstractmethod
    async def update(
        self, model: str, id: str, data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """항목 업데이트"""
        pass

    @abstractmethod
    async def delete(self, model: str, id: str) -> bool:
        """항목 삭제"""
        pass
