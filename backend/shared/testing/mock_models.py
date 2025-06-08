
"""
테스트를 위한 모의(mock) 모델 정의

실제 Prisma 모델에 대한 의존성을 줄이기 위한 모의 모델 클래스입니다.
"""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Union


class MaintenanceStatus(str, Enum):
    """정비 상태 열거형"""
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    PENDING = "PENDING"
    ON_HOLD = "ON_HOLD"

    @property
    def value(self):
        return self


class MaintenanceType(str, Enum):
    """정비 유형 열거형"""
    REPAIR = "REPAIR"
    INSPECTION = "INSPECTION"
    MAINTENANCE = "MAINTENANCE"
    RECALL = "RECALL"
    OTHER = "OTHER"


class Maintenance:
    """Prisma Maintenance 모델을 대체하는 모의 클래스"""

    def __init__(self, **kwargs):
        self.id = kwargs.get('id', 'mock-maintenance-id')
        self.title = kwargs.get('title', 'Mock Maintenance')
        self.description = kwargs.get('description')
        self.maintenance_type = kwargs.get('maintenance_type', MaintenanceType.REPAIR)
        self.status = kwargs.get('status', MaintenanceStatus.SCHEDULED)
        self.vehicle_id = kwargs.get('vehicle_id', 'mock-vehicle-id')
        self.organization_id = kwargs.get('organization_id', 'mock-org-id')
        self.cost = kwargs.get('cost', 0)
        self.notes = kwargs.get('notes')
        self.created_at = kwargs.get('created_at', datetime.now())
        self.updated_at = kwargs.get('updated_at', datetime.now())
        self.start_date = kwargs.get('start_date')
        self.end_date = kwargs.get('end_date')
        self.vehicle = None
        self.organization = None
        self.parts = []

        # Prisma 스타일 별칭 (카멜케이스)
        self.maintenanceType = self.maintenance_type
        self.vehicleId = self.vehicle_id
        self.organizationId = self.organization_id
        self.createdAt = self.created_at
        self.updatedAt = self.updated_at
        self.startDate = self.start_date
        self.endDate = self.end_date

    @classmethod
    async def find_many(cls, **kwargs):
        """여러 정비 항목 조회"""
        where = kwargs.get('where', {})
        include = kwargs.get('include', {})

        if where.get('organizationId') == 'org123':
            if where.get('status') == MaintenanceStatus.COMPLETED:
                mocks = [
                    cls(
                        id=f'completed-{i}',
                        title=f'완료된 정비 {i}',
                        status=MaintenanceStatus.COMPLETED,
                        organization_id='org123',
                        cost=100000 + i * 10000
                    ) for i in range(1, 4)
                ]
            elif 'OR' in where:  # 검색 쿼리
                mocks = [
                    cls(
                        id='search-result-1',
                        title='엔진 오일 교체',
                        description='정기 엔진 오일 교체 작업',
                        status=MaintenanceStatus.SCHEDULED,
                        organization_id='org123',
                        vehicle_id='vehicle-123'
                    )
                ]

                # 관계 포함
                if include.get('vehicle'):
                    for mock in mocks:
                        mock.vehicle = Vehicle(
                            id=mock.vehicle_id,
                            license_plate='123가4567'
                        )

                if include.get('organization'):
                    for mock in mocks:
                        mock.organization = Organization(
                            id=mock.organization_id,
                            name='테스트 정비소'
                        )

                if include.get('parts'):
                    for mock in mocks:
                        mock.parts = []
            else:
                mocks = []

            return mocks
        return []

    @classmethod
    async def find_unique(cls, **kwargs):
        """단일 정비 항목 조회"""
        where = kwargs.get('where', {})
        include = kwargs.get('include', {})

        if where.get('id') == 'test-repair-id':
            mock = cls(
                id='test-repair-id',
                title='Test Repair',
                description='Test repair description',
                status=MaintenanceStatus.IN_PROGRESS,
                organization_id='org123',
                vehicle_id='vehicle-123'
            )

            if include.get('vehicle'):
                mock.vehicle = Vehicle(
                    id=mock.vehicle_id,
                    license_plate='123가4567'
                )

            if include.get('organization'):
                mock.organization = Organization(
                    id=mock.organization_id,
                    name='테스트 정비소'
                )

            if include.get('parts'):
                mock.parts = []

            return mock
        return None

    @classmethod
    async def create(cls, **kwargs):
        """정비 항목 생성"""
        data = kwargs.get('data', {})
        return cls(**data)

    @classmethod
    async def update(cls, **kwargs):
        """정비 항목 업데이트"""
        where = kwargs.get('where', {})
        data = kwargs.get('data', {})
        return cls(id=where.get('id', 'updated-id'), **data)

    @classmethod
    async def delete(cls, **kwargs):
        """정비 항목 삭제"""
        return None

    @classmethod
    async def count(cls, **kwargs):
        """정비 항목 개수 조회"""
        where = kwargs.get('where', {})

        if where.get('organizationId') == 'org123':
            if where.get('status') == MaintenanceStatus.COMPLETED:
                return 7
            elif where.get('status') == MaintenanceStatus.IN_PROGRESS:
                return 2
            return 10
        return 0


