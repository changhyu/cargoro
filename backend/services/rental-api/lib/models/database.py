"""
SQLAlchemy 데이터베이스 모델 정의
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Enum, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import uuid

from .enums import *

Base = declarative_base()


def generate_uuid():
    return str(uuid.uuid4())


class Vehicle(Base):
    """차량 모델"""
    __tablename__ = "vehicles"

    id = Column(String, primary_key=True, default=generate_uuid)
    registration_number = Column(String, unique=True, nullable=False)
    make = Column(String, nullable=False)
    model = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    color = Column(String, nullable=False)
    vin = Column(String, unique=True, nullable=False)
    status = Column(Enum(VehicleStatus), default=VehicleStatus.AVAILABLE)
    mileage = Column(Integer, nullable=False)
    fuel_type = Column(Enum(FuelType), nullable=False)
    transmission = Column(Enum(TransmissionType), nullable=False)
    category = Column(Enum(VehicleCategory), nullable=False)
    features = Column(JSON, default=list)
    images = Column(JSON, default=list)
    purchase_date = Column(DateTime, nullable=False)
    purchase_price = Column(Float, nullable=False)
    current_value = Column(Float, nullable=False)
    last_maintenance_date = Column(DateTime, nullable=False)
    next_maintenance_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    rental_contracts = relationship("RentalContract", back_populates="vehicle")
    lease_contracts = relationship("LeaseContract", back_populates="vehicle")
    reservations = relationship("Reservation", back_populates="vehicle")
    maintenance_records = relationship("MaintenanceRecord", back_populates="vehicle")


class Customer(Base):
    """고객 모델"""
    __tablename__ = "customers"

    id = Column(String, primary_key=True, default=generate_uuid)
    type = Column(Enum(CustomerType), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=False)
    license_number = Column(String, nullable=True)
    business_number = Column(String, nullable=True)
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING)
    credit_score = Column(Integer, nullable=True)
    registered_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    rental_contracts = relationship("RentalContract", back_populates="customer")
    lease_contracts = relationship("LeaseContract", back_populates="customer")
    reservations = relationship("Reservation", back_populates="customer")
    payments = relationship("Payment", back_populates="customer")


class RentalContract(Base):
    """렌탈 계약 모델"""
    __tablename__ = "rental_contracts"

    id = Column(String, primary_key=True, default=generate_uuid)
    contract_number = Column(String, unique=True, nullable=False)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False)
    contract_type = Column(Enum(ContractType), nullable=False)
    status = Column(Enum(RentalContractStatus), default=RentalContractStatus.DRAFT)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    pickup_location = Column(String, nullable=False)
    return_location = Column(String, nullable=False)
    daily_rate = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    deposit = Column(Float, nullable=False)
    insurance_type = Column(Enum(InsuranceType), nullable=False)
    additional_options = Column(JSON, default=list)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    customer = relationship("Customer", back_populates="rental_contracts")
    vehicle = relationship("Vehicle", back_populates="rental_contracts")
    payments = relationship("Payment", back_populates="rental_contract")


class LeaseContract(Base):
    """리스 계약 모델"""
    __tablename__ = "lease_contracts"

    id = Column(String, primary_key=True, default=generate_uuid)
    contract_number = Column(String, unique=True, nullable=False)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False)
    lease_type = Column(Enum(LeaseType), nullable=False)
    status = Column(Enum(LeaseContractStatus), default=LeaseContractStatus.DRAFT)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    monthly_payment = Column(Float, nullable=False)
    down_payment = Column(Float, nullable=False)
    residual_value = Column(Float, nullable=False)
    mileage_limit = Column(Integer, nullable=False)
    excess_mileage_rate = Column(Float, nullable=False)
    maintenance_included = Column(Boolean, default=False)
    insurance_included = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    customer = relationship("Customer", back_populates="lease_contracts")
    vehicle = relationship("Vehicle", back_populates="lease_contracts")
    payments = relationship("Payment", back_populates="lease_contract")


class Reservation(Base):
    """예약 모델"""
    __tablename__ = "reservations"

    id = Column(String, primary_key=True, default=generate_uuid)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False)
    reservation_type = Column(Enum(ReservationType), nullable=False)
    status = Column(Enum(ReservationStatus), default=ReservationStatus.PENDING)
    pickup_date = Column(DateTime, nullable=False)
    pickup_time = Column(String, nullable=False)
    pickup_location = Column(String, nullable=False)
    return_date = Column(DateTime, nullable=True)
    return_time = Column(String, nullable=True)
    return_location = Column(String, nullable=True)
    estimated_cost = Column(Float, nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    customer = relationship("Customer", back_populates="reservations")
    vehicle = relationship("Vehicle", back_populates="reservations")


class Payment(Base):
    """결제 모델"""
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=generate_uuid)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    rental_contract_id = Column(String, ForeignKey("rental_contracts.id"), nullable=True)
    lease_contract_id = Column(String, ForeignKey("lease_contracts.id"), nullable=True)
    contract_type = Column(String, nullable=False)  # 'RENTAL' or 'LEASE'
    amount = Column(Float, nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    due_date = Column(DateTime, nullable=False)
    paid_date = Column(DateTime, nullable=True)
    receipt_url = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    customer = relationship("Customer", back_populates="payments")
    rental_contract = relationship("RentalContract", back_populates="payments")
    lease_contract = relationship("LeaseContract", back_populates="payments")


class MaintenanceRecord(Base):
    """정비 기록 모델"""
    __tablename__ = "maintenance_records"

    id = Column(String, primary_key=True, default=generate_uuid)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False)
    type = Column(Enum(MaintenanceType), nullable=False)
    scheduled_date = Column(DateTime, nullable=False)
    completed_date = Column(DateTime, nullable=True)
    description = Column(String, nullable=False)
    estimated_cost = Column(Float, nullable=False)
    actual_cost = Column(Float, nullable=True)
    status = Column(String, nullable=False)  # SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    vehicle = relationship("Vehicle", back_populates="maintenance_records")
