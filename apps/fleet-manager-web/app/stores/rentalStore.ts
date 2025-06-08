import { create } from 'zustand';

interface Customer {
  id: string;
  type: 'INDIVIDUAL' | 'CORPORATE';
  name: string;
  email: string;
  phone: string;
  address: string;
  licenseNumber?: string;
  businessNumber?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  creditScore?: number;
  registeredAt: string;
}

interface RentalContract {
  id: string;
  customerId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

interface LeaseContract {
  id: string;
  customerId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  monthlyPayment: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

interface RentalStore {
  customers: Customer[];
  rentalContracts: RentalContract[];
  leaseContracts: LeaseContract[];

  loadCustomers: () => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'registeredAt'>) => Promise<void>;
  verifyCustomer: (customerId: string, status: 'VERIFIED' | 'REJECTED') => void;
  filterContractsByCustomer: (customerId: string) => {
    rentals: RentalContract[];
    leases: LeaseContract[];
  };
}

export const useRentalStore = create<RentalStore>((set, get) => ({
  customers: [],
  rentalContracts: [],
  leaseContracts: [],

  loadCustomers: () => {
    // 실제로는 API에서 데이터를 가져와야 함
    set({
      customers: [
        {
          id: '1',
          type: 'INDIVIDUAL',
          name: '김철수',
          email: 'kim@example.com',
          phone: '010-1234-5678',
          address: '서울시 강남구 테헤란로 123',
          licenseNumber: '12-34-567890-12',
          verificationStatus: 'VERIFIED',
          creditScore: 720,
          registeredAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          type: 'CORPORATE',
          name: '(주)테크솔루션',
          email: 'contact@techsolution.com',
          phone: '02-1234-5678',
          address: '서울시 서초구 서초대로 456',
          businessNumber: '123-45-67890',
          verificationStatus: 'PENDING',
          registeredAt: '2024-02-20T14:30:00Z',
        },
      ],
    });
  },

  addCustomer: async customer => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      registeredAt: new Date().toISOString(),
    };

    set(state => ({
      customers: [...state.customers, newCustomer],
    }));
  },

  verifyCustomer: (customerId, status) => {
    set(state => ({
      customers: state.customers.map(customer =>
        customer.id === customerId ? { ...customer, verificationStatus: status } : customer
      ),
    }));
  },

  filterContractsByCustomer: customerId => {
    const state = get();
    return {
      rentals: state.rentalContracts.filter(r => r.customerId === customerId),
      leases: state.leaseContracts.filter(l => l.customerId === customerId),
    };
  },
}));
