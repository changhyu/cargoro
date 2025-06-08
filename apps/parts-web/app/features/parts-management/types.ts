/**
 * 부품 관리 모듈 관련 타입 정의
 */

// parts-inventory/types에서 모든 타입을 re-export
export * from '@/features/parts-inventory/types';

// 호환성을 위해 타입 별칭 추가
export { PurchaseOrderStatus as OrderStatus } from '@/features/parts-inventory/types';
export type Order = import('@/features/parts-inventory/types').PurchaseOrder;
export type PartOrder = Order;

/**
 * 추가적인 부품 관리 전용 타입들을 여기에 정의할 수 있습니다.
 */
