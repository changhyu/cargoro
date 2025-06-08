// 계약 상태 열거형
export enum ContractStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
}

// 계약 유형 열거형
export enum ContractType {
  LEASE = 'lease',
  RENTAL = 'rental',
  PURCHASE = 'purchase',
  OTHER = 'other',
}

// 보험 정보 타입 정의
export interface InsuranceInfo {
  provider?: string;
  policyNumber?: string;
  coverage?: string;
  expiryDate?: string;
  premium?: number;
  deductible?: number;
  [key: string]: string | number | undefined;
}

// 계약 기본 타입
export interface Contract {
  id: string;
  organizationId: string;
  vehicleId: string;
  contractType: ContractType;
  startDate: string;
  endDate: string;
  monthlyPayment: number;
  deposit: number;
  status: ContractStatus;
  insuranceInfo?: InsuranceInfo;
  additionalTerms?: string;
  contractFileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// 계약 생성 DTO 타입
export type CreateContractDto = Omit<Contract, 'id' | 'status' | 'createdAt' | 'updatedAt'> & {
  deposit?: number;
};

// 계약 업데이트 DTO 타입
export type UpdateContractDto = Partial<Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>>;

// 계약 결제 타입
export interface ContractPayment {
  id: string;
  contractId: string;
  paymentDate: string;
  amount: number;
  paymentType: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 계약 결제 생성 DTO 타입
export type CreateContractPaymentDto = Omit<
  ContractPayment,
  'id' | 'contractId' | 'createdAt' | 'updatedAt'
>;

// 계약 결제 업데이트 DTO 타입
export type UpdateContractPaymentDto = Partial<
  Omit<ContractPayment, 'id' | 'contractId' | 'createdAt' | 'updatedAt'>
>;
