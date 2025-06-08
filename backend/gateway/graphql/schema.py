"""
GraphQL 스키마 정의
"""
from strawberry import Schema
from strawberry.fastapi import GraphQLRouter
import strawberry
from typing import List, Optional
from datetime import datetime

# GraphQL 타입 정의
@strawberry.type
class User:
    id: strawberry.ID
    email: str
    name: str
    phone_number: Optional[str]
    role: str
    organization_id: Optional[str]
    created_at: datetime
    updated_at: datetime

@strawberry.type
class Organization:
    id: strawberry.ID
    name: str
    type: str
    created_at: datetime
    updated_at: datetime

@strawberry.type
class Vehicle:
    id: strawberry.ID
    vehicle_number: str
    manufacturer: str
    model: str
    year: int
    vin: Optional[str]
    engine_type: str
    color: Optional[str]
    mileage: Optional[int]
    last_service_mileage: Optional[int]
    registration_date: datetime
    customer_id: Optional[str]
    organization_id: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

@strawberry.type
class Customer:
    id: strawberry.ID
    name: str
    email: str
    phone: str
    address: Optional[str]
    business_number: Optional[str]
    customer_type: str
    status: str
    total_spent: float
    organization_id: str
    created_at: datetime
    updated_at: datetime

@strawberry.type
class MaintenanceRecord:
    id: strawberry.ID
    vehicle_id: str
    type: str
    description: str
    mileage: int
    cost: Optional[float]
    performed_at: datetime
    next_due_date: Optional[datetime]
    next_due_mileage: Optional[int]

@strawberry.type
class VehicleLocation:
    id: strawberry.ID
    vehicle_id: str
    latitude: float
    longitude: float
    speed: Optional[float]
    heading: Optional[float]
    altitude: Optional[float]
    accuracy: Optional[float]
    timestamp: datetime

@strawberry.type
class Part:
    id: strawberry.ID
    part_number: str
    name: str
    category: str
    manufacturer: str
    model: Optional[str]
    description: Optional[str]
    unit: str
    price: float
    cost: Optional[float]
    min_stock: int
    max_stock: Optional[int]
    lead_time_days: Optional[int]
    is_active: bool
    tags: List[str]
    organization_id: str
    created_at: datetime
    updated_at: datetime

@strawberry.type
class PurchaseOrder:
    id: strawberry.ID
    order_number: str
    supplier_name: str
    supplier_contact: Optional[str]
    expected_date: datetime
    total_amount: float
    status: str
    notes: Optional[str]
    organization_id: str
    created_at: datetime
    updated_at: datetime

@strawberry.type
class PurchaseOrderItem:
    id: strawberry.ID
    order_id: str
    part_id: str
    quantity: int
    unit_price: float
    total_price: float
    received_quantity: int
    status: str
    notes: Optional[str]

@strawberry.type
class StockMovement:
    id: strawberry.ID
    part_id: str
    warehouse_id: str
    movement_type: str
    quantity: int
    reason: str
    reference_type: Optional[str]
    reference_id: Optional[str]
    notes: Optional[str]
    created_by_id: str
    created_at: datetime

@strawberry.type
class Workshop:
    id: strawberry.ID
    name: str
    address: str
    phone: str
    business_number: str
    description: Optional[str]
    specialties: List[str]
    operating_hours: str  # JSON string
    capacity: int
    is_active: bool
    rating: float
    review_count: int
    completed_repairs: int
    owner_id: str
    created_at: datetime
    updated_at: datetime

@strawberry.type
class RepairRequest:
    id: strawberry.ID
    request_number: str
    vehicle_id: str
    customer_id: str
    workshop_id: Optional[str]
    technician_id: Optional[str]
    description: str
    urgency: str
    status: str
    preferred_date: Optional[datetime]
    scheduled_date: Optional[datetime]
    completed_date: Optional[datetime]
    estimated_duration: Optional[int]
    actual_duration: Optional[int]
    symptoms: List[str]
    diagnosis: Optional[str]
    repair_notes: Optional[str]
    total_cost: Optional[float]
    created_at: datetime
    updated_at: datetime

@strawberry.type
class AuthResponse:
    access_token: str
    refresh_token: str
    token_type: str
    user: User

@strawberry.type
class SuccessResponse:
    success: bool
    message: str

