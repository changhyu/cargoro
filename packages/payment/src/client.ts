import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { PaymentConfig, PaymentRequest, PaymentResponse, PaymentError } from './types';
import axios, { AxiosInstance } from 'axios';

// TossPayments SDK type definitions
type TossPayments = Awaited<ReturnType<typeof loadTossPayments>>;
type PaymentSDK = ReturnType<TossPayments['payment']>;

export class PaymentClient {
  private tossPayments: TossPayments | null = null;
  private paymentSDK: PaymentSDK | null = null;
  private config: PaymentConfig;
  private apiClient: AxiosInstance = null as any; // 초기화는 setupApiClient에서 처리

  constructor(config: PaymentConfig) {
    this.config = config;
    this.setupApiClient();
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      this.tossPayments = await loadTossPayments(this.config.clientKey);
      // payment 객체 초기화 (customerKey는 결제 시점에 동적으로 설정)
      this.paymentSDK = this.tossPayments.payment({
        customerKey: 'temp-customer-key', // 실제 결제 시 업데이트됨
      });
    } catch (error) {
      console.error('토스페이먼츠 SDK 초기화 실패:', error);
      throw new Error('결제 시스템 초기화에 실패했습니다.');
    }
  }

  private setupApiClient() {
    const baseURL = this.config.baseUrl || 'https://api.tosspayments.com/v1';

    this.apiClient = axios.create({
      baseURL,
      headers: {
        Authorization: `Basic ${Buffer.from(this.config.secretKey + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * 결제 요청
   */
  async requestPayment(request: PaymentRequest): Promise<void> {
    if (!this.tossPayments || !this.paymentSDK) {
      throw new Error('결제 시스템이 초기화되지 않았습니다.');
    }

    // 새로운 customerKey로 payment SDK 재초기화
    this.paymentSDK = this.tossPayments.payment({
      customerKey: request.customerId,
    });

    try {
      const paymentRequest: any = {
        method: 'CARD', // 기본값, 사용자가 선택 가능
        amount: {
          value: request.amount,
          currency: request.currency || 'KRW',
        },
        orderId: request.orderId,
        orderName: request.orderName,
        successUrl: request.successUrl || this.config.successUrl,
        failUrl: request.failUrl || this.config.failUrl,
        customerName: request.customerName,
        customerEmail: request.customerEmail,
        customerMobilePhone: request.customerPhone,
        ...(request.metadata && { metadata: request.metadata }),
      };

      await this.paymentSDK.requestPayment(paymentRequest);
    } catch (error) {
      this.handlePaymentError(error);
    }
  }

  /**
   * 결제 승인
   */
  async confirmPayment(
    paymentKey: string,
    orderId: string,
    amount: number
  ): Promise<PaymentResponse> {
    try {
      const response = await this.apiClient.post(`/payments/confirm`, {
        paymentKey,
        orderId,
        amount,
      });

      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  /**
   * 결제 조회
   */
  async getPayment(paymentKey: string): Promise<PaymentResponse> {
    try {
      const response = await this.apiClient.get(`/payments/${paymentKey}`);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  /**
   * 결제 취소
   */
  async cancelPayment(
    paymentKey: string,
    reason: string,
    cancelAmount?: number
  ): Promise<PaymentResponse> {
    try {
      const response = await this.apiClient.post(`/payments/${paymentKey}/cancel`, {
        cancelReason: reason,
        ...(cancelAmount && { cancelAmount }),
      });

      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  /**
   * 빌링키 발급
   */
  async issueBillingKey(customerId: string): Promise<void> {
    if (!this.tossPayments || !this.paymentSDK) {
      throw new Error('결제 시스템이 초기화되지 않았습니다.');
    }

    // 새로운 customerKey로 payment SDK 재초기화
    this.paymentSDK = this.tossPayments.payment({
      customerKey: customerId,
    });

    try {
      await this.paymentSDK.requestBillingAuth({
        method: 'CARD',

        successUrl: this.config.successUrl,
        failUrl: this.config.failUrl,
      });
    } catch (error) {
      this.handlePaymentError(error);
    }
  }

  /**
   * 빌링키로 자동 결제
   */
  async payWithBillingKey(
    billingKey: string,
    customerId: string,
    orderId: string,
    orderName: string,
    amount: number
  ): Promise<PaymentResponse> {
    try {
      const response = await this.apiClient.post(`/billing/${billingKey}`, {
        customerKey: customerId,
        orderId,
        orderName,
        amount,
      });

      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  /**
   * 가상계좌 발급
   * 주의: TossPayments SDK v2에서는 더 이상 지원하지 않으므로 API를 직접 호출합니다.
   */
  async requestVirtualAccount(_request: PaymentRequest): Promise<void> {
    // SDK v2에서는 VIRTUAL_ACCOUNT를 지원하지 않으므로 API를 직접 호출
    throw new Error(
      '가상계좌 결제는 TossPayments SDK v2에서 지원하지 않습니다. API를 직접 사용하세요.'
    );
  }

  /**
   * 계좌이체 결제
   * 주의: TossPayments SDK v2에서는 더 이상 지원하지 않으므로 API를 직접 호출합니다.
   */
  async requestBankTransfer(_request: PaymentRequest): Promise<void> {
    // SDK v2에서는 TRANSFER를 지원하지 않으므로 API를 직접 호출
    throw new Error(
      '계좌이체 결제는 TossPayments SDK v2에서 지원하지 않습니다. API를 직접 사용하세요.'
    );
  }

  /**
   * 휴대폰 결제
   * 주의: TossPayments SDK v2에서는 더 이상 지원하지 않으므로 API를 직접 호출합니다.
   */
  async requestMobilePayment(_request: PaymentRequest): Promise<void> {
    // SDK v2에서는 MOBILE_PHONE을 지원하지 않으므로 API를 직접 호출
    throw new Error(
      '휴대폰 결제는 TossPayments SDK v2에서 지원하지 않습니다. API를 직접 사용하세요.'
    );
  }

  /**
   * 결제 수단 목록 조회
   */
  async getPaymentMethods(customerId: string): Promise<unknown[]> {
    try {
      const response = await this.apiClient.get(`/customers/${customerId}/payment-methods`);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  private handlePaymentError(error: unknown): never {
    const errorObj = error as Record<string, unknown>;
    const paymentError: PaymentError = {
      code: typeof errorObj.code === 'string' ? errorObj.code : 'UNKNOWN_ERROR',
      message:
        typeof errorObj.message === 'string'
          ? errorObj.message
          : '결제 처리 중 오류가 발생했습니다.',
      detail: typeof errorObj.detail === 'string' ? errorObj.detail : undefined,
    };

    console.error('결제 오류:', paymentError);
    throw paymentError;
  }

  private handleApiError(error: unknown): void {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;
      const apiError: PaymentError = {
        code: data.code || `HTTP_${status}`,
        message: data.message || '서버 오류가 발생했습니다.',
        detail: data.detail,
      };
      console.error('API 오류:', apiError);
      throw apiError;
    } else {
      throw new Error('네트워크 오류가 발생했습니다.');
    }
  }
}
