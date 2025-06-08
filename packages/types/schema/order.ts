import { z } from 'zod';

// 주문 상태 정의
export const OrderStatusEnum = z.enum([
  'DRAFT', // 임시 저장
  'SUBMITTED', // 제출됨
  'CONFIRMED', // 확인됨
  'PROCESSING', // 처리 중
  'PARTIALLY_SHIPPED', // 일부 배송됨
  'SHIPPED', // 배송됨
  'DELIVERED', // 배달됨
  'COMPLETED', // a완료됨
  'CANCELLED', // 취소됨
  'REFUNDED', // 환불됨
  'ON_HOLD', // 보류 중
]);

export type OrderStatus = z.infer<typeof OrderStatusEnum>;

// 주문 타입 정의
export const OrderTypeEnum = z.enum([
  'PART_PURCHASE', // 부품 구매
  'REPAIR_SERVICE', // 정비 서비스
  'RENTAL', // 차량 렌탈
  'SUBSCRIPTION', // 구독 서비스
]);

export type OrderType = z.infer<typeof OrderTypeEnum>;

// 결제 방법 정의
export const PaymentMethodEnum = z.enum([
  'CREDIT_CARD', // 신용카드
  'BANK_TRANSFER', // 계좌이체
  'VIRTUAL_ACCOUNT', // 가상계좌
  'MOBILE_PAYMENT', // 모바일 결제
  'CORPORATE_ACCOUNT', // 법인 계정
  'PAYMENT_LINK', // 결제 링크
  'CASH', // 현금
]);

export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

// 주문 스키마 정의
export const OrderSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  organizationId: z.string().uuid().optional(), // 법인 주문일 경우
  type: OrderTypeEnum,
  status: OrderStatusEnum,
  orderNumber: z.string(),
  orderDate: z.date(),
  totalAmount: z.number(),
  taxAmount: z.number(),
  discountAmount: z.number().optional(),
  shippingAmount: z.number().optional(),
  notes: z.string().optional(),
  billingAddress: z.string(),
  shippingAddress: z.string().optional(),
  paymentMethod: PaymentMethodEnum,
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_PAID']),
  estimatedDelivery: z.date().optional(),
  actualDelivery: z.date().optional(),
  relatedRepairId: z.string().uuid().optional(), // 정비 관련 주문인 경우
  relatedVehicleId: z.string().uuid().optional(), // 관련 차량
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Order = z.infer<typeof OrderSchema>;

// 주문 항목 스키마
export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  partId: z.string().uuid().optional(), // 부품인 경우
  serviceId: z.string().uuid().optional(), // 서비스인 경우
  description: z.string(),
  quantity: z.number().int(),
  unitPrice: z.number(),
  discount: z.number().optional(),
  tax: z.number(),
  subtotal: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

// 주문 생성 입력값 스키마
export const CreateOrderInputSchema = OrderSchema.omit({
  id: true,
  orderDate: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  items: z.array(
    OrderItemSchema.omit({
      id: true,
      orderId: true,
      createdAt: true,
      updatedAt: true,
    })
  ),
});

export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;

// 주문 업데이트 입력값 스키마
export const UpdateOrderInputSchema = OrderSchema.omit({
  id: true,
  orderNumber: true,
  customerId: true,
  orderDate: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type UpdateOrderInput = z.infer<typeof UpdateOrderInputSchema>;
