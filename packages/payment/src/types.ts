// 결제 관련 타입 정의
export interface PaymentMethod {
  id: string;
  type: 'CARD' | 'BANK_TRANSFER' | 'VIRTUAL_ACCOUNT' | 'MOBILE' | 'POINT';
  name: string;
  details?: CardDetails | BankDetails | MobileDetails;
  isDefault?: boolean;
  createdAt: Date;
}

export interface CardDetails {
  cardNumber: string; // 마스킹된 카드 번호 (예: **** **** **** 1234)
  cardType: 'CREDIT' | 'DEBIT' | 'PREPAID';
  issuer: string;
  ownerName: string;
  expiryMonth: string;
  expiryYear: string;
}

export interface BankDetails {
  bankCode: string;
  bankName: string;
  accountNumber: string; // 마스킹된 계좌 번호
  accountHolder: string;
}

export interface MobileDetails {
  carrier: 'SKT' | 'KT' | 'LGU+' | 'MVNO';
  phoneNumber: string; // 마스킹된 전화번호
}

export interface PaymentRequest {
  orderId: string;
  orderName: string;
  amount: number;
  currency?: 'KRW' | 'USD';
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  successUrl?: string;
  failUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  paymentKey: string;
  orderId: string;
  status: PaymentStatus;
  requestedAt: string;
  approvedAt?: string;
  card?: CardInfo;
  virtualAccount?: VirtualAccountInfo;
  receipt?: ReceiptInfo;
  totalAmount: number;
  balanceAmount: number;
  suppliedAmount: number;
  vat: number;
  method: string;
}

export type PaymentStatus =
  | 'READY'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_DEPOSIT'
  | 'DONE'
  | 'CANCELED'
  | 'PARTIAL_CANCELED'
  | 'ABORTED'
  | 'EXPIRED';

export interface CardInfo {
  number: string;
  installmentPlanMonths: number;
  isInterestFree: boolean;
  issuerCode: string;
  acquirerCode: string;
  cardType: 'CREDIT' | 'DEBIT' | 'PREPAID';
  ownerType: 'PERSONAL' | 'CORPORATE';
}

export interface VirtualAccountInfo {
  accountType: string;
  accountNumber: string;
  bankCode: string;
  customerName: string;
  dueDate: string;
  refundStatus: 'NONE' | 'PENDING' | 'FAILED' | 'PARTIAL_FAILED' | 'COMPLETED';
  expired: boolean;
  settlementStatus: 'INCOMPLETE' | 'COMPLETE';
}

export interface ReceiptInfo {
  url: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  planName: string;
  amount: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  nextBillingDate?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: 'KRW';
  interval: 'MONTHLY' | 'YEARLY';
  features: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface PaymentHistory {
  id: string;
  paymentKey: string;
  orderId: string;
  orderName: string;
  customerId: string;
  amount: number;
  status: PaymentStatus;
  method: string;
  paidAt?: Date;
  cancelledAt?: Date;
  failedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface RefundRequest {
  paymentKey: string;
  cancelReason: string;
  cancelAmount?: number; // 부분 취소 시 금액
  refundReceiveAccount?: {
    bank: string;
    accountNumber: string;
    holderName: string;
  };
}

export interface RefundResponse {
  paymentKey: string;
  orderId: string;
  status: PaymentStatus;
  cancels?: CancelInfo[];
  totalAmount: number;
  balanceAmount: number;
  canceledAmount: number;
}

export interface CancelInfo {
  cancelAmount: number;
  cancelReason: string;
  taxFreeAmount: number;
  taxExemptionAmount: number;
  refundableAmount: number;
  easyPayDiscountAmount: number;
  canceledAt: string;
  transactionKey: string;
  receiptKey?: string;
}

export interface PaymentError {
  code: string;
  message: string;
  detail?: string;
}

export interface PointTransaction {
  id: string;
  userId: string;
  type: 'EARN' | 'USE' | 'EXPIRE' | 'CANCEL';
  amount: number;
  balance: number;
  description: string;
  orderId?: string;
  expiresAt?: Date;
  createdAt: Date;
}

export interface UserPoints {
  userId: string;
  totalPoints: number;
  availablePoints: number;
  pendingPoints: number;
  expiringPoints: number;
  expiringDate?: Date;
  updatedAt: Date;
}

export interface PaymentConfig {
  clientKey: string;
  secretKey: string;
  baseUrl?: string;
  successUrl: string;
  failUrl: string;
  webhookUrl?: string;
  environment: 'test' | 'production';
}

export interface BillingKeyRequest {
  customerId: string;
  cardNumber: string;
  cardExpiryYear: string;
  cardExpiryMonth: string;
  cardPassword: string;
  customerBirthday: string;
  customerName?: string;
  customerEmail?: string;
}

export interface BillingKeyResponse {
  billingKey: string;
  customerKey: string;
  cardCompany: string;
  cardNumber: string;
  createdAt: string;
}
