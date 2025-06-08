from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# 요청 스키마
class PaymentCreateRequest(BaseModel):
    order_id: str
    order_name: str
    amount: int = Field(gt=0)
    metadata: Optional[Dict[str, Any]] = None

class PaymentConfirmRequest(BaseModel):
    payment_key: str
    order_id: str
    amount: int

class PaymentCancelRequest(BaseModel):
    cancel_reason: str
    cancel_amount: Optional[int] = None

class SubscriptionCreateRequest(BaseModel):
    plan_id: str
    payment_method_id: str

class PointUseRequest(BaseModel):
    order_id: str
    amount: int = Field(gt=0)

# 응답 스키마
class PaymentResponse(BaseModel):
    id: str
    payment_key: Optional[str]
    order_id: str
    order_name: str
    customer_id: str
    amount: int
    status: str
    method: Optional[str]
    requested_at: datetime
    approved_at: Optional[datetime]
    cancelled_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class PaymentMethodResponse(BaseModel):
    id: str
    type: str
    name: str
    card_number: Optional[str]
    card_company: Optional[str]
    bank_code: Optional[str]
    bank_name: Optional[str]
    is_default: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class SubscriptionResponse(BaseModel):
    id: str
    customer_id: str
    plan_id: str
    plan_name: str
    amount: int
    billing_cycle: str
    status: str
    current_period_start: Optional[datetime]
    current_period_end: Optional[datetime]
    next_billing_date: Optional[datetime]
    cancelled_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class PointsResponse(BaseModel):
    user_id: str
    total_points: int
    available_points: int
    pending_points: int
    expiring_points: int
    updated_at: datetime

class PointTransactionResponse(BaseModel):
    id: str
    user_id: str
    type: str
    amount: int
    balance: int
    description: str
    order_id: Optional[str]
    expires_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class WebhookPayload(BaseModel):
    event_type: str
    data: Dict[str, Any]
    created_at: datetime

# 토스페이먼츠 관련 스키마
class TossPaymentResponse(BaseModel):
    payment_key: str
    order_id: str
    order_name: str
    status: str
    requested_at: str
    approved_at: Optional[str]
    card: Optional[Dict[str, Any]]
    virtual_account: Optional[Dict[str, Any]]
    total_amount: int
    balance_amount: int
    supplied_amount: int
    vat: int
    method: str

class TossBillingKeyResponse(BaseModel):
    billing_key: str
    customer_key: str
    card_company: str
    card_number: str
    created_at: str
