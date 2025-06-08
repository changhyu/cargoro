// 고객 관련 타입 정의

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  businessNumber?: string; // 사업자번호 (법인 고객용)
  customerType: 'individual' | 'business'; // 개인/법인 구분
  registrationDate: string;
  lastServiceDate?: string;
  totalServiceCount: number;
  totalSpent: number;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CustomerVehicle {
  id: string;
  customerId: string;
  vehicleNumber: string;
  manufacturer: string;
  model: string;
  year: number;
  vin?: string; // 차대번호
  engineType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  color?: string;
  mileage?: number;
  lastServiceMileage?: number;
  registrationDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerServiceHistory {
  id: string;
  customerId: string;
  vehicleId: string;
  serviceDate: string;
  serviceType: string;
  description: string;
  technician: string;
  totalCost: number;
  paymentStatus: 'pending' | 'paid' | 'partial';
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'credit';
  invoiceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerInput {
  name: string;
  email: string;
  phone: string;
  address?: string;
  businessNumber?: string;
  customerType: 'individual' | 'business';
  notes?: string;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
  status?: 'active' | 'inactive';
}

export interface CustomerFilter {
  search?: string;
  customerType?: 'individual' | 'business' | 'all';
  status?: 'active' | 'inactive' | 'all';
  sortBy?: 'name' | 'registrationDate' | 'lastServiceDate' | 'totalSpent';
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  totalRevenue: number;
  averageServiceValue: number;
  topCustomers: Array<{
    id: string;
    name: string;
    totalSpent: number;
    serviceCount: number;
  }>;
}
