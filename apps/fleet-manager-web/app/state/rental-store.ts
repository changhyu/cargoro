import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type {
  RentalContract,
  LeaseContract,
  Customer,
  Vehicle,
  Reservation,
  Payment,
} from '../types/rental.types';

interface RentalState {
  // 렌탈 계약
  rentalContracts: RentalContract[];
  activeRentals: RentalContract[];

  // 리스 계약
  leaseContracts: LeaseContract[];
  activeLeases: LeaseContract[];

  // 차량
  vehicles: Vehicle[];
  availableVehicles: Vehicle[];

  // 고객
  customers: Customer[];

  // 예약
  reservations: Reservation[];

  // 결제
  payments: Payment[];
  overduePayments: Payment[];

  // 로딩 상태
  isLoading: boolean;
  error: string | null;
}

interface RentalActions {
  // 렌탈 계약 관련
  createRentalContract: (
    contract: Omit<RentalContract, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateRentalContract: (id: string, updates: Partial<RentalContract>) => Promise<void>;
  terminateRentalContract: (id: string) => Promise<void>;

  // 리스 계약 관련
  createLeaseContract: (
    contract: Omit<LeaseContract, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateLeaseContract: (id: string, updates: Partial<LeaseContract>) => Promise<void>;
  terminateLeaseContract: (id: string) => Promise<void>;

  // 차량 관련
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  updateVehicleStatus: (id: string, status: Vehicle['status']) => Promise<void>;
  updateVehicleMileage: (id: string, mileage: number) => Promise<void>;

  // 고객 관련
  addCustomer: (customer: Omit<Customer, 'id' | 'registeredAt'>) => Promise<void>;
  verifyCustomer: (id: string, status: Customer['verificationStatus']) => Promise<void>;

  // 예약 관련
  createReservation: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => Promise<void>;
  confirmReservation: (id: string) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;

  // 결제 관련
  createPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Promise<void>;
  processPayment: (id: string) => Promise<void>;
  refundPayment: (id: string) => Promise<void>;

  // 데이터 로드
  loadRentalContracts: () => Promise<void>;
  loadLeaseContracts: () => Promise<void>;
  loadVehicles: () => Promise<void>;
  loadCustomers: () => Promise<void>;
  loadReservations: () => Promise<void>;
  loadPayments: () => Promise<void>;

  // 필터링
  filterVehiclesByStatus: (status: Vehicle['status']) => Vehicle[];
  filterContractsByCustomer: (customerId: string) => {
    rentals: RentalContract[];
    leases: LeaseContract[];
  };
  getOverduePayments: () => Payment[];

  // 통계
  getFleetStatistics: () => {
    totalVehicles: number;
    availableVehicles: number;
    rentedVehicles: number;
    maintenanceVehicles: number;
    activeRentals: number;
    activeLeases: number;
    monthlyRevenue: number;
    overdueAmount: number;
  };
}

type RentalStore = RentalState & RentalActions;

export const useRentalStore = create<RentalStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        rentalContracts: [],
        activeRentals: [],
        leaseContracts: [],
        activeLeases: [],
        vehicles: [],
        availableVehicles: [],
        customers: [],
        reservations: [],
        payments: [],
        overduePayments: [],
        isLoading: false,
        error: null,

        // 렌탈 계약 관련 액션
        createRentalContract: async contract => {
          set({ isLoading: true, error: null });
          try {
            // API 호출 시뮬레이션
            const newContract: RentalContract = {
              ...contract,
              id: `RENT-${Date.now()}`,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            set(state => ({
              rentalContracts: [...state.rentalContracts, newContract],
              activeRentals:
                contract.status === 'ACTIVE'
                  ? [...state.activeRentals, newContract]
                  : state.activeRentals,
              isLoading: false,
            }));
          } catch (_error) {
            set({ error: '렌탈 계약 생성 실패', isLoading: false });
          }
        },

        updateRentalContract: async (id, updates) => {
          set({ isLoading: true, error: null });
          try {
            set(state => ({
              rentalContracts: state.rentalContracts.map(contract =>
                contract.id === id ? { ...contract, ...updates, updatedAt: new Date() } : contract
              ),
              isLoading: false,
            }));
          } catch (_error) {
            set({ error: '렌탈 계약 업데이트 실패', isLoading: false });
          }
        },

        terminateRentalContract: async id => {
          await get().updateRentalContract(id, { status: 'COMPLETED' });
        },

        // 리스 계약 관련 액션
        createLeaseContract: async contract => {
          set({ isLoading: true, error: null });
          try {
            const newContract: LeaseContract = {
              ...contract,
              id: `LEASE-${Date.now()}`,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            set(state => ({
              leaseContracts: [...state.leaseContracts, newContract],
              activeLeases:
                contract.status === 'ACTIVE'
                  ? [...state.activeLeases, newContract]
                  : state.activeLeases,
              isLoading: false,
            }));
          } catch (_error) {
            set({ error: '리스 계약 생성 실패', isLoading: false });
          }
        },

        updateLeaseContract: async (id, updates) => {
          set({ isLoading: true, error: null });
          try {
            set(state => ({
              leaseContracts: state.leaseContracts.map(contract =>
                contract.id === id ? { ...contract, ...updates, updatedAt: new Date() } : contract
              ),
              isLoading: false,
            }));
          } catch (_error) {
            set({ error: '리스 계약 업데이트 실패', isLoading: false });
          }
        },

        terminateLeaseContract: async id => {
          await get().updateLeaseContract(id, { status: 'TERMINATED' });
        },

        // 차량 관련 액션
        addVehicle: async vehicle => {
          set({ isLoading: true, error: null });
          try {
            const newVehicle: Vehicle = {
              ...vehicle,
              id: `VEH-${Date.now()}`,
            };

            set(state => ({
              vehicles: [...state.vehicles, newVehicle],
              availableVehicles:
                vehicle.status === 'AVAILABLE'
                  ? [...state.availableVehicles, newVehicle]
                  : state.availableVehicles,
              isLoading: false,
            }));
          } catch (_error) {
            set({ error: '차량 추가 실패', isLoading: false });
          }
        },

        updateVehicleStatus: async (id, status) => {
          set({ isLoading: true, error: null });
          try {
            set(state => {
              const updatedVehicles = state.vehicles.map(vehicle =>
                vehicle.id === id ? { ...vehicle, status } : vehicle
              );

              return {
                vehicles: updatedVehicles,
                availableVehicles: updatedVehicles.filter(v => v.status === 'AVAILABLE'),
                isLoading: false,
              };
            });
          } catch (_error) {
            set({ error: '차량 상태 업데이트 실패', isLoading: false });
          }
        },

        updateVehicleMileage: async (id, mileage) => {
          set({ isLoading: true, error: null });
          try {
            set(state => ({
              vehicles: state.vehicles.map(vehicle =>
                vehicle.id === id ? { ...vehicle, mileage } : vehicle
              ),
              isLoading: false,
            }));
          } catch (_error) {
            set({ error: '주행거리 업데이트 실패', isLoading: false });
          }
        },

        // 고객 관련 액션
        addCustomer: async customer => {
          set({ isLoading: true, error: null });
          try {
            const newCustomer: Customer = {
              ...customer,
              id: `CUST-${Date.now()}`,
              registeredAt: new Date(),
            };

            set(state => ({
              customers: [...state.customers, newCustomer],
              isLoading: false,
            }));
          } catch (_error) {
            set({ error: '고객 추가 실패', isLoading: false });
          }
        },

        verifyCustomer: async (id, verificationStatus) => {
          set({ isLoading: true, error: null });
          try {
            set(state => ({
              customers: state.customers.map(customer =>
                customer.id === id ? { ...customer, verificationStatus } : customer
              ),
              isLoading: false,
            }));
          } catch (_error) {
            set({ error: '고객 검증 실패', isLoading: false });
          }
        },

        // 예약 관련 액션
        createReservation: async reservation => {
          set({ isLoading: true, error: null });
          try {
            const newReservation: Reservation = {
              ...reservation,
              id: `RES-${Date.now()}`,
              createdAt: new Date(),
            };

            set(state => ({
              reservations: [...state.reservations, newReservation],
              isLoading: false,
            }));

            // 차량 상태를 예약됨으로 변경
            await get().updateVehicleStatus(reservation.vehicleId, 'RESERVED');
          } catch (_error) {
            set({ error: '예약 생성 실패', isLoading: false });
          }
        },

        confirmReservation: async id => {
          set({ isLoading: true, error: null });
          try {
            set(state => ({
              reservations: state.reservations.map(res =>
                res.id === id ? { ...res, status: 'confirmed' } : res
              ),
              isLoading: false,
            }));
          } catch (_error) {
            set({ error: '예약 확정 실패', isLoading: false });
          }
        },

        cancelReservation: async id => {
          set({ isLoading: true, error: null });
          try {
            const reservation = get().reservations.find(r => r.id === id);

            set(state => ({
              reservations: state.reservations.map(res =>
                res.id === id ? { ...res, status: 'cancelled' } : res
              ),
              isLoading: false,
            }));

            // 차량 상태를 다시 이용 가능으로 변경
            if (reservation) {
              await get().updateVehicleStatus(reservation.vehicleId, 'AVAILABLE');
            }
          } catch (_error) {
            set({ error: '예약 취소 실패', isLoading: false });
          }
        },

        // 결제 관련 액션
        createPayment: async payment => {
          set({ isLoading: true, error: null });
          try {
            const newPayment: Payment = {
              ...payment,
              id: `PAY-${Date.now()}`,
              createdAt: new Date(),
            };

            set(state => ({
              payments: [...state.payments, newPayment],
              overduePayments:
                payment.status === 'PENDING' && payment.dueDate < new Date()
                  ? [...state.overduePayments, newPayment]
                  : state.overduePayments,
              isLoading: false,
            }));
          } catch (_error) {
            set({ error: '결제 생성 실패', isLoading: false });
          }
        },

        processPayment: async id => {
          set({ isLoading: true, error: null });
          try {
            set(state => ({
              payments: state.payments.map(payment =>
                payment.id === id
                  ? { ...payment, status: 'COMPLETED', paidDate: new Date() }
                  : payment
              ),
              overduePayments: state.overduePayments.filter(p => p.id !== id),
              isLoading: false,
            }));
          } catch (_error) {
            set({ error: '결제 처리 실패', isLoading: false });
          }
        },

        refundPayment: async id => {
          set({ isLoading: true, error: null });
          try {
            set(state => ({
              payments: state.payments.map(payment =>
                payment.id === id ? { ...payment, status: 'REFUNDED' } : payment
              ),
              isLoading: false,
            }));
          } catch (_error) {
            set({ error: '환불 처리 실패', isLoading: false });
          }
        },

        // 데이터 로드 (API 호출 시뮬레이션)
        loadRentalContracts: async () => {
          set({ isLoading: true, error: null });
          try {
            // API 호출 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 1000));
            set({ isLoading: false });
          } catch (_error) {
            set({ error: '렌탈 계약 로드 실패', isLoading: false });
          }
        },

        loadLeaseContracts: async () => {
          set({ isLoading: true, error: null });
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            set({ isLoading: false });
          } catch (_error) {
            set({ error: '리스 계약 로드 실패', isLoading: false });
          }
        },

        loadVehicles: async () => {
          set({ isLoading: true, error: null });
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            set({ isLoading: false });
          } catch (_error) {
            set({ error: '차량 데이터 로드 실패', isLoading: false });
          }
        },

        loadCustomers: async () => {
          set({ isLoading: true, error: null });
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            set({ isLoading: false });
          } catch (_error) {
            set({ error: '고객 데이터 로드 실패', isLoading: false });
          }
        },

