/**
 * API 모듈 통합 export
 */

// 기본 API 클라이언트
export { apiClient, API_BASE_URL_EXPORT } from './client';

// 각 도메인별 API
export {
  vehicleApi,
  customerApi,
  rentalContractApi,
  leaseContractApi,
  reservationApi,
  queryKeys,
} from './rental';
export { authApi } from './auth';
export { paymentApi } from './payment';

// 타입 재export
export type {
  Vehicle,
  Customer,
  RentalContract,
  LeaseContract,
  Reservation,
  VehicleStatus,
  VehicleCategory,
  CustomerType,
  VerificationStatus,
  ContractStatus,
  ReservationStatus,
  LeaseType,
  PaymentMethod,
} from '@/app/types/rental.types';

export type {
  User,
  LoginRequest,
  Token,
  UserCreate,
  UserUpdate,
  ChangePasswordRequest,
  AuthState,
} from '@/app/types/auth';

export type {
  Payment,
  PaymentCreate,
  PaymentUpdate,
  PaymentProcessRequest,
  PaymentRefundRequest,
  PaymentStatistics,
  PaymentSummary,
  BulkPaymentCreate,
  PaymentListResponse,
  PaymentStatus,
  PaymentMethod as PaymentMethodEnum,
} from '@/app/types/payment';
