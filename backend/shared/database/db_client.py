"""
데이터베이스 클라이언트 모듈
"""

from typing import Any
from .db_operations import create_db_client

_db_client = None


def get_db_client() -> Any:
    """전역 DB 클라이언트 인스턴스를 가져옵니다."""
    global _db_client
    if _db_client is None:
        _db_client = create_db_client()
    return _db_client


def set_db_client(client: Any) -> None:
    """전역 DB 클라이언트 인스턴스를 설정합니다."""
    global _db_client
    _db_client = client
