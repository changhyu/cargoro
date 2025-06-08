from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from enum import Enum

# 부품 상태 열거형
class PartStatus(str, Enum):
    IN_STOCK = "in_stock"  # 재고 있음
    LOW_STOCK = "low_stock"  # 부족 재고
    OUT_OF_STOCK = "out_of_stock"  # 재고 없음
    DISCONTINUED = "discontinued"  # 단종됨
    ORDERED = "ordered"  # 주문됨

# 부품 유형 열거형
class PartType(str, Enum):
    ENGINE = "engine"  # 엔진 부품
    TRANSMISSION = "transmission"  # 변속기 부품
    BRAKE = "brake"  # 브레이크 부품
    SUSPENSION = "suspension"  # 서스펜션 부품
    ELECTRICAL = "electrical"  # 전기 부품
    BODY = "body"  # 차체 부품
    FLUID = "fluid"  # 유체/오일
    OTHER = "other"  # 기타

# 주문 상태 열거형
class OrderStatus(str, Enum):
    DRAFT = "draft"  # 임시저장
    PENDING = "pending"  # 대기 중
    CONFIRMED = "confirmed"  # 확정됨
    SHIPPED = "shipped"  # 배송 중
    DELIVERED = "delivered"  # 배송 완료
    CANCELLED = "cancelled"  # 취소됨
    RETURNED = "returned"  # 반품됨

# 부품 모델
class PartBase(BaseModel):
    part_number: str  # 부품 번호
    name: str  # 부품명
    description: Optional[str] = None  # 설명
    part_type: PartType  # 부품 유형
    price: float  # 가격

class PartCreate(PartBase):
    manufacturer: str  # 제조사
    quantity: int = 0  # 재고 수량
    min_quantity: int = 5  # 최소 재고 수량
    location: Optional[str] = None  # 창고 내 위치
    supplier_ids: Optional[List[str]] = None  # 공급업체 ID 목록
    compatible_vehicles: Optional[List[str]] = None  # 호환 차량 목록
    image_url: Optional[str] = None  # 이미지 URL
    warranty_period: Optional[int] = None  # 보증 기간(월)
    notes: Optional[str] = None  # 메모

class PartUpdate(BaseModel):
    part_number: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    manufacturer: Optional[str] = None
    part_type: Optional[PartType] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    min_quantity: Optional[int] = None
    status: Optional[PartStatus] = None
    location: Optional[str] = None
    supplier_ids: Optional[List[str]] = None
    compatible_vehicles: Optional[List[str]] = None
    image_url: Optional[str] = None
    warranty_period: Optional[int] = None
    notes: Optional[str] = None

class PartResponse(PartBase):
    id: str
    manufacturer: str
    quantity: int
    min_quantity: int
    status: PartStatus
    location: Optional[str] = None
    supplier_ids: Optional[List[str]] = None
    compatible_vehicles: Optional[List[str]] = None
    image_url: Optional[str] = None
    warranty_period: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

# 공급업체 모델
class SupplierBase(BaseModel):
    name: str  # 업체명
    contact_person: str  # 담당자
    email: str  # 이메일
    phone: str  # 연락처

class SupplierCreate(SupplierBase):
    address: Optional[str] = None  # 주소
    website: Optional[str] = None  # 웹사이트
    tax_id: Optional[str] = None  # 사업자등록번호
    payment_terms: Optional[str] = None  # 결제 조건
    lead_time_days: Optional[int] = None  # 배송 소요일
    notes: Optional[str] = None  # 메모

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    tax_id: Optional[str] = None
    payment_terms: Optional[str] = None
    lead_time_days: Optional[int] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None

class SupplierResponse(SupplierBase):
    id: str
    address: Optional[str] = None
    website: Optional[str] = None
    tax_id: Optional[str] = None
    payment_terms: Optional[str] = None
    lead_time_days: Optional[int] = None
    is_active: bool
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

# 주문 모델
class OrderBase(BaseModel):
    supplier_id: str  # 공급업체 ID
    order_date: date  # 주문일
    expected_delivery: Optional[date] = None  # 예상 배송일

class OrderItemBase(BaseModel):
    part_id: str  # 부품 ID
    quantity: int  # 주문 수량
    unit_price: float  # 단가

class OrderItemCreate(OrderItemBase):
    discount: Optional[float] = None  # 할인율
    notes: Optional[str] = None  # 메모

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]  # 주문 항목
    shipping_address: Optional[str] = None  # 배송지
    shipping_cost: Optional[float] = None  # 배송비
    reference_number: Optional[str] = None  # 참조 번호
    payment_method: Optional[str] = None  # 결제 방법
    notes: Optional[str] = None  # 메모

class OrderItemUpdate(BaseModel):
    part_id: Optional[str] = None
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    discount: Optional[float] = None
    notes: Optional[str] = None

class OrderItemResponse(OrderItemBase):
    id: str
    discount: Optional[float] = None
    total_price: float  # 총 가격 (수량 * 단가 - 할인)
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class OrderUpdate(BaseModel):
    supplier_id: Optional[str] = None
    order_date: Optional[date] = None
    expected_delivery: Optional[date] = None
    actual_delivery: Optional[date] = None
    status: Optional[OrderStatus] = None
    shipping_address: Optional[str] = None
    shipping_cost: Optional[float] = None
    tracking_number: Optional[str] = None
    reference_number: Optional[str] = None
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None
    notes: Optional[str] = None

class OrderResponse(OrderBase):
    id: str
    items: List[OrderItemResponse]
    status: OrderStatus
    total_amount: float  # 총 주문액
    actual_delivery: Optional[date] = None
    shipping_address: Optional[str] = None
    shipping_cost: Optional[float] = None
    tracking_number: Optional[str] = None
    reference_number: Optional[str] = None
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

# 재고 이동 모델 (입고, 출고, 재고조정)
class InventoryBase(BaseModel):
    part_id: str  # 부품 ID
    quantity: int  # 현재 재고량
    location: Optional[str] = None  # 창고 위치

class InventoryCreate(InventoryBase):
    unit_cost: Optional[float] = None  # 단가
    notes: Optional[str] = None  # 메모

class InventoryUpdate(BaseModel):
    quantity: Optional[int] = None
    location: Optional[str] = None
    unit_cost: Optional[float] = None
    notes: Optional[str] = None

class InventoryResponse(InventoryBase):
    id: str
    unit_cost: Optional[float] = None
    total_value: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class InventoryMovementBase(BaseModel):
    part_id: str  # 부품 ID
    quantity: int  # 수량 (입고 양수, 출고 음수)
    movement_type: str  # 유형 (입고, 출고, 조정)
    reference_id: Optional[str] = None  # 참조 ID (주문, 정비 등)

class InventoryMovementCreate(InventoryMovementBase):
    unit_cost: Optional[float] = None  # 단가
    reason: Optional[str] = None  # 사유
    performed_by: str  # 수행자 ID
    notes: Optional[str] = None  # 메모

class InventoryMovementResponse(InventoryMovementBase):
    id: str
    previous_quantity: int  # 이전 수량
    new_quantity: int  # 새 수량
    unit_cost: Optional[float] = None
    total_cost: Optional[float] = None
    reason: Optional[str] = None
    performed_by: str
    notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

# 주문 요약 모델
class OrderSummary(BaseModel):
    total_orders: int
    pending_orders: int
    completed_orders: int
    total_amount: float
    pending_amount: float
