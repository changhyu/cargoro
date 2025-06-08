import { useCallback, useState } from 'react';
import { usePaymentStore } from './store';
import { PaymentClient } from './client';
import {
  PaymentRequest,
  PaymentResponse,
  PaymentMethod,
  PaymentHistory,
  Subscription,
  SubscriptionPlan,
  // RefundRequest,
  RefundResponse,
  PaymentConfig,
} from './types';
import { v4 as uuidv4 } from 'uuid';

let paymentClient: PaymentClient | null = null;

export function initializePayment(config: PaymentConfig) {
  paymentClient = new PaymentClient(config);
  return paymentClient;
}

export function getPaymentClient(): PaymentClient {
  if (!paymentClient) {
    throw new Error(
      'PaymentClient가 초기화되지 않았습니다. initializePayment()를 먼저 호출하세요.'
    );
  }
  return paymentClient;
}

/**
 * 결제 요청 훅
 */
export function usePayment() {
  const { isLoading, error, setLoading, setError, addPaymentHistory } = usePaymentStore();

  const requestPayment = useCallback(
    async (request: PaymentRequest) => {
      const client = getPaymentClient();
      setLoading(true);
      setError(null);

      try {
        await client.requestPayment(request);
      } catch (err: any) {
        setError(err.message || '결제 요청에 실패했습니다.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const confirmPayment = useCallback(
    async (paymentKey: string, orderId: string, amount: number): Promise<PaymentResponse> => {
      const client = getPaymentClient();
      setLoading(true);
      setError(null);

      try {
        const response = await client.confirmPayment(paymentKey, orderId, amount);

        // 결제 내역 추가
        const paymentHistory: PaymentHistory = {
          id: uuidv4(),
          paymentKey: response.paymentKey,
          orderId: response.orderId,
          orderName: (response as any).orderName || '',
          customerId: '', // 실제로는 현재 사용자 ID
          amount: response.totalAmount,
          status: response.status,
          method: response.method,
          paidAt: response.approvedAt ? new Date(response.approvedAt) : undefined,
          createdAt: new Date(),
        };

        addPaymentHistory(paymentHistory);

        return response;
      } catch (err: any) {
        setError(err.message || '결제 승인에 실패했습니다.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, addPaymentHistory]
  );

  const cancelPayment = useCallback(
    async (paymentKey: string, reason: string, cancelAmount?: number): Promise<RefundResponse> => {
      const client = getPaymentClient();
      setLoading(true);
      setError(null);

      try {
        const response = await client.cancelPayment(paymentKey, reason, cancelAmount);
        // RefundResponse 타입에 맞게 변환
        const refundResponse: RefundResponse = {
          paymentKey: response.paymentKey,
          orderId: response.orderId,
          status: response.status,
          totalAmount: response.totalAmount,
          balanceAmount: response.balanceAmount,
          canceledAmount: (response as any).canceledAmount || 0,
          cancels: (response as any).cancels,
        };
        return refundResponse;
      } catch (err: any) {
        setError(err.message || '결제 취소에 실패했습니다.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  return {
    requestPayment,
    confirmPayment,
    cancelPayment,
    isLoading,
    error,
  };
}

/**
 * 결제 수단 관리 훅
 */
export function usePaymentMethods() {
  const {
    paymentMethods,
    defaultPaymentMethodId,
    setPaymentMethods,
    // addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
  } = usePaymentStore();

  const fetchPaymentMethods = useCallback(
    async (customerId: string) => {
      const client = getPaymentClient();

      try {
        const methods = await client.getPaymentMethods(customerId);
        setPaymentMethods(methods as PaymentMethod[]);
      } catch (err) {
        console.error('결제 수단 조회 실패:', err);
      }
    },
    [setPaymentMethods]
  );

  const registerCard = useCallback(async (customerId: string) => {
    const client = getPaymentClient();

    try {
      await client.issueBillingKey(customerId);
    } catch (err) {
      console.error('카드 등록 실패:', err);
      throw err;
    }
  }, []);

  const deletePaymentMethod = useCallback(
    async (methodId: string) => {
      // API 호출 (실제 구현 필요)
      removePaymentMethod(methodId);
    },
    [removePaymentMethod]
  );

  return {
    paymentMethods,
    defaultPaymentMethodId,
    fetchPaymentMethods,
    registerCard,
    deletePaymentMethod,
    setDefaultPaymentMethod,
  };
}

/**
 * 결제 내역 훅
 */
export function usePaymentHistory() {
  const { paymentHistory, setPaymentHistory } = usePaymentStore();
  const [isLoading, setIsLoading] = useState(false);

  const fetchPaymentHistory = useCallback(
    async (customerId: string) => {
      setIsLoading(true);

      try {
        // API 호출 (실제 구현 필요)
        const response = await fetch(`/api/payments/history?customerId=${customerId}`);
        const data = await response.json();
        setPaymentHistory(data);
      } catch (err) {
        console.error('결제 내역 조회 실패:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [setPaymentHistory]
  );

  const getPaymentDetails = useCallback(async (paymentKey: string): Promise<PaymentResponse> => {
    const client = getPaymentClient();
    return await client.getPayment(paymentKey);
  }, []);

  return {
    paymentHistory,
    isLoading,
    fetchPaymentHistory,
    getPaymentDetails,
  };
}

/**
 * 구독 관리 훅
 */
export function useSubscription() {
  const {
    subscriptions,
    activeSubscription,
    setSubscriptions,
    setActiveSubscription,
    updateSubscription,
  } = usePaymentStore();

  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSubscriptions = useCallback(
    async (customerId: string) => {
      setIsLoading(true);

      try {
        // API 호출 (실제 구현 필요)
        const response = await fetch(`/api/subscriptions?customerId=${customerId}`);
        const data = await response.json();
        setSubscriptions(data);

        // 활성 구독 찾기
        const active = data.find((sub: Subscription) => sub.status === 'ACTIVE');
        setActiveSubscription(active || null);
      } catch (err) {
        console.error('구독 조회 실패:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [setSubscriptions, setActiveSubscription]
  );

  const fetchAvailablePlans = useCallback(async () => {
    try {
      // API 호출 (실제 구현 필요)
      const response = await fetch('/api/subscription-plans');
      const data = await response.json();
      setAvailablePlans(data);
    } catch (err) {
      console.error('구독 플랜 조회 실패:', err);
    }
  }, []);

  const subscribeToPlan = useCallback(
    async (planId: string, customerId: string, paymentMethodId: string): Promise<Subscription> => {
      setIsLoading(true);

      try {
        // API 호출 (실제 구현 필요)
        const response = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId,
            customerId,
            paymentMethodId,
          }),
        });

        const subscription = await response.json();
        setActiveSubscription(subscription);
        return subscription;
      } catch (err) {
        console.error('구독 신청 실패:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setActiveSubscription]
  );

  const cancelSubscription = useCallback(
    async (subscriptionId: string, reason: string) => {
      setIsLoading(true);

      try {
        // API 호출 (실제 구현 필요)
        await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        });

        updateSubscription(subscriptionId, {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        });

        if (activeSubscription?.id === subscriptionId) {
          setActiveSubscription(null);
        }
      } catch (err) {
        console.error('구독 취소 실패:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateSubscription, activeSubscription, setActiveSubscription]
  );

  return {
    subscriptions,
    activeSubscription,
    availablePlans,
    isLoading,
    fetchSubscriptions,
    fetchAvailablePlans,
    subscribeToPlan,
    cancelSubscription,
  };
}

/**
 * 포인트 관리 훅
 */
export function usePoints() {
  const {
    userPoints,
    pointTransactions,
    setUserPoints,
    // updateUserPoints,
    setPointTransactions,
    addPointTransaction,
  } = usePaymentStore();

  const [isLoading, setIsLoading] = useState(false);

  const fetchUserPoints = useCallback(
    async (userId: string) => {
      setIsLoading(true);

      try {
        // API 호출 (실제 구현 필요)
        const response = await fetch(`/api/points?userId=${userId}`);
        const data = await response.json();
        setUserPoints(data);
      } catch (err) {
        console.error('포인트 조회 실패:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [setUserPoints]
  );

  const fetchPointTransactions = useCallback(
    async (userId: string) => {
      setIsLoading(true);

      try {
        // API 호출 (실제 구현 필요)
        const response = await fetch(`/api/points/transactions?userId=${userId}`);
        const data = await response.json();
        setPointTransactions(data);
      } catch (err) {
        console.error('포인트 거래 내역 조회 실패:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [setPointTransactions]
  );

  const usePointsForPayment = useCallback(
    async (userId: string, orderId: string, amount: number) => {
      if (!userPoints || userPoints.availablePoints < amount) {
        throw new Error('사용 가능한 포인트가 부족합니다.');
      }

      setIsLoading(true);

      try {
        // API 호출 (실제 구현 필요)
        const response = await fetch('/api/points/use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            orderId,
            amount,
          }),
        });

        const transaction = await response.json();
        addPointTransaction(transaction);

        return transaction;
      } catch (err) {
        console.error('포인트 사용 실패:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userPoints, addPointTransaction]
  );

  return {
    userPoints,
    pointTransactions,
    isLoading,
    fetchUserPoints,
    fetchPointTransactions,
    usePointsForPayment,
  };
}

/**
 * 가상계좌 결제 훅
 */
export function useVirtualAccount() {
  const { setLoading, setError } = usePaymentStore();

  const requestVirtualAccount = useCallback(
    async (request: PaymentRequest) => {
      const client = getPaymentClient();
      setLoading(true);
      setError(null);

      try {
        await client.requestVirtualAccount(request);
      } catch (err: any) {
        setError(err.message || '가상계좌 발급에 실패했습니다.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  return {
    requestVirtualAccount,
  };
}

/**
 * 자동결제 훅
 */
export function useAutoBilling() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerBillingKey = useCallback(async (customerId: string) => {
    const client = getPaymentClient();
    setIsLoading(true);
    setError(null);

    try {
      await client.issueBillingKey(customerId);
    } catch (err: any) {
      setError(err.message || '빌링키 등록에 실패했습니다.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const chargeWithBillingKey = useCallback(
    async (
      billingKey: string,
      customerId: string,
      orderId: string,
      orderName: string,
      amount: number
    ): Promise<PaymentResponse> => {
      const client = getPaymentClient();
      setIsLoading(true);
      setError(null);

      try {
        const response = await client.payWithBillingKey(
          billingKey,
          customerId,
          orderId,
          orderName,
          amount
        );
        return response;
      } catch (err: any) {
        setError(err.message || '자동결제에 실패했습니다.');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    registerBillingKey,
    chargeWithBillingKey,
    isLoading,
    error,
  };
}
