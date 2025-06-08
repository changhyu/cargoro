from fastapi import Depends
from functools import lru_cache
import logging

# 로깅 설정
logger = logging.getLogger("delivery-api")

# 개발 환경에서는 Mock Prisma 클라이언트 사용
logger.warning("⚠️ Mock Prisma 클라이언트를 사용합니다.")


# Prisma mock 구현 (개발/테스트용)
class Prisma:
    """Prisma 클라이언트 Mock 구현"""

    def __init__(self):
        self.delivery = DeliveryModel()
        self.delivery_log = DeliveryLogModel()
        self.user = UserModel()

    async def connect(self):
        """데이터베이스 연결"""
        logger.info("Mock DB 연결됨")

    async def disconnect(self):
        """데이터베이스 연결 해제"""
        logger.info("Mock DB 연결 해제됨")


class DeliveryModel:
    """Mock Delivery 모델"""

    def __init__(self):
        # 상태를 추적하기 위한 내부 스토리지
        self._deliveries = {}

    async def count(self, where=None):
        """탁송 개수 카운트"""
        if where is None:
            return 10  # 전체 탁송 수

        # 상태별 개수
        if "status" in where:
            status = where["status"]
            if status == "pending":
                return 5
            elif status == "in_transit":
                return 3
            elif status == "completed":
                return 2
            else:
                return 0

        return 10

    async def find_many(
        self, where=None, order=None, take=None, skip=None, include=None
    ):
        """여러 탁송 조회"""
        return []

    async def create(self, data=None):
        """새 탁송 생성"""
        if data and data.get("vehicle_id") == "error-trigger":
            raise Exception("Database connection failed")

        delivery_id = "delivery-123"
        delivery = {
            "id": delivery_id,
            "vehicle_id": data.get("vehicle_id", "vehicle-123"),
            "delivery_type": data.get("delivery_type", "customer_delivery"),
            "origin_location": data.get("origin_location", "서울역"),
            "destination_location": data.get("destination_location", "부산역"),
            "scheduled_date": data.get("scheduled_date", "2024-01-15"),
            "scheduled_time": data.get("scheduled_time"),
            "status": "pending",
            "priority": data.get("priority", "normal"),
            "estimated_distance": data.get("estimated_distance"),
            "estimated_duration": data.get("estimated_duration"),
            "customer_id": data.get("customer_id"),
            "contact_person": data.get("contact_person"),
            "contact_phone": data.get("contact_phone"),
            "notes": data.get("notes"),
            "created_at": "2024-01-01T12:00:00.000Z",
            "updated_at": "2024-01-01T12:00:00.000Z",
        }

        # 내부 스토리지에 저장
        self._deliveries[delivery_id] = delivery
        return delivery

    async def find_unique(self, where=None, include=None):
        """단일 탁송 조회"""
        if where and where.get("id") == "nonexistent-delivery":
            return None

        delivery_id = where.get("id") if where else "delivery-123"

        # 내부 스토리지에 있으면 그것을 반환
        if delivery_id in self._deliveries:
            return self._deliveries[delivery_id]

        # 특별한 케이스: completed 상태 테스트용
        if delivery_id == "completed-delivery":
            delivery = {
                "id": "completed-delivery",
                "vehicle_id": "vehicle-123",
                "delivery_type": "customer_delivery",
                "origin_location": "서울역",
                "destination_location": "부산역",
                "scheduled_date": "2024-01-15",
                "scheduled_time": "14:30:00",
                "status": "completed",  # 완료된 상태
                "priority": "high",
                "estimated_distance": 400.5,
                "estimated_duration": 300,
                "contact_person": "홍길동",
                "contact_phone": "010-1234-5678",
                "notes": "조심히 운반해주세요",
                "created_at": "2024-01-01T12:00:00.000Z",
                "updated_at": "2024-01-01T12:00:00.000Z",
            }
            self._deliveries[delivery_id] = delivery
            return delivery

        # 기본 delivery-123
        default_delivery = {
            "id": "delivery-123",
            "vehicle_id": "vehicle-123",
            "delivery_type": "customer_delivery",  # EXPRESS → customer_delivery
            "origin_location": "서울역",
            "destination_location": "부산역",
            "scheduled_date": "2024-01-15",
            "scheduled_time": "14:30:00",
            "status": "pending",  # PENDING → pending
            "priority": "high",  # priority_level → priority, HIGH → high
            "estimated_distance": 400.5,
            "estimated_duration": 300,
            "contact_person": "홍길동",  # customer_name → contact_person
            "contact_phone": "010-1234-5678",  # customer_phone → contact_phone
            "notes": "조심히 운반해주세요",
            "created_at": "2024-01-01T12:00:00.000Z",
            "updated_at": "2024-01-01T12:00:00.000Z",
        }
        self._deliveries[delivery_id] = default_delivery
        return default_delivery

    async def update(self, where=None, data=None):
        """탁송 업데이트"""
        if where and where.get("id") == "nonexistent-delivery":
            return None

        delivery_id = where.get("id") if where else "delivery-123"

        # 기존 delivery 가져오기 또는 생성
        if delivery_id not in self._deliveries:
            await self.find_unique(where)

        existing_delivery = self._deliveries[delivery_id]

        # 업데이트 적용
        if data:
            existing_delivery.update(data)
            existing_delivery["updated_at"] = "2024-01-01T12:00:00.000Z"

        return existing_delivery

    async def delete(self, where=None):
        """탁송 삭제"""
        if where and where.get("id") == "nonexistent-delivery":
            return None

        delivery_id = where.get("id") if where else "delivery-123"

        # 내부 스토리지에서 제거
        if delivery_id in self._deliveries:
            deleted = self._deliveries.pop(delivery_id)
            return deleted

        # 기본 삭제 응답
        return {
            "id": delivery_id,
            "vehicle_id": "vehicle-123",
            "delivery_type": "customer_delivery",
            "origin_location": "서울역",
            "destination_location": "부산역",
            "scheduled_date": "2024-01-15",
            "scheduled_time": "14:30:00",
            "status": "pending",
            "priority": "high",
            "estimated_distance": 400.5,
            "estimated_duration": 300,
            "contact_person": "홍길동",
            "contact_phone": "010-1234-5678",
            "notes": "조심히 운반해주세요",
            "created_at": "2024-01-01T12:00:00.000Z",
            "updated_at": "2024-01-01T12:00:00.000Z",
        }


class DeliveryLogModel:
    """DeliveryLog 모델 Mock 구현"""

    async def create(self, data):
        """탁송 로그 생성"""
        return {
            "id": "log-123",
            "delivery_id": data.get("delivery_id"),
            "action": data.get("action"),
            "details": data.get("details"),
            "created_at": "2024-01-01T12:00:00.000Z",
        }

    async def find_many(
        self, where=None, order=None, take=None, skip=None, include=None
    ):
        """여러 탁송 로그 조회"""
        # 로그 데이터 반환
        if where and where.get("delivery_id"):
            return [
                {
                    "id": "log-1",
                    "delivery_id": where["delivery_id"],
                    "action": "CREATE",
                    "description": "탁송 생성됨",
                    "created_at": "2024-01-01T00:00:00Z"
                },
                {
                    "id": "log-2",
                    "delivery_id": where["delivery_id"],
                    "action": "STATUS_CHANGE",
                    "description": "상태 변경: PENDING -> in_transit",
                    "created_at": "2024-01-01T01:00:00Z"
                }
            ]
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
