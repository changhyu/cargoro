import type {
  Vehicle,
  Customer,
  RentalContract,
  LeaseContract,
  ContractStatusType,
  InsuranceType,
  LeaseTypeType,
} from '@/app/types/rental.types';

export const sampleVehicles: Omit<Vehicle, 'id'>[] = [
  {
    registrationNumber: '12가3456',
    make: '현대',
    model: '아반떼 CN7',
    year: 2024,
    color: '화이트',
    vin: 'KMHD841DBPU123456',
    status: 'AVAILABLE',
    mileage: 5420,
    fuelType: 'GASOLINE',
    transmission: 'AUTOMATIC',
    category: 'MIDSIZE',
    features: ['네비게이션', '후방카메라', '스마트키', '열선시트'],
    images: [],
    purchaseDate: new Date('2024-01-15'),
    purchasePrice: 28000000,
    currentValue: 26000000,
    lastMaintenanceDate: new Date('2024-05-01'),
    nextMaintenanceDate: new Date('2024-08-01'),
  },
  {
    registrationNumber: '23나4567',
    make: '기아',
    model: 'K5 DL3',
    year: 2023,
    color: '블랙',
    vin: 'KNAG411DPN5123456',
    status: 'AVAILABLE',
    mileage: 15230,
    fuelType: 'GASOLINE',
    transmission: 'AUTOMATIC',
    category: 'MIDSIZE',
    features: ['네비게이션', '후방카메라', '스마트키', '통풍시트', 'HUD'],
    images: [],
    purchaseDate: new Date('2023-06-20'),
    purchasePrice: 32000000,
    currentValue: 28000000,
    lastMaintenanceDate: new Date('2024-03-15'),
    nextMaintenanceDate: new Date('2024-06-15'),
  },
  {
    registrationNumber: '34다5678',
    make: '현대',
    model: '그랜저 IG FL',
    year: 2023,
    color: '그레이',
    vin: 'KMHG641GBNU234567',
    status: 'RENTED',
    mileage: 22150,
    fuelType: 'GASOLINE',
    transmission: 'AUTOMATIC',
    category: 'FULL_SIZE',
    features: ['네비게이션', '후방카메라', '스마트키', '통풍시트', 'HUD', '서라운드뷰'],
    images: [],
    purchaseDate: new Date('2023-03-10'),
    purchasePrice: 45000000,
    currentValue: 40000000,
    lastMaintenanceDate: new Date('2024-02-20'),
    nextMaintenanceDate: new Date('2024-05-20'),
  },
  {
    registrationNumber: '45라6789',
    make: '기아',
    model: '카니발 KA4',
    year: 2024,
    color: '실버',
    vin: 'KNAJS411APS345678',
    status: 'AVAILABLE',
    mileage: 8900,
    fuelType: 'DIESEL',
    transmission: 'AUTOMATIC',
    category: 'VAN',
    features: ['네비게이션', '후방카메라', '스마트키', '파워슬라이딩도어', '9인승'],
    images: [],
    purchaseDate: new Date('2024-02-01'),
    purchasePrice: 48000000,
    currentValue: 45000000,
    lastMaintenanceDate: new Date('2024-04-15'),
    nextMaintenanceDate: new Date('2024-07-15'),
  },
  {
    registrationNumber: '56마7890',
    make: '현대',
    model: '아이오닉5',
    year: 2024,
    color: '블루',
    vin: 'KMHL141DCPU456789',
    status: 'AVAILABLE',
    mileage: 3200,
    fuelType: 'ELECTRIC',
    transmission: 'AUTOMATIC',
    category: 'MIDSIZE',
    features: ['네비게이션', '후방카메라', '스마트키', 'V2L', '원격주차', 'OTA업데이트'],
    images: [],
    purchaseDate: new Date('2024-03-01'),
    purchasePrice: 55000000,
    currentValue: 52000000,
    lastMaintenanceDate: new Date('2024-05-01'),
    nextMaintenanceDate: new Date('2024-11-01'),
  },
];

