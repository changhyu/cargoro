#!/usr/bin/env python3
"""
카고로 플랫폼 기본 테스트 데이터 생성 스크립트

이 스크립트는 다음 데이터를 생성합니다:
- 조직 (정비소, 운송회사)
- 사용자 (관리자, 직원, 고객)
- 운전자
- 차량
- 정비 작업
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import List

from prisma import Prisma

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SampleDataCreator:
    def __init__(self):
        self.db = Prisma()

    async def connect(self):
        """데이터베이스 연결"""
        await self.db.connect()
        logger.info("✅ 데이터베이스 연결 성공")

    async def disconnect(self):
        """데이터베이스 연결 해제"""
        await self.db.disconnect()
        logger.info("✅ 데이터베이스 연결 해제")

    async def clear_existing_data(self):
        """기존 데이터 삭제 (선택사항)"""
        try:
            # 순서대로 삭제 (외래키 제약 조건 고려)
            await self.db.maintenancepart.delete_many()
            await self.db.maintenance.delete_many()
            await self.db.drivingrecord.delete_many()
            await self.db.driverperformance.delete_many()
            await self.db.erpsynclog.delete_many()
            await self.db.erpsyncconfig.delete_many()
            await self.db.driver.delete_many()
            await self.db.vehicle.delete_many()
            await self.db.organizationmember.delete_many()
            await self.db.userpermission.delete_many()
            await self.db.rolepermission.delete_many()
            await self.db.permission.delete_many()
            await self.db.organization.delete_many()
            await self.db.user.delete_many()

            logger.info("🧹 기존 데이터 삭제 완료")
        except Exception as e:
            logger.warning(f"⚠️ 기존 데이터 삭제 중 오류 (정상적일 수 있음): {e}")

    async def create_organizations(self) -> List[dict]:
        """조직 데이터 생성"""
        organizations_data = [
            {
                "name": "서울정비소",
                "description": "서울 강남구 소재 종합 정비소",
                "businessNumber": "123-45-67890",
                "address": "서울시 강남구 테헤란로 123",
                "phone": "02-1234-5678",
                "email": "info@seoul-garage.co.kr",
            },
            {
                "name": "부산운송",
                "description": "부산 지역 화물 운송 전문업체",
                "businessNumber": "234-56-78901",
                "address": "부산시 해운대구 센텀로 456",
                "phone": "051-2345-6789",
                "email": "contact@busan-transport.co.kr",
            },
            {
                "name": "대전택시",
                "description": "대전 지역 택시 운영 회사",
                "businessNumber": "345-67-89012",
                "address": "대전시 유성구 대학로 789",
                "phone": "042-3456-7890",
                "email": "support@daejeon-taxi.co.kr",
            },
        ]

        organizations = []
        for org_data in organizations_data:
            org = await self.db.organization.create(data=org_data)
            organizations.append(org)
            logger.info(f"📊 조직 생성: {org.name}")

        return organizations

    async def create_users(self, organizations: List[dict]) -> List[dict]:
        """사용자 데이터 생성"""
        users_data = [
            {
                "email": "admin@cargoro.com",
                "passwordHash": "hashed_password_123",
                "fullName": "시스템 관리자",
                "role": "ADMIN",
                "phone": "010-1111-1111",
            },
            {
                "email": "workshop.owner@seoul-garage.co.kr",
                "passwordHash": "hashed_password_456",
                "fullName": "김정비",
                "role": "WORKSHOP_OWNER",
                "phone": "010-2222-2222",
            },
            {
                "email": "staff@seoul-garage.co.kr",
                "passwordHash": "hashed_password_789",
                "fullName": "이기술",
                "role": "WORKSHOP_STAFF",
                "phone": "010-3333-3333",
            },
            {
                "email": "fleet.manager@busan-transport.co.kr",
                "passwordHash": "hashed_password_101",
                "fullName": "박운송",
                "role": "FLEET_MANAGER",
                "phone": "010-4444-4444",
            },
            {
                "email": "customer@example.com",
                "passwordHash": "hashed_password_112",
                "fullName": "최고객",
                "role": "CUSTOMER",
                "phone": "010-5555-5555",
            },
        ]

        users = []
        for user_data in users_data:
            user = await self.db.user.create(data=user_data)
            users.append(user)
            logger.info(f"👤 사용자 생성: {user.fullName} ({user.role})")

        # 조직 멤버십 생성
        await self.create_organization_memberships(users, organizations)

        return users

    async def create_organization_memberships(
        self, users: List[dict], organizations: List[dict]
    ):
        """조직 멤버십 생성"""
        memberships = [
            # 서울정비소 멤버들
            {
                "user_id": users[1].id,
                "org_id": organizations[0].id,
                "role": "WORKSHOP_OWNER",
            },
            {
                "user_id": users[2].id,
                "org_id": organizations[0].id,
                "role": "WORKSHOP_STAFF",
            },
            # 부산운송 멤버들
            {
                "user_id": users[3].id,
                "org_id": organizations[1].id,
                "role": "FLEET_MANAGER",
            },
        ]

        for membership in memberships:
            await self.db.organizationmember.create(
                data={
                    "userId": membership["user_id"],
                    "organizationId": membership["org_id"],
                    "role": membership["role"],
                }
            )
            logger.info(f"🏢 조직 멤버십 생성: {membership['role']}")

    async def create_drivers(self, organizations: List[dict]) -> List[dict]:
        """운전자 데이터 생성"""
        drivers_data = [
            {
                "name": "김운전",
                "email": "driver1@busan-transport.co.kr",
                "phone": "010-6666-6666",
                "licenseNumber": "11-22-334455-66",
                "licenseType": "1종보통",
                "licenseExpiry": datetime.now() + timedelta(days=365),
                "organizationId": organizations[1].id,  # 부산운송
                "hireDate": datetime.now() - timedelta(days=300),
                "department": "운송부",
                "position": "1급 운전사",
            },
            {
                "name": "이택시",
                "email": "driver2@daejeon-taxi.co.kr",
                "phone": "010-7777-7777",
                "licenseNumber": "22-33-445566-77",
                "licenseType": "2종보통",
                "licenseExpiry": datetime.now() + timedelta(days=200),
                "organizationId": organizations[2].id,  # 대전택시
                "hireDate": datetime.now() - timedelta(days=150),
                "department": "운행부",
                "position": "택시 운전사",
            },
            {
                "name": "박화물",
                "email": "driver3@busan-transport.co.kr",
                "phone": "010-8888-8888",
                "licenseNumber": "33-44-556677-88",
                "licenseType": "1종대형",
                "licenseExpiry": datetime.now() + timedelta(days=400),
                "organizationId": organizations[1].id,  # 부산운송
                "hireDate": datetime.now() - timedelta(days=600),
                "department": "운송부",
                "position": "대형차량 운전사",
            },
        ]

        drivers = []
        for driver_data in drivers_data:
            driver = await self.db.driver.create(data=driver_data)
            drivers.append(driver)
            logger.info(f"🚗 운전자 생성: {driver.name} ({driver.licenseType})")

        return drivers

    async def create_vehicles(self, organizations: List[dict]) -> List[dict]:
        """차량 데이터 생성"""
        vehicles_data = [
            {
                "make": "현대",
                "model": "쏘나타",
                "year": 2022,
                "vehicleType": "sedan",
                "licensePlate": "12가3456",
                "vin": "KMHL14JA0MA123456",
                "color": "화이트",
                "mileage": 15000,
                "fuelType": "gasoline",
                "transmission": "automatic",
                "engine": "2.0L GDI",
                "organizationId": organizations[0].id,  # 서울정비소
                "status": "available",
            },
            {
                "make": "기아",
                "model": "봉고3",
                "year": 2021,
                "vehicleType": "truck",
                "licensePlate": "34나5678",
                "vin": "KNFDB1A14MD789012",
                "color": "블루",
                "mileage": 45000,
                "fuelType": "diesel",
                "transmission": "manual",
                "engine": "2.5L CRDI",
                "organizationId": organizations[1].id,  # 부산운송
                "status": "in_use",
            },
            {
                "make": "현대",
                "model": "그랜저",
                "year": 2023,
                "vehicleType": "sedan",
                "licensePlate": "56다7890",
                "vin": "KMHG35LA5NA345678",
                "color": "블랙",
                "mileage": 8000,
                "fuelType": "hybrid",
                "transmission": "automatic",
                "engine": "3.3L GDI + Electric",
                "organizationId": organizations[2].id,  # 대전택시
                "status": "available",
            },
            {
                "make": "볼보",
                "model": "FH16",
                "year": 2020,
                "vehicleType": "truck",
                "licensePlate": "78라9012",
                "vin": "YV2R0D0G2LA901234",
                "color": "레드",
                "mileage": 120000,
                "fuelType": "diesel",
                "transmission": "automatic",
                "engine": "16.1L D16K",
                "organizationId": organizations[1].id,  # 부산운송
                "status": "maintenance",
            },
        ]

        vehicles = []
        for vehicle_data in vehicles_data:
            vehicle = await self.db.vehicle.create(data=vehicle_data)
            vehicles.append(vehicle)
            logger.info(
                f"🚛 차량 생성: {vehicle.make} {vehicle.model} ({vehicle.licensePlate})"
            )

        return vehicles

    async def create_maintenances(
        self, vehicles: List[dict], organizations: List[dict]
    ) -> List[dict]:
        """정비 작업 데이터 생성"""
        maintenances_data = [
            {
                "title": "정기점검 - 현대 쏘나타",
                "description": "15,000km 정기점검 및 엔진오일 교체",
                "maintenanceType": "REGULAR",
                "status": "COMPLETED",
                "startDate": datetime.now() - timedelta(days=7),
                "endDate": datetime.now() - timedelta(days=6),
                "mileageAtService": 15000,
                "cost": 150000.0,
                "provider": "서울정비소",
                "providerContact": "02-1234-5678",
                "vehicleId": vehicles[0].id,
                "organizationId": organizations[0].id,
            },
            {
                "title": "브레이크 패드 교체",
                "description": "전후 브레이크 패드 마모로 인한 교체",
                "maintenanceType": "REPAIR",
                "status": "IN_PROGRESS",
                "startDate": datetime.now() - timedelta(days=1),
                "mileageAtService": 45000,
                "cost": 250000.0,
                "provider": "부산정비소",
                "providerContact": "051-9876-5432",
                "vehicleId": vehicles[1].id,
                "organizationId": organizations[1].id,
            },
            {
                "title": "타이어 교체",
                "description": "여름 타이어로 교체",
                "maintenanceType": "TIRE_CHANGE",
                "status": "SCHEDULED",
                "startDate": datetime.now() + timedelta(days=3),
                "mileageAtService": 8000,
                "cost": 400000.0,
                "provider": "대전타이어",
                "providerContact": "042-1111-2222",
                "vehicleId": vehicles[2].id,
                "organizationId": organizations[2].id,
            },
            {
                "title": "엔진 오버홀",
                "description": "대형트럭 엔진 전면 정비",
                "maintenanceType": "REPAIR",
                "status": "IN_PROGRESS",
                "startDate": datetime.now() - timedelta(days=5),
                "mileageAtService": 120000,
                "cost": 5000000.0,
                "provider": "볼보서비스센터",
                "providerContact": "051-5555-6666",
                "vehicleId": vehicles[3].id,
                "organizationId": organizations[1].id,
            },
        ]

        maintenances = []
        for maintenance_data in maintenances_data:
            maintenance = await self.db.maintenance.create(data=maintenance_data)
            maintenances.append(maintenance)
            logger.info(f"🔧 정비작업 생성: {maintenance.title} ({maintenance.status})")

        return maintenances

    async def create_maintenance_parts(self, maintenances: List[dict]):
        """정비 부품 데이터 생성"""
        parts_data = [
            # 첫 번째 정비작업 (쏘나타 정기점검) 부품들
            {
                "name": "엔진오일",
                "partNumber": "EO-2000-HYD",
                "quantity": 4,
                "unitPrice": 15000.0,
                "totalPrice": 60000.0,
                "maintenanceId": maintenances[0].id,
            },
            {
                "name": "오일필터",
                "partNumber": "OF-123-HYD",
                "quantity": 1,
                "unitPrice": 12000.0,
                "totalPrice": 12000.0,
                "maintenanceId": maintenances[0].id,
            },
            # 두 번째 정비작업 (브레이크 패드) 부품들
            {
                "name": "전면 브레이크 패드",
                "partNumber": "BP-F-456-KIA",
                "quantity": 1,
                "unitPrice": 80000.0,
                "totalPrice": 80000.0,
                "maintenanceId": maintenances[1].id,
            },
            {
                "name": "후면 브레이크 패드",
                "partNumber": "BP-R-789-KIA",
                "quantity": 1,
                "unitPrice": 70000.0,
                "totalPrice": 70000.0,
                "maintenanceId": maintenances[1].id,
            },
        ]

        for part_data in parts_data:
            part = await self.db.maintenancepart.create(data=part_data)
            logger.info(f"🔩 부품 생성: {part.name} (수량: {part.quantity})")

    async def create_sample_data(self, clear_existing: bool = False):
        """전체 샘플 데이터 생성"""
        try:
            await self.connect()

            if clear_existing:
                await self.clear_existing_data()

            logger.info("🚀 기본 테스트 데이터 생성 시작...")

            # 1. 조직 생성
            organizations = await self.create_organizations()

            # 2. 사용자 생성
            users = await self.create_users(organizations)

            # 3. 운전자 생성
            drivers = await self.create_drivers(organizations)

            # 4. 차량 생성
            vehicles = await self.create_vehicles(organizations)

            # 5. 정비작업 생성
            maintenances = await self.create_maintenances(vehicles, organizations)

            # 6. 정비 부품 생성
            await self.create_maintenance_parts(maintenances)

            logger.info("✅ 기본 테스트 데이터 생성 완료!")
            logger.info(f"   - 조직: {len(organizations)}개")
            logger.info(f"   - 사용자: {len(users)}개")
            logger.info(f"   - 운전자: {len(drivers)}개")
            logger.info(f"   - 차량: {len(vehicles)}개")
            logger.info(f"   - 정비작업: {len(maintenances)}개")

        except Exception as e:
            logger.error(f"❌ 데이터 생성 중 오류 발생: {e}")
            raise
        finally:
            await self.disconnect()


async def main():
    """메인 실행 함수"""
    creator = SampleDataCreator()

    # 기존 데이터를 삭제하고 새로 생성하려면 True, 추가만 하려면 False
    await creator.create_sample_data(clear_existing=True)


if __name__ == "__main__":
    asyncio.run(main())