# Query 정의
@strawberry.type
class Query:
    @strawberry.field
    async def me(self, info) -> Optional[User]:
        """현재 로그인한 사용자 정보"""
        # TODO: 인증 미들웨어에서 사용자 정보 가져오기
        return None
    
    @strawberry.field
    async def user(self, id: strawberry.ID) -> Optional[User]:
        """특정 사용자 정보 조회"""
        # TODO: Core API 호출
        return None
    
    @strawberry.field
    async def users(
        self,
        page: int = 1,
        page_size: int = 20,
        role: Optional[str] = None
    ) -> List[User]:
        """사용자 목록 조회"""
        # TODO: Core API 호출
        return []
    
    @strawberry.field
    async def workshop(self, id: strawberry.ID) -> Optional[Workshop]:
        """특정 정비소 정보 조회"""
        # TODO: Repair API 호출
        return None
    
    @strawberry.field
    async def workshops(
        self,
        page: int = 1,
        page_size: int = 20,
        keyword: Optional[str] = None,
        specialty: Optional[str] = None,
        min_rating: Optional[float] = None
    ) -> List[Workshop]:
        """정비소 목록 조회"""
        # TODO: Repair API 호출
        return []
    
    @strawberry.field
    async def repair_request(self, id: strawberry.ID) -> Optional[RepairRequest]:
        """특정 정비 요청 조회"""
        # TODO: Repair API 호출
        return None
    
    @strawberry.field
    async def repair_requests(
        self,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None,
        urgency: Optional[str] = None
    ) -> List[RepairRequest]:
        """정비 요청 목록 조회"""
        # TODO: Repair API 호출
        return []
    
    @strawberry.field
    async def vehicle(self, id: strawberry.ID) -> Optional[Vehicle]:
        """특정 차량 정보 조회"""
        # TODO: Fleet API 호출
        return None
    
    @strawberry.field
    async def vehicles(
        self,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        customer_id: Optional[str] = None,
        engine_type: Optional[str] = None
    ) -> List[Vehicle]:
        """차량 목록 조회"""
        # TODO: Fleet API 호출
        return []
    
    @strawberry.field
    async def customer(self, id: strawberry.ID) -> Optional[Customer]:
        """특정 고객 정보 조회"""
        # TODO: Fleet API 호출
        return None
    
    @strawberry.field
    async def customers(
        self,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        customer_type: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Customer]:
        """고객 목록 조회"""
        # TODO: Fleet API 호출
        return []
    
    @strawberry.field
    async def vehicle_locations(
        self,
        vehicle_id: str,
        hours: int = 24
    ) -> List[VehicleLocation]:
        """차량 위치 기록 조회"""
        # TODO: Fleet API 호출
        return []
    
    @strawberry.field
    async def part(self, id: strawberry.ID) -> Optional[Part]:
        """특정 부품 정보 조회"""
        # TODO: Parts API 호출
        return None
    
    @strawberry.field
    async def parts(
        self,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        category: Optional[str] = None,
        manufacturer: Optional[str] = None,
        is_active: Optional[bool] = None,
        low_stock_only: bool = False
    ) -> List[Part]:
        """부품 목록 조회"""
        # TODO: Parts API 호출
        return []
    
    @strawberry.field
    async def purchase_order(self, id: strawberry.ID) -> Optional[PurchaseOrder]:
        """특정 구매 주문 조회"""
        # TODO: Parts API 호출
        return None
    
    @strawberry.field
    async def purchase_orders(
        self,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None,
        supplier_name: Optional[str] = None
    ) -> List[PurchaseOrder]:
        """구매 주문 목록 조회"""
        # TODO: Parts API 호출
        return []