export const sampleCustomers: Omit<Customer, 'id' | 'registeredAt'>[] = [
  {
    type: 'INDIVIDUAL',
    name: '김민수',
    email: 'minsu.kim@example.com',
    phone: '010-1234-5678',
    address: '서울특별시 강남구 테헤란로 123',
    licenseNumber: '12-34-567890-12',
    verificationStatus: 'VERIFIED',
    creditScore: 850,
  },
  {
    type: 'INDIVIDUAL',
    name: '이영희',
    email: 'younghee.lee@example.com',
    phone: '010-2345-6789',
    address: '서울특별시 서초구 서초대로 456',
    licenseNumber: '23-45-678901-23',
    verificationStatus: 'VERIFIED',
    creditScore: 780,
  },
  {
    type: 'CORPORATE',
    name: '(주)테크솔루션',
    email: 'contact@techsolution.com',
    phone: '02-1234-5678',
    address: '서울특별시 강남구 삼성로 789',
    businessNumber: '123-45-67890',
    verificationStatus: 'VERIFIED',
    creditScore: 900,
  },
  {
    type: 'CORPORATE',
    name: '(주)스마트물류',
    email: 'info@smartlogistics.com',
    phone: '02-2345-6789',
    address: '경기도 성남시 분당구 판교역로 321',
    businessNumber: '234-56-78901',
    verificationStatus: 'PENDING',
    creditScore: 820,
  },
  {
    type: 'INDIVIDUAL',
    name: '박서준',
    email: 'seojun.park@example.com',
    phone: '010-3456-7890',
    address: '서울특별시 송파구 올림픽로 567',
    licenseNumber: '34-56-789012-34',
    verificationStatus: 'PENDING',
  },
];

// API 클라이언트 config 타입
interface ApiClientConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
}

interface Store {
  customers: Customer[];
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'registeredAt'>) => Promise<void>;
  createRentalContract: (
    contract: Omit<RentalContract, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  createLeaseContract: (
    contract: Omit<LeaseContract, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
}

// 초기 데이터 로드 함수
export const loadSampleData = (store: Store) => {
  // 차량 추가
  sampleVehicles.forEach(vehicle => {
    store.addVehicle(vehicle);
  });

  // 고객 추가
  sampleCustomers.forEach(customer => {
    store.addCustomer(customer);
  });

  // 샘플 렌탈 계약 추가
  const customers = store.customers;
  const vehicles = store.vehicles;

  if (customers.length > 0 && vehicles.length > 0) {
    // 김민수 - 그랜저 렌탈
    store.createRentalContract({
      customerId: customers[0].id,
      vehicleId: vehicles[2].id, // 그랜저
      contractType: 'SHORT_TERM',
      status: 'ACTIVE',
      contractNumber: 'RENT-2024001',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-30'),
      pickupLocation: '강남점',
      returnLocation: '강남점',
      dailyRate: 80000,
      totalAmount: 2400000,
      deposit: 500000,
      insuranceType: 'FULL_COVERAGE',
      additionalOptions: [],
    } as Omit<RentalContract, 'id' | 'createdAt' | 'updatedAt'>);

    // 테크솔루션 - 카니발 리스
    store.createLeaseContract({
      customerId: customers[2].id,
      vehicleId: vehicles[3].id, // 카니발
      leaseType: 'OPERATING',
      status: 'ACTIVE',
      contractNumber: 'LEASE-2024001',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2027-01-01'),
      monthlyPayment: 1200000,
      downPayment: 5000000,
      residualValue: 0,
      mileageLimit: 30000,
      excessMileageRate: 150,
      maintenanceIncluded: true,
      insuranceIncluded: true,
    } as Omit<LeaseContract, 'id' | 'createdAt' | 'updatedAt'>);
  }
};
