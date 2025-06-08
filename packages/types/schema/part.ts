import { z } from 'zod';

// 부품 카테고리 정의
export const PartCategoryEnum = z.enum([
  'ENGINE', // 엔진 부품
  'TRANSMISSION', // 변속기 부품
  'BRAKE', // 브레이크 시스템
  'SUSPENSION', // 서스펜션 시스템
  'ELECTRICAL', // 전기 시스템
  'BODY', // 차체 부품
  'INTERIOR', // 내장 부품
  'HVAC', // 난방, 환기, 에어컨
  'FUEL_SYSTEM', // 연료 시스템
  'EXHAUST', // 배기 시스템
  'COOLING', // 냉각 시스템
  'STEERING', // 조향 시스템
  'FILTERS', // 필터류
  'FLUIDS', // 오일, 액체류
  'SENSORS', // 센서류
  'MISC', // 기타
]);

export type PartCategory = z.infer<typeof PartCategoryEnum>;

// 부품 스키마 정의
export const PartSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  sku: z.string(),
  description: z.string(),
  manufacturer: z.string(),
  category: PartCategoryEnum,
  price: z.number(),
  cost: z.number(),
  currentStock: z.number().int(),
  minStockLevel: z.number().int(),
  location: z.string().optional(),
  weight: z.number().optional(),
  dimensions: z.string().optional(),
  serialized: z.boolean().default(false),
  compatibleVehicles: z.array(z.string()),
  imageUrls: z.array(z.string().url()).optional(),
  active: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Part = z.infer<typeof PartSchema>;

// 부품 상태 이력 유형 정의
export const PartInventoryActionEnum = z.enum([
  'PURCHASE', // 구매, 입고
  'SALE', // 판매, 출고
  'RETURN', // 반품
  'ADJUSTMENT', // 재고 조정
  'TRANSFER', // 내부 이동
  'RESERVED', // 정비용 예약
  'USED', // 정비에 사용됨
]);

export type PartInventoryAction = z.infer<typeof PartInventoryActionEnum>;

// 부품 재고 이력 스키마
export const PartInventoryHistorySchema = z.object({
  id: z.string().uuid(),
  partId: z.string().uuid(),
  action: PartInventoryActionEnum,
  quantity: z.number().int(),
  previousStock: z.number().int(),
  newStock: z.number().int(),
  reference: z.string().optional(), // 관련 주문, 정비 ID 등
  notes: z.string().optional(),
  timestamp: z.date(),
  userId: z.string().uuid(), // 작업 수행한 사용자
  locationId: z.string().uuid().optional(), // 위치 변경 시
});

export type PartInventoryHistory = z.infer<typeof PartInventoryHistorySchema>;

// 부품 생성 입력값 스키마
export const CreatePartInputSchema = PartSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreatePartInput = z.infer<typeof CreatePartInputSchema>;

// 부품 업데이트 입력값 스키마
export const UpdatePartInputSchema = PartSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type UpdatePartInput = z.infer<typeof UpdatePartInputSchema>;
