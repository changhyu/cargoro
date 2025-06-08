/**
 * 고객 관리 API
 */
import type { Customer, CustomerTypeType, VerificationStatusType } from '@/app/types/rental.types';

import { apiClient, handleApiError } from './client';

export interface CustomerCreateDto {
  type: CustomerTypeType;
  name: string;
  email: string;
  phone: string;
  address: string;
  license_number?: string;
  business_number?: string;
}

export interface CustomerListResponse {
  items: Customer[];
  total: number;
  page: number;
  page_size: number;
}

export interface CustomerStatistics {
  total_customers: number;
  individual_customers: number;
  corporate_customers: number;
  verified_customers: number;
  pending_verification: number;
  active_customers: number;
}

export interface CustomerContractSummary {
  customer_id: string;
  total_contracts: number;
  active_rentals: number;
  active_leases: number;
  total_revenue: number;
  overdue_amount: number;
}

export interface CustomerVerificationDto {
  verification_status: VerificationStatusType;
  verification_notes?: string;
  credit_score?: number;
}

class CustomerAPI {
  /**
   * 고객 목록 조회
   */
  async getCustomers(params?: {
    page?: number;
    page_size?: number;
    customer_type?: CustomerTypeType;
    verification_status?: VerificationStatusType;
    search?: string;
  }): Promise<CustomerListResponse> {
    try {
      const response = await apiClient.get('/customers', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * 고객 상세 조회
   */
  async getCustomer(customerId: string): Promise<Customer> {
    try {
      const response = await apiClient.get(`/customers/${customerId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * 고객 계약 요약 조회
   */
  async getCustomerContracts(customerId: string): Promise<CustomerContractSummary> {
    try {
      const response = await apiClient.get(`/customers/${customerId}/contracts`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * 고객 통계 조회
   */
  async getCustomerStatistics(): Promise<CustomerStatistics> {
    try {
      const response = await apiClient.get('/customers/statistics');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * 고객 등록
   */
  async createCustomer(customerData: CustomerCreateDto): Promise<Customer> {
    try {
      const response = await apiClient.post('/customers', customerData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * 고객 정보 수정
   */
  async updateCustomer(customerId: string, updates: Partial<CustomerCreateDto>): Promise<Customer> {
    try {
      const response = await apiClient.put(`/customers/${customerId}`, updates);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * 고객 검증
   */
  async verifyCustomer(
    customerId: string,
    verification: CustomerVerificationDto
  ): Promise<Customer> {
    try {
      const response = await apiClient.post(`/customers/${customerId}/verify`, verification);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * 고객 삭제
   */
  async deleteCustomer(customerId: string): Promise<void> {
    try {
      await apiClient.delete(`/customers/${customerId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const customerAPI = new CustomerAPI();