# Mutation 정의
@strawberry.type
class Mutation:
    @strawberry.mutation
    async def register(
        self,
        email: str,
        password: str,
        name: str,
        phone_number: Optional[str] = None,
        organization_name: Optional[str] = None
    ) -> AuthResponse:
        """회원가입"""
        # TODO: Core API 호출
        raise NotImplementedError
    
    @strawberry.mutation
    async def login(self, email: str, password: str) -> AuthResponse:
        """로그인"""
        # TODO: Core API 호출
        raise NotImplementedError
    
    @strawberry.mutation
    async def refresh_token(self, refresh_token: str) -> AuthResponse:
        """토큰 갱신"""
        # TODO: Core API 호출
        raise NotImplementedError
    
    @strawberry.mutation
    async def create_repair_request(
        self,
        vehicle_id: str,
        description: str,
        urgency: str = "NORMAL",
        preferred_date: Optional[datetime] = None,
        symptoms: List[str] = []
    ) -> RepairRequest:
        """정비 요청 생성"""
        # TODO: Repair API 호출
        raise NotImplementedError
    
    @strawberry.mutation
    async def update_repair_request(
        self,
        id: strawberry.ID,
        status: Optional[str] = None,
        workshop_id: Optional[str] = None,
        technician_id: Optional[str] = None,
        diagnosis: Optional[str] = None,
        repair_notes: Optional[str] = None,
        total_cost: Optional[float] = None
    ) -> RepairRequest:
        """정비 요청 수정"""
        # TODO: Repair API 호출
        raise NotImplementedError
    
    @strawberry.mutation
    async def create_workshop(
        self,
        name: str,
        address: str,
        phone: str,
        business_number: str,
        description: Optional[str] = None,
        specialties: List[str] = [],
        capacity: int = 10
    ) -> Workshop:
        """정비소 등록"""
        # TODO: Repair API 호출
        raise NotImplementedError
    
    @strawberry.mutation
    async def create_vehicle(
        self,
        vehicle_number: str,
        manufacturer: str,
        model: str,
        year: int,
        engine_type: str,
        registration_date: datetime,
        vin: Optional[str] = None,
        color: Optional[str] = None,
        mileage: Optional[int] = None,
        customer_id: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Vehicle:
        """차량 등록"""
        # TODO: Fleet API 호출
        raise NotImplementedError
    
    @strawberry.mutation
    async def update_vehicle(
        self,
        id: strawberry.ID,
        vehicle_number: Optional[str] = None,
        color: Optional[str] = None,
        mileage: Optional[int] = None,
        customer_id: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Vehicle:
        """차량 정보 수정"""
        # TODO: Fleet API 호출
        raise NotImplementedError
    
    @strawberry.mutation
    async def create_customer(
        self,
        name: str,
        email: str,
        phone: str,
        customer_type: str = "INDIVIDUAL",
        address: Optional[str] = None,
        business_number: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Customer:
        """고객 등록"""
        # TODO: Fleet API 호출
        raise NotImplementedError
    
    @strawberry.mutation
    async def update_customer(
        self,
        id: strawberry.ID,
        name: Optional[str] = None,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        address: Optional[str] = None,
        notes: Optional[str] = None,
        status: Optional[str] = None
    ) -> Customer:
        """고객 정보 수정"""
        # TODO: Fleet API 호출
        raise NotImplementedError
    
    @strawberry.mutation
    async def add_maintenance_record(
        self,
        vehicle_id: str,
        type: str,
        description: str,
        mileage: int,
        performed_at: datetime,
        cost: Optional[float] = None,
        next_due_date: Optional[datetime] = None,
        next_due_mileage: Optional[int] = None
    ) -> MaintenanceRecord:
        """정비 기록 추가"""
        # TODO: Fleet API 호출
        raise NotImplementedError
    
    @strawberry.mutation
    async def update_vehicle_location(
        self,
        vehicle_id: str,
        latitude: float,
        longitude: float,
        speed: Optional[float] = None,
        heading: Optional[float] = None,
        altitude: Optional[float] = None,
        accuracy: Optional[float] = None
    ) -> VehicleLocation:
        """차량 위치 업데이트"""
        # TODO: Fleet API 호출
        raise NotImplementedError
    
    @strawberry.mutation
    async def create_part(
        self,
        part_number: str,
        name: str,
        category: str,
        manufacturer: str,
        unit: str,
        price: float,
        model: Optional[str] = None,
        description: Optional[str] = None,
        cost: Optional[float] = None,
        min_stock: int = 0,
        max_stock: Optional[int] = None,
        lead_time_days: Optional[int] = None,
        tags: List[str] = []
    ) -> Part:
        """부품 등록"""
        # TODO: Parts API 호출
        raise NotImplementedError
    
    @strawberry.mutation
    async def update_part(
        self,
        id: strawberry.ID,
        name: Optional[str] = None,
        description: Optional[str] = None,
        price: Optional[float] = None,
        cost: Optional[float] = None,
        min_stock: Optional[int] = None,
        max_stock: Optional[int] = None,
        is_active: Optional[bool] = None,
        tags: Optional[List[str]] = None
    ) -> Part:
        """부품 정보 수정"""
        # TODO: Parts API 호출
        raise NotImplementedError
    
    @strawberry.mutation
    async def adjust_stock(
        self,
        part_id: str,
        quantity: int,
        reason: str,
        warehouse_id: str = "default-warehouse",
        reference_type: Optional[str] = None,
        reference_id: Optional[str] = None,
        notes: Optional[str] = None
    ) -> StockMovement:
        """재고 조정"""
        # TODO: Parts API 호출
        raise NotImplementedError
    
    @strawberry.mutation
    async def create_purchase_order(
        self,
        supplier_name: str,
        expected_date: datetime,
        items: List[strawberry.ID],  # OrderItem 입력
        supplier_contact: Optional[str] = None,
        notes: Optional[str] = None
    ) -> PurchaseOrder:
        """구매 주문 생성"""
        # TODO: Parts API 호출
        raise NotImplementedError

# 스키마 생성
schema = Schema(query=Query, mutation=Mutation)

# GraphQL 라우터 생성
def create_graphql_router() -> GraphQLRouter:
    return GraphQLRouter(schema)
