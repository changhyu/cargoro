"""
정비 서비스 Mock 데이터베이스

테스트에서 사용할 Mock 데이터베이스 클래스 정의
"""

from typing import Dict, List, Any, Optional
from datetime import datetime

class MockRepairModel:
    """정비 작업 모델 Mock"""
    def __init__(self):
        self.records = {}
        self.next_id = 1

    async def find_unique(self, where: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """단일 레코드 조회"""
        id = where.get("id")
        if id and id in self.records:
            return self.records[id]
        return None

    async def find_many(self, where: Optional[Dict[str, Any]] = None,
                        order_by: Optional[Dict[str, str]] = None,
                        skip: Optional[int] = None,
                        take: Optional[int] = None) -> List[Dict[str, Any]]:
        """여러 레코드 조회"""
        records = list(self.records.values())

        # 필터링
        if where:
            filtered_records = []
            for record in records:
                match = True
                for key, value in where.items():
                    if isinstance(value, dict):  # 복합 조건 (예: {"gte": x, "lte": y})
                        if key not in record:
                            match = False
                            break
                        for op, op_value in value.items():
                            if op == "gte" and not (record[key] >= op_value):
                                match = False
                                break
                            elif op == "lte" and not (record[key] <= op_value):
                                match = False
                                break
                    elif record.get(key) != value:
                        match = False
                        break
                if match:
                    filtered_records.append(record)
            records = filtered_records

        # 정렬
        if order_by:
            for key, direction in order_by.items():
                reverse = direction.lower() == "desc"
                records.sort(key=lambda x: x.get(key, ""), reverse=reverse)

        # 페이징
        if skip:
            records = records[skip:]
        if take:
            records = records[:take]

        return records

    async def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """레코드 생성"""
        record_id = data.get("id", f"mock_{self.next_id}")
        self.next_id += 1

        record = {**data, "id": record_id}
        self.records[record_id] = record
        return record

    async def update(self, where: Dict[str, Any], data: Dict[str, Any]) -> Dict[str, Any]:
        """레코드 업데이트"""
        id = where.get("id")
        if id not in self.records:
            raise ValueError(f"Record with id {id} not found")

        self.records[id] = {**self.records[id], **data}
        return self.records[id]

    async def delete(self, where: Dict[str, Any]) -> Dict[str, Any]:
        """레코드 삭제"""
        id = where.get("id")
        if id not in self.records:
            raise ValueError(f"Record with id {id} not found")

        deleted_record = self.records.pop(id)
        return deleted_record

    async def count(self, where: Optional[Dict[str, Any]] = None) -> int:
        """레코드 개수 조회"""
        if where:
            return len(await self.find_many(where=where))
        return len(self.records)

class MockPrismaClient:
    """Mock Prisma 클라이언트"""
    def __init__(self):
        self.repairJob = MockRepairModel()
        self.vehicle = MockRepairModel()
        self.user = MockRepairModel()
        self.workshop = MockRepairModel()
        self.vehicle_assignment = MockRepairModel()
        self.repairJobLog = MockRepairModel()
        self.notification = MockRepairModel()

def get_mock_db():
    """Mock DB 클라이언트 반환"""
    return MockPrismaClient()
