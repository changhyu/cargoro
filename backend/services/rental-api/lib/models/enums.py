"""
렌터카/리스 시스템 공통 열거형 정의
"""
from enum import Enum


class CustomerType(str, Enum):
    """고객 유형"""
    INDIVIDUAL = "INDIVIDUAL"  # 개인
    CORPORATE = "CORPORATE"    # 법인


class VehicleStatus(str, Enum):
    """차량 상태"""
    AVAILABLE = "AVAILABLE"      # 이용가능
    RENTED = "RENTED"           # 대여중
    MAINTENANCE = "MAINTENANCE"  # 정비중
    RESERVED = "RESERVED"       # 예약됨
    SOLD = "SOLD"              # 매각


class RentalContractStatus(str, Enum):
    """렌탈 계약 상태"""
    DRAFT = "DRAFT"          # 임시저장
    ACTIVE = "ACTIVE"        # 활성
    COMPLETED = "COMPLETED"  # 완료
    CANCELLED = "CANCELLED"  # 취소


class LeaseContractStatus(str, Enum):
    """리스 계약 상태"""
    DRAFT = "DRAFT"          # 임시저장
    ACTIVE = "ACTIVE"        # 활성
    TERMINATED = "TERMINATED"  # 중도해지
    COMPLETED = "COMPLETED"  # 만료


class ContractType(str, Enum):
    """계약 유형"""
    SHORT_TERM = "SHORT_TERM"  # 단기 렌탈
    LONG_TERM = "LONG_TERM"    # 장기 렌탈


class LeaseType(str, Enum):
    """리스 유형"""
    OPERATING = "OPERATING"  # 운용리스
    FINANCIAL = "FINANCIAL"  # 금융리스


class InsuranceType(str, Enum):
    """보험 유형"""
    BASIC = "BASIC"              # 기본
    STANDARD = "STANDARD"        # 표준
    PREMIUM = "PREMIUM"          # 프리미엄
    FULL_COVERAGE = "FULL_COVERAGE"  # 완전보장


class FuelType(str, Enum):
    """연료 유형"""
    GASOLINE = "GASOLINE"  # 휘발유
    DIESEL = "DIESEL"      # 경유
    HYBRID = "HYBRID"      # 하이브리드
    ELECTRIC = "ELECTRIC"  # 전기


class TransmissionType(str, Enum):
    """변속기 유형"""
    MANUAL = "MANUAL"      # 수동
    AUTOMATIC = "AUTOMATIC"  # 자동


class VehicleCategory(str, Enum):
    """차량 카테고리"""
    ECONOMY = "ECONOMY"      # 경제형
    COMPACT = "COMPACT"      # 소형
    MIDSIZE = "MIDSIZE"      # 중형
    FULL_SIZE = "FULL_SIZE"  # 대형
    LUXURY = "LUXURY"        # 고급
    SUV = "SUV"             # SUV
    VAN = "VAN"             # 밴
    TRUCK = "TRUCK"         # 트럭


class PaymentStatus(str, Enum):
    """결제 상태"""
    PENDING = "PENDING"      # 대기중
    COMPLETED = "COMPLETED"  # 완료
    FAILED = "FAILED"        # 실패
    REFUNDED = "REFUNDED"    # 환불


class PaymentMethod(str, Enum):
    """결제 방법"""
    CREDIT_CARD = "CREDIT_CARD"    # 신용카드
    BANK_TRANSFER = "BANK_TRANSFER"  # 계좌이체
    CASH = "CASH"                  # 현금


class ReservationStatus(str, Enum):
    """예약 상태"""
    PENDING = "PENDING"      # 대기중
    CONFIRMED = "CONFIRMED"  # 확정
    CANCELLED = "CANCELLED"  # 취소
    COMPLETED = "COMPLETED"  # 완료


class ReservationType(str, Enum):
    """예약 유형"""
    RENTAL = "RENTAL"                      # 렌탈 예약
    LEASE_CONSULTATION = "LEASE_CONSULTATION"  # 리스 상담


class VerificationStatus(str, Enum):
    """검증 상태"""
    PENDING = "PENDING"    # 대기중
    VERIFIED = "VERIFIED"  # 검증완료
    REJECTED = "REJECTED"  # 거부


class MaintenanceType(str, Enum):
    """정비 유형"""
    REGULAR = "REGULAR"      # 정기점검
    REPAIR = "REPAIR"        # 수리
    INSPECTION = "INSPECTION"  # 검사
