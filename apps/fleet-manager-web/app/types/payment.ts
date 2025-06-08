/**
 * 결제 관련 타입 정의
 */

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  CORPORATE_CARD = 'CORPORATE_CARD',
}

export interface Payment {
  id: string;
  customer_id: string;
  customer_name?: string;
  rental_contract_id?: string;
  lease_contract_id?: string;
  contract_number?: string;
  contract_type: 'RENTAL' | 'LEASE';
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  due_date: string;
  paid_date?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentCreate {
  customer_id: string;
  rental_contract_id?: string;
  lease_contract_id?: string;
  contract_type: 'RENTAL' | 'LEASE';
  amount: number;
  payment_method: PaymentMethod;
  due_date: string;
}

export interface PaymentUpdate {
  status?: PaymentStatus;
  paid_date?: string;
  receipt_url?: string;
}

export interface PaymentProcessRequest {
  payment_method: PaymentMethod;
  transaction_id?: string;
  card_number?: string;
  approval_number?: string;
}

export interface PaymentRefundRequest {
  refund_amount: number;
  refund_reason: string;
}

export interface PaymentStatistics {
  total_payments: number;
  completed_payments: number;
  pending_payments: number;
  failed_payments: number;
  total_amount: number;
  pending_amount: number;
  overdue_payments: number;
  overdue_amount: number;
}

export interface PaymentSummary {
  year: number;
  month: number;
  total_amount: number;
  rental_amount: number;
  lease_amount: number;
  payment_count: number;
  collection_rate: number;
}

export interface BulkPaymentCreate {
  contract_type: 'RENTAL' | 'LEASE';
  contract_ids: string[];
  due_date: string;
  payment_method: PaymentMethod;
}

export interface PaymentListResponse {
  items: Payment[];
  total: number;
  page: number;
  page_size: number;
}
