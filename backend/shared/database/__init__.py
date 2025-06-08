"""
데이터베이스 초기화 모듈
"""

from .db_operations import DBClient


def init_db():
    """
    데이터베이스 초기화 및 연결
    """
    db_client = DBClient()
    db_client.connect()
    return db_client.get_client()
