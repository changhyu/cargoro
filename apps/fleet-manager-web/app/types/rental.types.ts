// 렌터카 관련 타입 정의

// Status Enums
export const VehicleStatus = {
  AVAILABLE: 'AVAILABLE',
  RENTED: 'RENTED',
  MAINTENANCE: 'MAINTENANCE',
  RESERVED: 'RESERVED',
  SOLD: 'SOLD',
} as const;

export type VehicleStatusType = (typeof VehicleStatus)[keyof typeof VehicleStatus];

export const CustomerType = {
  INDIVIDUAL: 'INDIVIDUAL',
  CORPORATE: 'CORPORATE',
} as const;

export type CustomerTypeType = (typeof CustomerType)[keyof typeof CustomerType];

export const VerificationStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
} as const;

export type VerificationStatusType = (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const ContractStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  TERMINATED: 'TERMINATED',
} as const;

export type ContractStatusType = (typeof ContractStatus)[keyof typeof ContractStatus];

export const ReservationStatus = {
  pending: 'pending',
  confirmed: 'confirmed',
  cancelled: 'cancelled',
  completed: 'completed',
  in_progress: 'in_progress',
} as const;

export type ReservationStatusType = (typeof ReservationStatus)[keyof typeof ReservationStatus];

export const LeaseType = {
  OPERATING: 'OPERATING',
  FINANCIAL: 'FINANCIAL',
} as const;

export type LeaseTypeType = (typeof LeaseType)[keyof typeof LeaseType];

export const PaymentMethod = {
  CREDIT_CARD: 'CREDIT_CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CASH: 'CASH',
} as const;

export type PaymentMethodType = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export interface RentalContract {
  id: string;
  contractNumber: string;
  customerId: string;
  vehicleId: string;
  contractType: 'SHORT_TERM' | 'LONG_TERM'; // 단기/장기
  status: ContractStatusType;
  startDate: Date;
  endDate: Date;
  pickupLocation: string;
  returnLocation: string;
  dailyRate: number;
  totalAmount: number;
  deposit: number;
  insuranceType: InsuranceType;
  additionalOptions: AdditionalOption[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaseContract {
  id: string;
  contractNumber: string;
  customerId: string;
  vehicleId: string;
  leaseType: LeaseTypeType; // 운용리스/금융리스
  status: ContractStatusType;
  startDate: Date;
  endDate: Date;
  monthlyPayment: number;
  downPayment: number;
  residualValue: number;
  mileageLimit: number;
  excessMileageRate: number;
  maintenanceIncluded: boolean;
  insuranceIncluded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  type: CustomerTypeType;
  name: string;
  email: string;
  phone: string;
  address: string;
  licenseNumber?: string; // 개인용
  businessNumber?: string; // 법인용
  creditScore?: number;
  verificationStatus: VerificationStatusType;
  registeredAt: Date;
}

export const FuelType = {
  GASOLINE: 'GASOLINE',
  DIESEL: 'DIESEL',
  HYBRID: 'HYBRID',
  ELECTRIC: 'ELECTRIC',
} as const;

export type FuelTypeType = (typeof FuelType)[keyof typeof FuelType];

export const TransmissionType = {
  MANUAL: 'MANUAL',
  AUTOMATIC: 'AUTOMATIC',
} as const;

export type TransmissionTypeType = (typeof TransmissionType)[keyof typeof TransmissionType];

export interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  status: VehicleStatusType;
  mileage: number;
  fuelType: FuelTypeType;
  transmission: TransmissionTypeType;
  category: VehicleCategory;
  features: string[];
  images: string[];
  purchaseDate: Date;
  purchasePrice: number;
  currentValue: number;
  lastMaintenanceDate: Date;
  nextMaintenanceDate: Date;
}

export interface Reservation {
  id: string;
  customerId: string;
  vehicleId: string;
  reservationType: 'RENTAL' | 'LEASE_CONSULTATION';
  status: ReservationStatusType;
  pickupDate: Date;
  pickupTime: string;
  pickupLocation: string;
  returnDate?: Date;
  returnTime?: string;
  returnLocation?: string;
  estimatedCost: number;
  notes?: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  contractId: string;
  contractType: 'RENTAL' | 'LEASE';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentMethod: PaymentMethodType;
  dueDate: Date;
  paidDate?: Date;
  receiptUrl?: string;
  createdAt: Date;
}

export type InsuranceType = 'BASIC' | 'STANDARD' | 'PREMIUM' | 'FULL_COVERAGE';

export type VehicleCategory =
  | 'ECONOMY'
  | 'COMPACT'
  | 'MIDSIZE'
  | 'FULL_SIZE'
  | 'LUXURY'
  | 'SUV'
  | 'VAN'
  | 'TRUCK';

export interface AdditionalOption {
  id: string;
  name: string;
  price: number;
  unit: 'DAY' | 'TOTAL';
}

export interface DamageReport {
  id: string;
  vehicleId: string;
  contractId: string;
  reportDate: Date;
  damageType: string;
  description: string;
  photos: string[];
  estimatedCost: number;
  status: 'REPORTED' | 'ASSESSED' | 'REPAIRED' | 'CLAIMED';
}

export interface MaintenanceSchedule {
  id: string;
  vehicleId: string;
  type: 'REGULAR' | 'REPAIR' | 'INSPECTION';
  scheduledDate: Date;
  description: string;
  estimatedCost: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completedDate?: Date;
  actualCost?: number;
  notes?: string;
}