        loadReservations: async () => {
          set({ isLoading: true, error: null });
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            set({ isLoading: false });
          } catch (_error) {
            set({ error: '예약 데이터 로드 실패', isLoading: false });
          }
        },

        loadPayments: async () => {
          set({ isLoading: true, error: null });
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            set({ isLoading: false });
          } catch (_error) {
            set({ error: '결제 데이터 로드 실패', isLoading: false });
          }
        },

        // 필터링 메서드
        filterVehiclesByStatus: status => {
          return get().vehicles.filter(v => v.status === status);
        },

        filterContractsByCustomer: customerId => {
          const rentals = get().rentalContracts.filter(c => c.customerId === customerId);
          const leases = get().leaseContracts.filter(c => c.customerId === customerId);
          return { rentals, leases };
        },

        getOverduePayments: () => {
          const now = new Date();
          return get().payments.filter(p => p.status === 'PENDING' && p.dueDate < now);
        },

        // 통계 메서드
        getFleetStatistics: () => {
          const state = get();
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          const monthlyPayments = state.payments.filter(p => {
            const paymentDate = p.paidDate || p.createdAt;
            return (
              p.status === 'COMPLETED' &&
              paymentDate.getMonth() === currentMonth &&
              paymentDate.getFullYear() === currentYear
            );
          });

          const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
          const overdueAmount = state.overduePayments.reduce((sum, p) => sum + p.amount, 0);

          return {
            totalVehicles: state.vehicles.length,
            availableVehicles: state.vehicles.filter(v => v.status === 'AVAILABLE').length,
            rentedVehicles: state.vehicles.filter(v => v.status === 'RENTED').length,
            maintenanceVehicles: state.vehicles.filter(v => v.status === 'MAINTENANCE').length,
            activeRentals: state.rentalContracts.filter(c => c.status === 'ACTIVE').length,
            activeLeases: state.leaseContracts.filter(c => c.status === 'ACTIVE').length,
            monthlyRevenue,
            overdueAmount,
          };
        },
      }),
      {
        name: 'rental-storage',
      }
    )
  )
);
