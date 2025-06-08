import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PaymentMethod, PaymentHistory, Subscription, UserPoints, PointTransaction } from './types';

interface PaymentState {
  // 결제 수단
  paymentMethods: PaymentMethod[];
  defaultPaymentMethodId: string | null;

  // 결제 내역
  paymentHistory: PaymentHistory[];

  // 구독
  subscriptions: Subscription[];
  activeSubscription: Subscription | null;

  // 포인트
  userPoints: UserPoints | null;
  pointTransactions: PointTransaction[];

  // 로딩 상태
  isLoading: boolean;
  error: string | null;

  // 액션
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  addPaymentMethod: (method: PaymentMethod) => void;
  removePaymentMethod: (methodId: string) => void;
  setDefaultPaymentMethod: (methodId: string) => void;

  setPaymentHistory: (history: PaymentHistory[]) => void;
  addPaymentHistory: (payment: PaymentHistory) => void;
  updatePaymentStatus: (paymentId: string, status: PaymentHistory['status']) => void;

  setSubscriptions: (subscriptions: Subscription[]) => void;
  setActiveSubscription: (subscription: Subscription | null) => void;
  updateSubscription: (subscriptionId: string, updates: Partial<Subscription>) => void;

  setUserPoints: (points: UserPoints) => void;
  updateUserPoints: (updates: Partial<UserPoints>) => void;
  setPointTransactions: (transactions: PointTransaction[]) => void;
  addPointTransaction: (transaction: PointTransaction) => void;

  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  paymentMethods: [],
  defaultPaymentMethodId: null,
  paymentHistory: [],
  subscriptions: [],
  activeSubscription: null,
  userPoints: null,
  pointTransactions: [],
  isLoading: false,
  error: null,
};

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, _get) => ({
      ...initialState,

      // 결제 수단 관리
      setPaymentMethods: methods => set({ paymentMethods: methods }),

      addPaymentMethod: method =>
        set(state => ({
          paymentMethods: [...state.paymentMethods, method],
        })),

      removePaymentMethod: methodId =>
        set(state => ({
          paymentMethods: state.paymentMethods.filter(m => m.id !== methodId),
          defaultPaymentMethodId:
            state.defaultPaymentMethodId === methodId ? null : state.defaultPaymentMethodId,
        })),

      setDefaultPaymentMethod: methodId =>
        set(state => ({
          defaultPaymentMethodId: methodId,
          paymentMethods: state.paymentMethods.map(m => ({
            ...m,
            isDefault: m.id === methodId,
          })),
        })),

      // 결제 내역 관리
      setPaymentHistory: history => set({ paymentHistory: history }),

      addPaymentHistory: payment =>
        set(state => ({
          paymentHistory: [payment, ...state.paymentHistory],
        })),

      updatePaymentStatus: (paymentId, status) =>
        set(state => ({
          paymentHistory: state.paymentHistory.map(p =>
            p.id === paymentId ? { ...p, status } : p
          ),
        })),

      // 구독 관리
      setSubscriptions: subscriptions => set({ subscriptions }),

      setActiveSubscription: subscription => set({ activeSubscription: subscription }),

      updateSubscription: (subscriptionId, updates) =>
        set(state => ({
          subscriptions: state.subscriptions.map(s =>
            s.id === subscriptionId ? { ...s, ...updates } : s
          ),
          activeSubscription:
            state.activeSubscription?.id === subscriptionId
              ? { ...state.activeSubscription, ...updates }
              : state.activeSubscription,
        })),

      // 포인트 관리
      setUserPoints: points => set({ userPoints: points }),

      updateUserPoints: updates =>
        set(state => ({
          userPoints: state.userPoints
            ? { ...state.userPoints, ...updates, updatedAt: new Date() }
            : null,
        })),

      setPointTransactions: transactions => set({ pointTransactions: transactions }),

      addPointTransaction: transaction =>
        set(state => ({
          pointTransactions: [transaction, ...state.pointTransactions],
          userPoints: state.userPoints
            ? {
                ...state.userPoints,
                totalPoints:
                  transaction.type === 'EARN'
                    ? state.userPoints.totalPoints + transaction.amount
                    : state.userPoints.totalPoints - transaction.amount,
                availablePoints:
                  transaction.type === 'EARN'
                    ? state.userPoints.availablePoints + transaction.amount
                    : state.userPoints.availablePoints - transaction.amount,
                updatedAt: new Date(),
              }
            : null,
        })),

      // 상태 관리
      setLoading: isLoading => set({ isLoading }),
      setError: error => set({ error }),

      reset: () => set(initialState),
    }),
    {
      name: 'payment-storage',
      partialize: state => ({
        defaultPaymentMethodId: state.defaultPaymentMethodId,
      }),
    }
  )
);
