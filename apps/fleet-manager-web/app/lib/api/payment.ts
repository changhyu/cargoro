/**
 * 결제 관련 API 요청
 */
import {
  Payment,
  PaymentCreate,
  PaymentProcessRequest,
  PaymentRefundRequest,
  PaymentStatistics,
  PaymentSummary,
  BulkPaymentCreate,
  PaymentListResponse,
  PaymentStatus,
} from '@/app/types/payment';

import { apiClient } from './client';

class PaymentApi {
  /**
   * 결제 생성
   */
  async createPayment(data: PaymentCreate): Promise<Payment> {
    const response = await apiClient.post('/payments', data);
    return response.data;
  }

  /**
   * 결제 목록 조회
   */
  async getPayments(params?: {
    page?: number;
    page_size?: number;
    status?: PaymentStatus;
    customer_id?: string;
    contract_type?: 'RENTAL' | 'LEASE';
    start_date?: string;
    end_date?: string;
  }): Promise<PaymentListResponse> {
    const response = await apiClient.get('/payments', { params });
    return response.data;
  }

  /**
   * 결제 상세 조회
   */
  async getPayment(paymentId: string): Promise<Payment> {
    const response = await apiClient.get(`/payments/${paymentId}`);
    return response.data;
  }

  /**
   * 연체 결제 조회
   */
  async getOverduePayments(daysOverdue: number = 0): Promise<Payment[]> {
    const response = await apiClient.get('/payments/overdue', {
      params: { days_overdue: daysOverdue },
    });
    return response.data;
  }

  /**
   * 결제 통계
   */
  async getStatistics(): Promise<PaymentStatistics> {
    const response = await apiClient.get('/payments/statistics');
    return response.data;
  }

  /**
   * 월별 요약
   */
  async getMonthlySummary(year: number, month: number): Promise<PaymentSummary> {
    const response = await apiClient.get(`/payments/summary/${year}/${month}`);
    return response.data;
  }

  /**
   * 결제 처리
   */
  async processPayment(paymentId: string, data: PaymentProcessRequest): Promise<Payment> {
    const response = await apiClient.post(`/payments/${paymentId}/process`, data);
    return response.data;
  }

  /**
   * 결제 환불
   */
  async refundPayment(paymentId: string, data: PaymentRefundRequest): Promise<Payment> {
    const response = await apiClient.post(`/payments/${paymentId}/refund`, data);
    return response.data;
  }

  /**
   * 월별 리스료 생성
   */
  async generateMonthlyLeasePayments(
    leaseContractId: string,
    months: number
  ): Promise<{ message: string; payment_ids: string[] }> {
    const response = await apiClient.post(
      `/payments/lease/${leaseContractId}/generate-monthly`,
      null,
      { params: { months } }
    );
    return response.data;
  }

  /**
   * 결제 알림 발송
   */
  async sendReminder(paymentId: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/payments/${paymentId}/remind`);
    return response.data;
  }

  /**
   * 대량 결제 생성
   */
  async createBulkPayments(data: BulkPaymentCreate): Promise<Payment[]> {
    const response = await apiClient.post('/payments/bulk', data);
    return response.data;
  }
}

export const paymentApi = new PaymentApi();
