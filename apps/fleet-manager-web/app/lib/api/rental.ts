import type {
  Vehicle,
  Customer,
  RentalContract,
  LeaseContract,
  Reservation,
} from '@/app/types/rental.types';

import { apiClient } from './client';

// 차량 API
export const vehicleApi = {
  // 차량 목록 조회
  getVehicles: async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    category?: string;
    search?: string;
  }) => {
    return apiClient.get('/vehicles', { params });
  },

  // 차량 상세 조회
  getVehicle: async (id: string) => {
    return apiClient.get(`/vehicles/${id}`);
  },

  // 이용 가능한 차량 조회
  getAvailableVehicles: async () => {
    return apiClient.get('/vehicles/available');
  },

  // 차량 통계
  getVehicleStatistics: async () => {
    return apiClient.get('/vehicles/statistics');
  },

  // 차량 생성
  createVehicle: async (data: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => {
    return apiClient.post('/vehicles', data);
  },

  // 차량 업데이트
  updateVehicle: async (id: string, data: Partial<Vehicle>) => {
    return apiClient.put(`/vehicles/${id}`, data);
  },

  // 차량 상태 업데이트
  updateVehicleStatus: async (id: string, status: string) => {
    return apiClient.patch(`/vehicles/${id}/status`, { status });
  },

  // 차량 주행거리 업데이트
  updateVehicleMileage: async (id: string, mileage: number) => {
    return apiClient.patch(`/vehicles/${id}/mileage`, { mileage });
  },

  // 차량 삭제
  deleteVehicle: async (id: string) => {
    return apiClient.delete(`/vehicles/${id}`);
  },
};

// 고객 API
export const customerApi = {
  // 고객 목록 조회
  getCustomers: async (params?: {
    page?: number;
    page_size?: number;
    customer_type?: string;
    verification_status?: string;
    search?: string;
  }) => {
    return apiClient.get('/customers', { params });
  },

  // 고객 상세 조회
  getCustomer: async (id: string) => {
    return apiClient.get(`/customers/${id}`);
  },

  // 고객 계약 요약
  getCustomerContracts: async (id: string) => {
    return apiClient.get(`/customers/${id}/contracts`);
  },

  // 고객 통계
  getCustomerStatistics: async () => {
    return apiClient.get('/customers/statistics');
  },

  // 고객 생성
  createCustomer: async (data: Omit<Customer, 'id' | 'registeredAt'>) => {
    return apiClient.post('/customers', data);
  },

  // 고객 업데이트
  updateCustomer: async (id: string, data: Partial<Customer>) => {
    return apiClient.put(`/customers/${id}`, data);
  },

  // 고객 검증
  verifyCustomer: async (
    id: string,
    verification: {
      verification_status: string;
      verification_notes?: string;
      credit_score?: number;
    }
  ) => {
    return apiClient.post(`/customers/${id}/verify`, verification);
  },

  // 고객 삭제
  deleteCustomer: async (id: string) => {
    return apiClient.delete(`/customers/${id}`);
  },
};

// 렌탈 계약 API
export const rentalContractApi = {
  // 렌탈 비용 계산
  calculateCost: async (params: {
    start_date: string;
    end_date: string;
    daily_rate: number;
    additional_options?: Array<{ id: string; name: string; price: number }>;
  }) => {
    return apiClient.post('/rental-contracts/calculate', params);
  },

  // 렌탈 계약 목록 조회
  getContracts: async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    customer_id?: string;
  }) => {
    return apiClient.get('/rental-contracts', { params });
  },

  // 렌탈 계약 상세 조회
  getContract: async (id: string) => {
    return apiClient.get(`/rental-contracts/${id}`);
  },

  // 만료 예정 계약 조회
  getExpiringContracts: async (days_ahead: number = 7) => {
    return apiClient.get('/rental-contracts/expiring', { params: { days_ahead } });
  },

  // 렌탈 수익 조회
  getRevenue: async (params?: { start_date?: string; end_date?: string }) => {
    return apiClient.get('/rental-contracts/statistics/revenue', { params });
  },

  // 렌탈 계약 생성
  createContract: async (
    data: Omit<RentalContract, 'id' | 'contractNumber' | 'createdAt' | 'updatedAt'>
  ) => {
    return apiClient.post('/rental-contracts', data);
  },

  // 렌탈 계약 업데이트
  updateContract: async (id: string, data: Partial<RentalContract>) => {
    return apiClient.put(`/rental-contracts/${id}`, data);
  },

  // 렌탈 계약 종료
  terminateContract: async (
    id: string,
    data: {
      actual_return_date: string;
      actual_return_location: string;
      final_mileage: number;
      damage_report?: string;
      additional_charges?: number;
      refund_amount?: number;
    }
  ) => {
    return apiClient.post(`/rental-contracts/${id}/terminate`, data);
  },
};