class Vehicle:
    """Prisma Vehicle 모델을 대체하는 모의 클래스"""

    def __init__(self, **kwargs):
        self.id = kwargs.get('id', 'mock-vehicle-id')
        self.license_plate = kwargs.get('license_plate', '000가0000')
        self.make = kwargs.get('make', '현대')
        self.model = kwargs.get('model', '쏘나타')
        self.year = kwargs.get('year', 2023)
        self.user_id = kwargs.get('user_id', 'mock-user-id')
        self.organization_id = kwargs.get('organization_id', 'mock-org-id')

        # Prisma 스타일 별칭 (카멜케이스)
        self.licensePlate = self.license_plate
        self.userId = self.user_id
        self.organizationId = self.organization_id

    @classmethod
    async def find_unique(cls, **kwargs):
        """단일 차량 조회"""
        where = kwargs.get('where', {})
        if where.get('id') == 'test-vehicle-id':
            return cls(
                id='test-vehicle-id',
                license_plate='123가4567',
                make='현대',
                model='아반떼'
            )
        return None


class User:
    """Prisma User 모델을 대체하는 모의 클래스"""

    def __init__(self, **kwargs):
        self.id = kwargs.get('id', 'mock-user-id')
        self.email = kwargs.get('email', 'test@example.com')
        self.name = kwargs.get('name', '테스트 사용자')
        self.role = kwargs.get('role', 'USER')
        self.organization_id = kwargs.get('organization_id', 'mock-org-id')

        # Prisma 스타일 별칭 (카멜케이스)
        self.organizationId = self.organization_id

    @classmethod
    async def find_unique(cls, **kwargs):
        """단일 사용자 조회"""
        where = kwargs.get('where', {})
        if where.get('id') == 'user123':
            return cls(
                id='user123',
                email='user@example.com',
                name='John Doe',
                role='ADMIN',
                organization_id='org123'
            )
        return None


class Organization:
    """Prisma Organization 모델을 대체하는 모의 클래스"""

    def __init__(self, **kwargs):
        self.id = kwargs.get('id', 'mock-org-id')
        self.name = kwargs.get('name', '테스트 정비소')

    @classmethod
    async def find_unique(cls, **kwargs):
        """단일 조직 조회"""
        where = kwargs.get('where', {})
        if where.get('id') == 'org123':
            return cls(id='org123', name='테스트 정비소')
        return None


class MaintenancePart:
    """Prisma MaintenancePart 모델을 대체하는 모의 클래스"""

    def __init__(self, **kwargs):
        self.id = kwargs.get('id', 'mock-part-id')
        self.maintenance_id = kwargs.get('maintenance_id', 'mock-maintenance-id')
        self.part_id = kwargs.get('part_id', 'mock-part-type-id')
        self.quantity = kwargs.get('quantity', 1)
        self.unit_price = kwargs.get('unit_price', 10000)
        self.total_price = kwargs.get('total_price', self.quantity * self.unit_price)
        self.name = kwargs.get('name', '기본 부품')

        # Prisma 스타일 별칭 (카멜케이스)
        self.maintenanceId = self.maintenance_id
        self.partId = self.part_id
        self.unitPrice = self.unit_price
        self.totalPrice = self.total_price

    @classmethod
    async def create(cls, **kwargs):
        """정비 부품 생성"""
        data = kwargs.get('data', {})
        return cls(**data)

    @classmethod
    async def find_many(cls, **kwargs):
        """여러 정비 부품 조회"""
        where = kwargs.get('where', {})
        if where.get('maintenanceId') == 'test-repair-id':
            return [
                cls(
                    id='part1',
                    maintenance_id='test-repair-id',
                    name='엔진 오일',
                    quantity=1,
                    unit_price=50000,
                    total_price=50000
                ),
                cls(
                    id='part2',
                    maintenance_id='test-repair-id',
                    name='오일 필터',
                    quantity=1,
                    unit_price=15000,
                    total_price=15000
                )
            ]
        return []

    @classmethod
    async def delete_many(cls, **kwargs):
        """여러 정비 부품 삭제"""
        return {"count": 0}
