from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, JSON, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    payments = relationship("Payment", back_populates="customer")
    payment_methods = relationship("PaymentMethod", back_populates="customer")
    subscriptions = relationship("Subscription", back_populates="customer")
    point_transactions = relationship("PointTransaction", back_populates="user")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    payment_key = Column(String, unique=True, index=True)
    order_id = Column(String, unique=True, nullable=False, index=True)
    order_name = Column(String, nullable=False)
    customer_id = Column(String, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    status = Column(String, nullable=False)  # READY, IN_PROGRESS, DONE, CANCELED, etc.
    method = Column(String)  # CARD, BANK_TRANSFER, VIRTUAL_ACCOUNT, MOBILE
    requested_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime)
    cancelled_at = Column(DateTime)
    cancel_reason = Column(Text)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    customer = relationship("User", back_populates="payments")

class PaymentMethod(Base):
    __tablename__ = "payment_methods"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # CARD, BANK_TRANSFER, etc.
    name = Column(String, nullable=False)
    billing_key = Column(String, unique=True)
    card_number = Column(String)  # 마스킹된 카드번호
    card_company = Column(String)
    bank_code = Column(String)
    bank_name = Column(String)
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    customer = relationship("User", back_populates="payment_methods")

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String, ForeignKey("users.id"), nullable=False)
    plan_id = Column(String, nullable=False)
    plan_name = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)
    billing_cycle = Column(String, nullable=False)  # MONTHLY, YEARLY
    status = Column(String, nullable=False)  # ACTIVE, PAUSED, CANCELLED, EXPIRED
    payment_method_id = Column(String, ForeignKey("payment_methods.id"))
    current_period_start = Column(DateTime)
    current_period_end = Column(DateTime)
    next_billing_date = Column(DateTime)
    cancelled_at = Column(DateTime)
    cancel_reason = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    customer = relationship("User", back_populates="subscriptions")

class PointTransaction(Base):
    __tablename__ = "point_transactions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # EARN, USE, EXPIRE, CANCEL
    amount = Column(Integer, nullable=False)  # 양수: 적립, 음수: 사용
    balance = Column(Integer, nullable=False)  # 거래 후 잔액
    description = Column(String, nullable=False)
    order_id = Column(String)
    payment_id = Column(String, ForeignKey("payments.id"))
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="point_transactions")

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text)
    amount = Column(Integer, nullable=False)
    currency = Column(String, default="KRW")
    interval = Column(String, nullable=False)  # MONTHLY, YEARLY
    features = Column(JSON)  # ["feature1", "feature2", ...]
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class WebhookLog(Base):
    __tablename__ = "webhook_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_type = Column(String, nullable=False)
    payload = Column(JSON, nullable=False)
    processed = Column(Boolean, default=False)
    error = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime)