// 리스 계약 API
export const leaseContractApi = {
  // 리스 조건 계산
  calculateTerms: async (params: {
    start_date: string;
    end_date: string;
    monthly_payment: number;
    down_payment: number;
    residual_value: number;
    annual_mileage_limit: number;
  }) => {
    return apiClient.post('/lease-contracts/calculate', params);
  },

  // 리스 계약 목록 조회
  getContracts: async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    lease_type?: string;
    customer_id?: string;
  }) => {
    return apiClient.get('/lease-contracts', { params });
  },

  // 리스 계약 상세 조회
  getContract: async (id: string) => {
    return apiClient.get(`/lease-contracts/${id}`);
  },

  // 만료 예정 계약 조회
  getExpiringContracts: async (days_ahead: number = 30) => {
    return apiClient.get('/lease-contracts/expiring', { params: { days_ahead } });
  },

  // 리스 통계 조회
  getStatistics: async () => {
    return apiClient.get('/lease-contracts/statistics');
  },

  // 리스 계약 생성
  createContract: async (
    data: Omit<LeaseContract, 'id' | 'contractNumber' | 'createdAt' | 'updatedAt'>
  ) => {
    return apiClient.post('/lease-contracts', data);
  },

  // 리스 계약 업데이트
  updateContract: async (id: string, data: Partial<LeaseContract>) => {
    return apiClient.put(`/lease-contracts/${id}`, data);
  },

  // 리스 계약 중도 해지
  terminateContract: async (
    id: string,
    data: {
      termination_date: string;
      reason: string;
      current_mileage: number;
      early_termination_fee: number;
      excess_mileage_charge?: number;
      damage_charge?: number;
      total_settlement: number;
    }
  ) => {
    return apiClient.post(`/lease-contracts/${id}/terminate`, data);
  },

  // 주행거리 초과 확인
  checkMileageExcess: async (
    id: string,
    current_mileage: number,
    vehicle_initial_mileage: number
  ) => {
    return apiClient.get(`/lease-contracts/${id}/mileage-check`, {
      params: { current_mileage, vehicle_initial_mileage },
    });
  },
};

// 예약 API
export const reservationApi = {
  // 예약 목록 조회
  getReservations: async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    customer_id?: string;
    vehicle_id?: string;
    pickup_date?: string;
  }) => {
    return apiClient.get('/reservations', { params });
  },

  // 예약 상세 조회
  getReservation: async (id: string) => {
    return apiClient.get(`/reservations/${id}`);
  },

  // 오늘 픽업 예정 조회
  getTodayPickups: async () => {
    return apiClient.get('/reservations/today');
  },

  // 캘린더용 예약 조회
  getCalendarReservations: async (start_date: string, end_date: string) => {
    return apiClient.get('/reservations/calendar', {
      params: { start_date, end_date },
    });
  },

  // 예약 통계
  getStatistics: async () => {
    return apiClient.get('/reservations/statistics');
  },

  // 예약 생성
  createReservation: async (data: Omit<Reservation, 'id' | 'createdAt'>) => {
    return apiClient.post('/reservations', data);
  },

  // 예약 업데이트
  updateReservation: async (id: string, data: Partial<Reservation>) => {
    return apiClient.put(`/reservations/${id}`, data);
  },

  // 예약 확정
  confirmReservation: async (id: string) => {
    return apiClient.post(`/reservations/${id}/confirm`);
  },

  // 예약 취소
  cancelReservation: async (id: string) => {
    return apiClient.post(`/reservations/${id}/cancel`);
  },

  // 예약 완료
  completeReservation: async (id: string) => {
    return apiClient.post(`/reservations/${id}/complete`);
  },

  // 차량 이용 가능 여부 확인
  checkAvailability: async (vehicle_id: string, pickup_date: string, return_date?: string) => {
    return apiClient.get(`/reservations/check-availability/${vehicle_id}`, {
      params: { pickup_date, return_date },
    });
  },
};

