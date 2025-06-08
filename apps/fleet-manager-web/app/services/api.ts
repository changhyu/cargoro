import axios from 'axios';

import logger from './utils/logger';

// API 응답 타입 정의
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  page?: number;
  per_page?: number;
  total_items?: number;
  total_pages?: number;
}

// 차량 정보 타입
export interface Vehicle {
  id: string;
  vehicleId?: string;
  licensePlate?: string;
  plateNumber: string; // licensePlate의 별칭
  brand?: string;
  make: string; // brand의 별칭
  model: string;
  year: number;
  type?: 'sedan' | 'suv' | 'truck' | 'van';
  status:
    | 'active'
    | 'available'
    | 'in_use'
    | 'maintenance'
    | 'inactive'
    | 'reserved'
    | 'out_of_service'
    | 'idle';
  fuelType?: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  vinNumber?: string;
  vin?: string; // vinNumber의 별칭
  lastMaintenance?: string;
  nextMaintenance?: string;
  purchaseDate?: string;
  registrationDate?: string;
  insuranceExpiry?: string;
  imageUrl?: string;
  currentDriverId?: string;
  mileage?: number;
  fuelLevel?: number;
  lastInspection?: string;
  color?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// 차량 위치 정보 타입
export interface VehicleLocation {
  id: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

// 차량 목록 응답 타입
export interface VehiclesResponse {
  vehicles?: Vehicle[]; // 기존 구조 유지
  items?: Vehicle[]; // 새로운 구조 지원
  total: number;
  page?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
  itemsPerPage?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 차량 필터 타입
export interface VehicleFilters {
  status?: string;
  type?: string;
  brand?: string;
  page?: number;
  pageSize?: number;
  search?: string;
}

// 리스/렌트 계약 타입
export interface LeaseContract {
  id: string;
  vehicleId: string;
  clientId: string;
  clientName: string;
  startDate: string;
  endDate: string;
  type: 'lease' | 'rental';
  contractType?: 'lease' | 'rental'; // type의 별칭 추가
  status: 'active' | 'pending' | 'completed' | 'cancelled' | 'expired'; // expired 상태 추가
  monthlyPrice?: number;
  monthlyPayment?: number; // monthlyPrice의 별칭
  totalCost?: number; // 총 비용 추가
  provider?: string; // 계약 제공업체
  deposit?: number;
  terms?: string;
  notes?: string;
}

// 계약 결제 타입
export interface ContractPayment {
  id: string;
  contractId: string;
  amount: number;
  paymentDate: string;
  paymentType: string;
  status: string;
  description?: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 운전자 타입 정의
export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseType?: string;
  licenseExpiry: string; // licenseExpiryDate에서 변경
  isActive: boolean; // status 대신 boolean으로 변경
  restrictions?: string[];
  notes?: string;
  assignedVehicles?:
    | string[]
    | Array<{
        id: string;
        make?: string;
        model?: string;
        plateNumber?: string;
        type?: string;
      }>;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  address?: string;
  birthDate?: string;
  hireDate?: string;
  department?: string;
  position?: string;
  profileImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 운전자 입력 타입 정의
export type CreateDriverInput = Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateDriverInput = Partial<Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>>;

// 운전자 폼 데이터 타입 (새로 추가)
export interface DriverFormData {
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  licenseType?: string;
  restrictions?: string[];
  notes?: string;
  isActive?: boolean;
  department?: string;
  position?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}

// 운전자 필터 타입
export interface DriverFilters {
  isActive?: boolean; // status 대신 boolean으로 변경
  licenseType?: string;
  department?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// 운전자 페이지네이션 응답
export interface DriverListResponse {
  items: Driver[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 확장된 Driver 타입 정의 (Driver 타입에서 이미 정의된 속성들을 제거하고 추가 속성만 포함)
export interface ExtendedDriver extends Driver {
  vehicleAssignments?: VehicleAssignment[];
  performanceMetrics?: DriverPerformance;
  currentTrip?: DrivingRecord;
  totalTrips?: number;
  avgRating?: number;
  lastActivity?: string;
}

// 결제 생성 DTO
export interface CreatePaymentDto {
  paymentDate: string;
  amount: number;
  paymentType: string;
  status: 'pending' | 'completed' | 'failed'; // 결제 상태 추가
  referenceNumber?: string;
  notes?: string;
}

// 예약 관련 타입들 추가
export interface Reservation {
  id: string;
  customerName: string;
  contactNumber: string;
  vehicleId: string;
  vehicleName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  reservationType: 'rental' | 'maintenance' | 'inspection';
  workshopName?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// LeaseContract 타입에 누락된 속성들 추가
export interface LeaseContractExtended extends LeaseContract {
  contractType?: 'lease' | 'rental'; // type의 별칭
  totalCost?: number; // 총 비용
}

// 정비 관련 타입 정의
// 정비 상태 타입
export type MaintenanceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'scheduled';

export interface Maintenance {
  id: string;
  vehicleId: string;
  title: string;
  description?: string;
  type: 'scheduled' | 'repair' | 'inspection' | 'emergency';
  status: MaintenanceStatus;
  scheduledDate: string;
  completedDate?: string;
  cost?: number;
  serviceCenterId?: string;
  serviceCenterName?: string;
  technician?: string;
  notes?: string;
  parts?: MaintenancePart[];
  createdAt: string;
  updatedAt: string;
}

export interface MaintenancePart {
  id: string;
  maintenanceId: string;
  name: string;
  partNumber?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier?: string;
  notes?: string;
}

export interface MaintenanceFilters {
  vehicleId?: string;
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  serviceCenterId?: string;
  page?: number;
  pageSize?: number;
}

export interface MaintenanceListResponse {
  data: Maintenance[];
  items?: Maintenance[];
  total: number;
  page: number;
  limit: number;
  pageSize?: number;
  totalPages?: number;
}

// 알림 관련 타입 정의
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'license_expiry';
  title: string;
  message: string;
  read: boolean;
  isRead?: boolean;
  createdAt: string;
  updatedAt?: string;
  userId?: string;
  targetType?: 'driver' | 'vehicle' | 'maintenance';
  targetId?: string;
}

// 디버깅 로그 유틸리티 함수
const logDebug = (message: string, data?: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    if (data) {
      logger.info(`[Fleet Manager] ${message}`, data);
    } else {
      logger.info(`[Fleet Manager] ${message}`);
    }
  }
};

// 오류 로그 유틸리티 함수
const logError = (message: string, error?: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    if (error) {
      logger.error(`[Fleet Manager Error] ${message}`, error);
    } else {
      logger.error(`[Fleet Manager Error] ${message}`);
    }
  }
};

// API 클라이언트 인스턴스
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// 모의 차량 데이터
const mockVehicles: Vehicle[] = [
  {
    id: '1',
    vehicleId: 'V001',
    licensePlate: '서울 12가 3456',
    plateNumber: '서울 12가 3456',
    brand: '현대',
    make: '현대',
    model: '아반떼',
    year: 2022,
    type: 'sedan',
    status: 'active',
    fuelType: 'gasoline',
    vinNumber: 'KMHD041ABCD123456',
    vin: 'KMHD041ABCD123456',
    lastMaintenance: '2023-04-15',
    nextMaintenance: '2023-10-15',
    purchaseDate: '2022-01-10',
    registrationDate: '2022-01-15',
    insuranceExpiry: '2023-12-31',
    imageUrl: '/images/vehicles/avante.jpg',
    mileage: 15430,
    fuelLevel: 0.75,
    lastInspection: '2023-04-15',
    color: '흰색',
  },
  {
    id: '2',
    vehicleId: 'V002',
    licensePlate: '서울 34나 5678',
    plateNumber: '서울 34나 5678',
    brand: '기아',
    make: '기아',
    model: 'K5',
    year: 2021,
    type: 'sedan',
    status: 'idle',
    fuelType: 'hybrid',
    vinNumber: 'KNAG341EFGH789012',
    vin: 'KNAG341EFGH789012',
    lastMaintenance: '2023-05-20',
    nextMaintenance: '2023-11-20',
    purchaseDate: '2021-06-05',
    registrationDate: '2021-06-10',
    insuranceExpiry: '2023-12-31',
    imageUrl: '/images/vehicles/k5.jpg',
    mileage: 28750,
    fuelLevel: 0.45,
    lastInspection: '2023-05-20',
    color: '검정색',
  },
  {
    id: '3',
    vehicleId: 'V003',
    licensePlate: '서울 56다 7890',
    plateNumber: '서울 56다 7890',
    brand: 'BMW',
    make: 'BMW',
    model: '5시리즈',
    year: 2022,
    type: 'sedan',
    status: 'active',
    fuelType: 'gasoline',
    vinNumber: 'WBA5A31IJKL345678',
    vin: 'WBA5A31IJKL345678',
    lastMaintenance: '2023-06-10',
    nextMaintenance: '2023-12-10',
    purchaseDate: '2022-03-15',
    registrationDate: '2022-03-20',
    insuranceExpiry: '2023-12-31',
    imageUrl: '/images/vehicles/bmw5.jpg',
    mileage: 12800,
    fuelLevel: 0.65,
    lastInspection: '2023-06-10',
    color: '회색',
  },
  {
    id: '4',
    vehicleId: 'V004',
    licensePlate: '서울 78라 1234',
    plateNumber: '서울 78라 1234',
    brand: '현대',
    make: '현대',
    model: '투싼',
    year: 2021,
    type: 'suv',
    status: 'maintenance',
    fuelType: 'diesel',
    vinNumber: 'KMHNU81MNOP901234',
    vin: 'KMHNU81MNOP901234',
    lastMaintenance: '2023-06-25',
    nextMaintenance: '2023-12-25',
    purchaseDate: '2021-08-20',
    registrationDate: '2021-08-25',
    insuranceExpiry: '2023-12-31',
    imageUrl: '/images/vehicles/tucson.jpg',
    mileage: 32150,
    fuelLevel: 0.25,
    lastInspection: '2023-06-25',
    color: '파란색',
  },
  {
    id: '5',
    vehicleId: 'V005',
    licensePlate: '서울 90마 5678',
    plateNumber: '서울 90마 5678',
    brand: '테슬라',
    make: '테슬라',
    model: '모델 3',
    year: 2022,
    type: 'sedan',
    status: 'out_of_service',
    fuelType: 'electric',
    vinNumber: 'TSLAE31QRST567890',
    vin: 'TSLAE31QRST567890',
    lastMaintenance: '2023-05-05',
    nextMaintenance: '2023-11-05',
    purchaseDate: '2022-02-10',
    registrationDate: '2022-02-15',
    insuranceExpiry: '2023-12-31',
    imageUrl: '/images/vehicles/tesla3.jpg',
    mileage: 18300,
    fuelLevel: 0.15,
    lastInspection: '2023-05-05',
    color: '빨간색',
  },
];

// 차량 서비스
export const vehicleService = {
  // 차량 목록 가져오기 (매개변수 타입 수정)
  getVehicles: async (filters: VehicleFilters = {}): Promise<VehiclesResponse> => {
    try {
      // 실제 API 엔드포인트가 구현되어 있다면 다음과 같이 사용
      // const response = await api.get<ApiResponse<VehiclesResponse>>('/vehicles', { params: filters });
      // return response.data.data;

      // 임시 데이터 (모의 응답) - 백엔드 API 구조에 맞게 수정
      return {
        vehicles: mockVehicles,
        total: mockVehicles.length,
        pagination: {
          page: filters.page || 1,
          limit: filters.pageSize || 20, // pageSize를 limit으로 매핑
          total: mockVehicles.length,
          totalPages: Math.ceil(mockVehicles.length / (filters.pageSize || 20)),
        },
      };
    } catch (error) {
      logError('차량 목록 로딩 오류:', error);
      throw error;
    }
  },

  // 특정 차량 정보 가져오기
  getVehicle: async (id: string): Promise<Vehicle | null> => {
    // 실제 API 요청을 모의 데이터로 대체
    return new Promise(resolve => {
      setTimeout(() => {
        const vehicle = mockVehicles.find(v => v.id === id || v.vehicleId === id) || null;
        resolve(vehicle);
      }, 300);
    });
  },

  // 여러 차량 정보 가져오기
  getMultipleVehicles: async (ids: string[]): Promise<Vehicle[]> => {
    // 실제 API 요청을 모의 데이터로 대체
    return new Promise(resolve => {
      setTimeout(() => {
        const vehicles = mockVehicles.filter(v => {
          const vehicleId = v.vehicleId;
          return ids.includes(v.id) || (vehicleId && ids.includes(vehicleId));
        });
        resolve(vehicles);
      }, 300);
    });
  },

  // 차량 상태별 통계 가져오기
  getVehicleStatistics: async (): Promise<{
    total: number;
    active: number;
    idle: number;
    maintenance: number;
    outOfService: number;
  }> => {
    // 실제 API 요청을 모의 데이터로 대체
    return new Promise(resolve => {
      setTimeout(() => {
        const total = mockVehicles.length;
        const active = mockVehicles.filter(v => v.status === 'active').length;
        const idle = mockVehicles.filter(v => v.status === 'idle').length;
        const maintenance = mockVehicles.filter(v => v.status === 'maintenance').length;
        const outOfService = mockVehicles.filter(v => v.status === 'out_of_service').length;

        resolve({
          total,
          active,
          idle,
          maintenance,
          outOfService,
        });
      }, 300);
    });
  },

  // 차량 상세 조회
  getVehicleById: async (id: string): Promise<Vehicle> => {
    try {
      // 실제 API 엔드포인트가 구현되어 있다면 다음과 같이 사용
      // const response = await api.get<ApiResponse<Vehicle>>(`/vehicles/${id}`);
      // return response.data.data;

      // 임시 데이터 (모의 응답)
      const mockVehiclesResponse = await vehicleService.getVehicles();
      const vehicles = mockVehiclesResponse.vehicles ?? [];
      const vehicle = vehicles.find(v => v.id === id || v.vehicleId === id);

      if (!vehicle) {
        throw new Error('차량을 찾을 수 없습니다.');
      }

      return vehicle;
    } catch (error) {
      logError(`차량 ID ${id} 조회 중 오류:`, error);
      throw error;
    }
  },

  // 차량 위치 조회
  getVehicleLocation: async (id: string): Promise<VehicleLocation> => {
    try {
      // 실제 API 엔드포인트가 구현되어 있다면 다음과 같이 사용
      // const response = await api.get<ApiResponse<VehicleLocation>>(`/vehicles/${id}/location`);
      // return response.data.data;

      // 임시 데이터 (모의 응답)
      const mockVehiclesResponse = await vehicleService.getVehicles();
      const vehicles = mockVehiclesResponse.vehicles ?? [];
      const vehicle = vehicles.find(v => v.id === id || v.vehicleId === id);

      if (!vehicle || !vehicle.location) {
        throw new Error('차량 위치 정보를 찾을 수 없습니다.');
      }

      return {
        id: vehicle.id,
        vehicleId: vehicle.vehicleId ?? vehicle.id,
        latitude: vehicle.location.latitude,
        longitude: vehicle.location.longitude,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logError(`차량 ID ${id} 위치 조회 중 오류:`, error);
      throw error;
    }
  },

  // 차량 삭제 (누락된 함수 추가)
  deleteVehicle: async (id: string): Promise<void> => {
    try {
      // 실제 API 엔드포인트가 구현되어 있다면 다음과 같이 사용
      // await api.delete(`/vehicles/${id}`);

      // 임시 데이터 (모의 응답)
      await new Promise(resolve => setTimeout(resolve, 300));
      logDebug(`차량 삭제 완료 (ID: ${id})`);
    } catch (error) {
      logError(`차량 ID ${id} 삭제 중 오류:`, error);
      throw error;
    }
  },
};

// 리스/렌트 API 서비스
export const leaseService = {
  // 계약 목록 조회
  async getLeases(filters: Record<string, unknown> = {}): Promise<LeaseContract[]> {
    try {
      const response = await axios.get('/api/leases', { params: filters });
      return response.data;
    } catch (error) {
      logger.error('계약 목록 조회 오류:', error);
      throw new Error('계약 목록을 불러오는데 실패했습니다.');
    }
  },

  // 차량별 계약 조회
  async getLeasesByVehicleId(vehicleId: string): Promise<LeaseContract[]> {
    try {
      const response = await axios.get(`/api/vehicles/${vehicleId}/leases`);
      return response.data;
    } catch (error) {
      logger.error(`차량 계약 조회 오류(vehicleId: ${vehicleId}):`, error);
      throw new Error('차량 계약 정보를 불러오는데 실패했습니다.');
    }
  },

  // 특정 계약 상세 조회
  async getLeaseById(id: string): Promise<LeaseContract> {
    try {
      const response = await axios.get(`/api/leases/${id}`);
      return response.data;
    } catch (error) {
      logger.error(`계약 상세 조회 오류(ID: ${id}):`, error);
      throw new Error('계약 정보를 불러오는데 실패했습니다.');
    }
  },

  // 계약 결제 내역 조회
  async getLeasePayments(leaseId: string): Promise<ContractPayment[]> {
    try {
      const response = await axios.get(`/api/leases/${leaseId}/payments`);
      return response.data;
    } catch (error) {
      logger.error(`계약 결제 내역 조회 오류(ID: ${leaseId}):`, error);
      throw new Error('계약 결제 내역을 불러오는데 실패했습니다.');
    }
  },

  // 계약 생성
  async createLease(leaseData: Omit<LeaseContract, 'id'>): Promise<LeaseContract> {
    try {
      const response = await axios.post('/api/leases', leaseData);
      return response.data;
    } catch (error) {
      logger.error('계약 생성 오류:', error);
      throw new Error('계약 정보를 저장하는데 실패했습니다.');
    }
  },

  // 계약 수정
  async updateLease(id: string, leaseData: Partial<LeaseContract>): Promise<LeaseContract> {
    try {
      const response = await axios.put(`/api/leases/${id}`, leaseData);
      return response.data;
    } catch (error) {
      logger.error(`계약 수정 오류(ID: ${id}):`, error);
      throw new Error('계약 정보를 수정하는데 실패했습니다.');
    }
  },

  // 계약 상태 업데이트
  async updateLeaseStatus(id: string, status: string): Promise<LeaseContract> {
    try {
      const response = await axios.patch(`/api/leases/${id}/status`, { status });
      return response.data;
    } catch (error) {
      logger.error(`계약 상태 업데이트 오류(ID: ${id}):`, error);
      throw new Error('계약 상태를 변경하는데 실패했습니다.');
    }
  },

  // 계약 삭제
  async deleteLease(id: string): Promise<void> {
    try {
      await axios.delete(`/api/leases/${id}`);
    } catch (error) {
      logger.error(`계약 삭제 오류(ID: ${id}):`, error);
      throw new Error('계약을 삭제하는데 실패했습니다.');
    }
  },

  // 결제 내역 추가
  async addLeasePayment(
    leaseId: string,
    paymentData: Omit<ContractPayment, 'id' | 'contractId' | 'createdAt' | 'updatedAt'>
  ): Promise<ContractPayment> {
    try {
      const response = await axios.post(`/api/leases/${leaseId}/payments`, paymentData);
      return response.data;
    } catch (error) {
      logger.error(`결제 내역 추가 오류(계약 ID: ${leaseId}):`, error);
      throw new Error('결제 내역을 추가하는데 실패했습니다.');
    }
  },

  // 결제 내역 수정
  async updateLeasePayment(
    leaseId: string,
    paymentId: string,
    paymentData: Partial<Omit<ContractPayment, 'id' | 'contractId' | 'createdAt' | 'updatedAt'>>
  ): Promise<ContractPayment> {
    try {
      const response = await axios.put(`/api/leases/${leaseId}/payments/${paymentId}`, paymentData);
      return response.data;
    } catch (error) {
      logger.error(`결제 내역 수정 오류(계약 ID: ${leaseId}, 결제 ID: ${paymentId}):`, error);
      throw new Error('결제 내역을 수정하는데 실패했습니다.');
    }
  },

  // 결제 내역 삭제
  async deleteLeasePayment(leaseId: string, paymentId: string): Promise<void> {
    try {
      await axios.delete(`/api/leases/${leaseId}/payments/${paymentId}`);
    } catch (error) {
      logger.error(`결제 내역 삭제 오류(계약 ID: ${leaseId}, 결제 ID: ${paymentId}):`, error);
      throw new Error('결제 내역을 삭제하는데 실패했습니다.');
    }
  },
};

// 운전자 API 서비스
export const driverService = {
  // 운전자 목록 조회
  async getDrivers(filters: DriverFilters = {}): Promise<DriverListResponse> {
    try {
      const response = await axios.get('/api/drivers', { params: filters });
      return response.data;
    } catch (error) {
      logger.error('운전자 목록 조회 오류:', error);
      throw new Error('운전자 목록을 불러오는데 실패했습니다.');
    }
  },

  // 운전자 상세 조회
  async getDriverById(id: string): Promise<Driver> {
    try {
      const response = await axios.get(`/api/drivers/${id}`);
      return response.data;
    } catch (error) {
      logger.error(`운전자 상세 조회 오류(ID: ${id}):`, error);
      throw new Error('운전자 정보를 불러오는데 실패했습니다.');
    }
  },

  // 운전자 생성
  async createDriver(driverData: Omit<Driver, 'id'> | DriverFormData): Promise<Driver> {
    try {
      // DriverFormData를 Driver 타입으로 변환
      const dataToSend = {
        ...driverData,
        isActive: driverData.isActive ?? true, // 기본값 true
        assignedVehicles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const response = await axios.post('/api/drivers', dataToSend);
      return response.data;
    } catch (error) {
      logger.error('운전자 생성 오류:', error);
      throw new Error('운전자 정보를 저장하는데 실패했습니다.');
    }
  },

  // 운전자 수정
  async updateDriver(id: string, driverData: Partial<Driver>): Promise<Driver> {
    try {
      const response = await axios.put(`/api/drivers/${id}`, driverData);
      return response.data;
    } catch (error) {
      logger.error(`운전자 수정 오류(ID: ${id}):`, error);
      throw new Error('운전자 정보를 수정하는데 실패했습니다.');
    }
  },

  // 운전자 삭제
  async deleteDriver(id: string): Promise<void> {
    try {
      await axios.delete(`/api/drivers/${id}`);
    } catch (error) {
      logger.error(`운전자 삭제 오류(ID: ${id}):`, error);
      throw new Error('운전자를 삭제하는데 실패했습니다.');
    }
  },

  // 운전자 상태 토글 (새로 추가)
  async toggleDriverStatus(id: string, isActive: boolean): Promise<Driver> {
    try {
      const response = await axios.patch(`/api/drivers/${id}/status`, {
        isActive,
      });
      return response.data;
    } catch (error) {
      logger.error(`운전자 상태 변경 오류(ID: ${id}):`, error);
      throw new Error('운전자 상태를 변경하는데 실패했습니다.');
    }
  },

  // 차량 배정
  async assignVehicle(driverId: string, vehicleId: string): Promise<void> {
    try {
      await axios.post(`/api/drivers/${driverId}/assign-vehicle`, { vehicleId });
    } catch (error) {
      logger.error(`차량 배정 오류(운전자 ID: ${driverId}, 차량 ID: ${vehicleId}):`, error);
      throw new Error('차량 배정에 실패했습니다.');
    }
  },

  // 차량 배정 해제
  async unassignVehicle(driverId: string, vehicleId: string): Promise<void> {
    try {
      await axios.delete(`/api/drivers/${driverId}/assign-vehicle/${vehicleId}`);
    } catch (error) {
      logger.error(`차량 배정 해제 오류(운전자 ID: ${driverId}, 차량 ID: ${vehicleId}):`, error);
      throw new Error('차량 배정 해제에 실패했습니다.');
    }
  },

  // Excel 내보내기 함수 수정
  async exportDriversToExcel(options: {
    dateFrom: string;
    dateTo: string;
    format: 'excel' | 'csv';
    includePerformanceData: boolean;
    includeVehicleAssignments: boolean;
    includeDrivingHistory: boolean;
    includeInactiveDrivers: boolean;
  }): Promise<Blob> {
    try {
      // 실제 구현에서는 Excel 라이브러리(예: xlsx)를 사용
      // 현재는 모의 구현
      logDebug('운전자 데이터를 Excel로 내보내기:', options);

      // 모의 데이터 가져오기
      const drivers = await this.getDrivers({
        isActive: !options.includeInactiveDrivers ? true : undefined,
      });

      // CSV 형태로 간단히 구현
      const headers = ['이름', '이메일', '전화번호', '면허번호', '면허만료일', '상태'];
      const csvContent = [
        headers.join(','),
        ...drivers.items.map(driver =>
          [
            driver.name,
            driver.email,
            driver.phone,
            driver.licenseNumber,
            driver.licenseExpiry,
            driver.isActive ? '활성' : '비활성',
          ].join(',')
        ),
      ].join('\n');

      // Blob 반환
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      return blob;
    } catch (error) {
      logger.error('Excel 내보내기 오류:', error);
      throw new Error('Excel 내보내기에 실패했습니다.');
    }
  },
};

// 정비 API 서비스
export const maintenanceService = {
  // 정비 목록 조회
  async getMaintenances(filters: MaintenanceFilters = {}): Promise<MaintenanceListResponse> {
    try {
      // 실제 API 호출 시 주석 해제
      // const response = await api.get('/maintenance', { params: filters });
      // return response.data;

      // 모의 데이터
      const mockMaintenances: Maintenance[] = [
        {
          id: '1',
          vehicleId: 'V001',
          title: '정기 점검',
          description: '6개월 정기 점검',
          type: 'scheduled',
          status: 'completed',
          scheduledDate: '2023-06-15',
          completedDate: '2023-06-15',
          cost: 150000,
          serviceCenterName: '현대자동차 서비스센터',
          technician: '김정비',
          createdAt: '2023-06-10T09:00:00Z',
          updatedAt: '2023-06-15T17:00:00Z',
        },
      ];

      return {
        data: mockMaintenances,
        items: mockMaintenances,
        total: mockMaintenances.length,
        page: filters.page || 1,
        limit: filters.pageSize || 10,
        pageSize: filters.pageSize || 10,
        totalPages: Math.ceil(mockMaintenances.length / (filters.pageSize || 10)),
      };
    } catch (error) {
      logger.error('정비 목록 조회 오류:', error);
      throw new Error('정비 목록을 불러오는데 실패했습니다.');
    }
  },

  // 정비 상세 조회
  async getMaintenance(id: string): Promise<Maintenance | null> {
    try {
      // 모의 데이터
      return {
        id,
        vehicleId: 'V001',
        title: '정기 점검',
        description: '6개월 정기 점검',
        type: 'scheduled',
        status: 'completed',
        scheduledDate: '2023-06-15',
        completedDate: '2023-06-15',
        cost: 150000,
        serviceCenterName: '현대자동차 서비스센터',
        technician: '김정비',
        createdAt: '2023-06-10T09:00:00Z',
        updatedAt: '2023-06-15T17:00:00Z',
      };
    } catch (error) {
      logger.error(`정비 상세 조회 오류(ID: ${id}):`, error);
      return null;
    }
  },

  // 정비 상세 조회 (별칭)
  async getMaintenanceById(id: string): Promise<Maintenance | null> {
    return this.getMaintenance(id);
  },

  // 정비 생성
  async createMaintenance(
    data: Omit<Maintenance, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Maintenance> {
    try {
      const newMaintenance: Maintenance = {
        ...data,
        id: `M${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newMaintenance;
    } catch (error) {
      logger.error('정비 생성 오류:', error);
      throw new Error('정비를 생성하는데 실패했습니다.');
    }
  },

  // 정비 수정
  async updateMaintenance(id: string, data: Partial<Maintenance>): Promise<Maintenance> {
    try {
      const existingMaintenance = await this.getMaintenance(id);
      if (!existingMaintenance) {
        throw new Error('정비를 찾을 수 없습니다.');
      }

      const updatedMaintenance: Maintenance = {
        ...existingMaintenance,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return updatedMaintenance;
    } catch (error) {
      logger.error(`정비 수정 오류(ID: ${id}):`, error);
      throw new Error('정비를 수정하는데 실패했습니다.');
    }
  },

  // 정비 상태 업데이트
  async updateMaintenanceStatus(id: string, status: string): Promise<Maintenance> {
    return this.updateMaintenance(id, { status: status as Maintenance['status'] });
  },

  // 정비 삭제
  async deleteMaintenance(id: string): Promise<void> {
    try {
      logDebug(`정비 삭제: ${id}`);
    } catch (error) {
      logger.error(`정비 삭제 오류(ID: ${id}):`, error);
      throw new Error('정비를 삭제하는데 실패했습니다.');
    }
  },

  // 차량별 정비 이력 조회
  async getVehicleMaintenanceHistory(
    vehicleId: string,
    filters?: Partial<MaintenanceFilters>
  ): Promise<MaintenanceListResponse> {
    const allFilters = { ...filters, vehicleId };
    return this.getMaintenances(allFilters);
  },
};

// 알림 API 서비스
export const notificationService = {
  // 알림 목록 조회
  async getNotifications(userId?: string): Promise<Notification[]> {
    try {
      // 모의 데이터
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'license_expiry',
          title: '면허 만료 알림',
          message: '김운전 운전자의 면허가 30일 후 만료됩니다.',
          read: false,
          isRead: false,
          createdAt: '2023-06-01T09:00:00Z',
          userId: userId || 'user1',
          targetType: 'driver',
          targetId: 'D001',
        },
        {
          id: '2',
          type: 'warning',
          title: '차량 점검 필요',
          message: '차량 V001의 다음 점검 예정일이 지났습니다.',
          read: false,
          isRead: false,
          createdAt: '2023-06-02T10:00:00Z',
          userId: userId || 'user1',
          targetType: 'vehicle',
          targetId: 'V001',
        },
      ];

      return mockNotifications;
    } catch (error) {
      logger.error('알림 목록 조회 오류:', error);
      throw new Error('알림 목록을 불러오는데 실패했습니다.');
    }
  },

  // 알림 읽음 처리
  async markAsRead(notificationId: string): Promise<void> {
    try {
      logDebug(`알림 읽음 처리: ${notificationId}`);
    } catch (error) {
      logger.error(`알림 읽음 처리 오류(ID: ${notificationId}):`, error);
      throw new Error('알림을 읽음 처리하는데 실패했습니다.');
    }
  },

  // 알림 생성
  async createNotification(data: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    try {
      const newNotification: Notification = {
        ...data,
        id: `N${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      return newNotification;
    } catch (error) {
      logger.error('알림 생성 오류:', error);
      throw new Error('알림을 생성하는데 실패했습니다.');
    }
  },

  // 면허 만료 알림 조회
  async getLicenseExpiryAlerts(): Promise<Notification[]> {
    const allNotifications = await this.getNotifications();
    return allNotifications.filter(notification => notification.type === 'license_expiry');
  },

  // 모든 알림 읽음 처리
  async markAllAsRead(): Promise<void> {
    try {
      logDebug('모든 알림 읽음 처리');
    } catch (error) {
      logger.error('모든 알림 읽음 처리 오류:', error);
      throw new Error('모든 알림을 읽음 처리하는데 실패했습니다.');
    }
  },
};

// 운행 기록 API 서비스
export const drivingRecordService = {
  // 운전자별 운행 기록 조회
  async getRecordsByDriver(
    driverId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      status?: string;
    }
  ): Promise<DrivingRecord[]> {
    try {
      // 실제 API 호출 시 주석 해제
      // const response = await axios.get(`/api/drivers/${driverId}/driving-records`, { params: filters });
      // return response.data;

      // 모의 데이터
      const mockRecords: DrivingRecord[] = [
        {
          id: 'DR001',
          driverId,
          vehicleId: 'V001',
          vehicle: {
            id: 'V001',
            make: '현대',
            model: '아반떼',
            plateNumber: '서울 12가 3456',
          },
          startTime: '2023-06-01T09:00:00Z',
          endTime: '2023-06-01T11:30:00Z',
          startLocation: {
            address: '서울시 강남구',
            latitude: 37.4979,
            longitude: 127.0276,
          },
          endLocation: {
            address: '서울시 종로구',
            latitude: 37.5729,
            longitude: 126.9794,
          },
          distance: 15.5,
          status: 'completed',
          averageSpeed: 45.2,
          maxSpeed: 80.5,
          fuelConsumption: 1.8,
          purpose: '업무',
          violations: [
            {
              type: 'speeding',
              timestamp: '2023-06-01T10:15:00Z',
              severity: 'low',
              details: '제한속도 60km/h 구간에서 75km/h로 주행',
              location: {
                latitude: 37.5229,
                longitude: 127.0232,
              },
            },
          ],
        },
        {
          id: 'DR002',
          driverId,
          vehicleId: 'V002',
          vehicle: {
            id: 'V002',
            make: '기아',
            model: 'K5',
            plateNumber: '서울 34나 5678',
          },
          startTime: '2023-06-02T14:00:00Z',
          endTime: '2023-06-02T15:30:00Z',
          startLocation: {
            address: '서울시 서초구',
            latitude: 37.4837,
            longitude: 127.0324,
          },
          endLocation: {
            address: '서울시 광진구',
            latitude: 37.5384,
            longitude: 127.0822,
          },
          distance: 12.3,
          status: 'completed',
          averageSpeed: 38.5,
          maxSpeed: 65.0,
          fuelConsumption: 1.2,
          purpose: '배송',
          violations: [],
        },
      ];

      // 필터링 적용
      let filteredRecords = mockRecords;

      if (filters?.status && filters.status !== 'all') {
        filteredRecords = filteredRecords.filter(record => record.status === filters.status);
      }

      if (filters?.startDate) {
        const startDate = new Date(filters.startDate);
        filteredRecords = filteredRecords.filter(record => new Date(record.startTime) >= startDate);
      }

      if (filters?.endDate) {
        const endDate = new Date(filters.endDate);
        filteredRecords = filteredRecords.filter(record => new Date(record.startTime) <= endDate);
      }

      return filteredRecords;
    } catch (error) {
      logger.error(`운전자 운행 기록 조회 오류(ID: ${driverId}):`, error);
      throw new Error('운행 기록을 불러오는데 실패했습니다.');
    }
  },

  // 차량별 운행 기록 조회
  async getRecordsByVehicle(
    vehicleId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      status?: string;
    }
  ): Promise<DrivingRecord[]> {
    try {
      // 실제 API 호출 시 주석 해제
      // const response = await axios.get(`/api/vehicles/${vehicleId}/driving-records`, { params: filters });
      // return response.data;

      // 모의 데이터 반환
      return [];
    } catch (error) {
      logger.error(`차량 운행 기록 조회 오류(ID: ${vehicleId}):`, error);
      throw new Error('운행 기록을 불러오는데 실패했습니다.');
    }
  },

  // 운행 기록 상세 조회
  async getRecordById(id: string): Promise<DrivingRecord> {
    try {
      // 실제 API 호출 시 주석 해제
      // const response = await axios.get(`/api/driving-records/${id}`);
      // return response.data;

      // 모의 데이터 반환
      throw new Error('운행 기록을 찾을 수 없습니다.');
    } catch (error) {
      logger.error(`운행 기록 상세 조회 오류(ID: ${id}):`, error);
      throw new Error('운행 기록을 불러오는데 실패했습니다.');
    }
  },
};

// 누락된 타입 정의들 추가
export interface VehicleAssignment {
  id: string;
  driverId: string;
  vehicleId: string;
  assignedAt: string;
  unassignedAt?: string;
  status: 'active' | 'inactive';
}

export interface DriverPerformance {
  id: string;
  driverId: string;
  period: string;
  totalDistance: number;
  totalTrips: number;
  averageRating: number;
  safetyScore: number;
  fuelEfficiency: number;
  punctualityScore: number;
}

// 위반 기록 타입
export interface ViolationRecord {
  id?: string;
  type: 'speeding' | 'harsh_braking' | 'harsh_acceleration' | 'sharp_turn';
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  details?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface DrivingRecord {
  id: string;
  driverId: string;
  vehicleId: string;
  vehicle?: {
    id: string;
    make?: string;
    model?: string;
    plateNumber?: string;
  };
  startTime: string;
  endTime?: string;
  startLocation?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  endLocation?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  distance?: number;
  status: 'ongoing' | 'completed' | 'cancelled';
  averageSpeed?: number;
  maxSpeed?: number;
  fuelConsumption?: number;
  purpose?: string;
  violations?: ViolationRecord[];
}