// React Query 통합을 위한 쿼리 키
// 모든 API를 통합한 rentalApi export
export const rentalApi = {
  vehicle: vehicleApi,
  customer: customerApi,
  rentalContract: rentalContractApi,
  leaseContract: leaseContractApi,
  reservation: reservationApi,
};

interface BaseQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

interface VehicleQueryParams extends BaseQueryParams {
  status?: string;
  category?: string;
}

interface CustomerQueryParams extends BaseQueryParams {
  customer_type?: string;
  verification_status?: string;
}

interface ContractQueryParams extends BaseQueryParams {
  status?: string;
  customer_id?: string;
}

interface ReservationQueryParams extends ContractQueryParams {
  vehicle_id?: string;
  pickup_date?: string;
}

export const queryKeys = {
  vehicles: {
    all: ['vehicles'] as const,
    lists: () => [...queryKeys.vehicles.all, 'list'] as const,
    list: (params?: VehicleQueryParams) => [...queryKeys.vehicles.lists(), params] as const,
    details: () => [...queryKeys.vehicles.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.vehicles.details(), id] as const,
    available: () => [...queryKeys.vehicles.all, 'available'] as const,
    statistics: () => [...queryKeys.vehicles.all, 'statistics'] as const,
  },
  customers: {
    all: ['customers'] as const,
    lists: () => [...queryKeys.customers.all, 'list'] as const,
    list: (params?: CustomerQueryParams) => [...queryKeys.customers.lists(), params] as const,
    details: () => [...queryKeys.customers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.customers.details(), id] as const,
    contracts: (id: string) => [...queryKeys.customers.detail(id), 'contracts'] as const,
    statistics: () => [...queryKeys.customers.all, 'statistics'] as const,
  },
  rentalContracts: {
    all: ['rental-contracts'] as const,
    lists: () => [...queryKeys.rentalContracts.all, 'list'] as const,
    list: (params?: ContractQueryParams) => [...queryKeys.rentalContracts.lists(), params] as const,
    details: () => [...queryKeys.rentalContracts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.rentalContracts.details(), id] as const,
    expiring: (days?: number) => [...queryKeys.rentalContracts.all, 'expiring', days] as const,
    revenue: (params?: { start_date?: string; end_date?: string }) =>
      [...queryKeys.rentalContracts.all, 'revenue', params] as const,
  },
  leaseContracts: {
    all: ['lease-contracts'] as const,
    lists: () => [...queryKeys.leaseContracts.all, 'list'] as const,
    list: (params?: ContractQueryParams & { lease_type?: string }) =>
      [...queryKeys.leaseContracts.lists(), params] as const,
    details: () => [...queryKeys.leaseContracts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.leaseContracts.details(), id] as const,
    expiring: (days?: number) => [...queryKeys.leaseContracts.all, 'expiring', days] as const,
    statistics: () => [...queryKeys.leaseContracts.all, 'statistics'] as const,
    mileageCheck: (id: string) =>
      [...queryKeys.leaseContracts.detail(id), 'mileage-check'] as const,
  },
  reservations: {
    all: ['reservations'] as const,
    lists: () => [...queryKeys.reservations.all, 'list'] as const,
    list: (params?: ReservationQueryParams) => [...queryKeys.reservations.lists(), params] as const,
    details: () => [...queryKeys.reservations.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.reservations.details(), id] as const,
    today: () => [...queryKeys.reservations.all, 'today'] as const,
    calendar: (start: string, end: string) =>
      [...queryKeys.reservations.all, 'calendar', start, end] as const,
    statistics: () => [...queryKeys.reservations.all, 'statistics'] as const,
    availability: (vehicleId: string) =>
      [...queryKeys.reservations.all, 'availability', vehicleId] as const,
  },
};
