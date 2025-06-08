import { z } from 'zod';

// 위치 유형 정의
export const LocationTypeEnum = z.enum([
  'WAREHOUSE', // 창고
  'WORKSHOP', // 정비소
  'SHOWROOM', // 전시장
  'OFFICE', // 사무실
  'DELIVERY_POINT', // 배송 지점
  'STORAGE', // 보관소
  'RETURN_CENTER', // 반품 센터
]);

export type LocationType = z.infer<typeof LocationTypeEnum>;

// 위치 스키마 정의
export const LocationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: LocationTypeEnum,
  organizationId: z.string().uuid(),
  address: z.string(),
  city: z.string(),
  state: z.string().optional(),
  postalCode: z.string(),
  country: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
  openingHours: z.string().optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Location = z.infer<typeof LocationSchema>;

// 위치 구역(Zone) 스키마 - 창고나 작업장 내의 구역 정의
export const LocationZoneSchema = z.object({
  id: z.string().uuid(),
  locationId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  capacity: z.number().int().optional(), // 최대 수용량
  currentOccupancy: z.number().int().optional(), // 현재 사용량
  zoneType: z.string(), // 구역 유형(작업베이, 보관선반, 등)
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type LocationZone = z.infer<typeof LocationZoneSchema>;

// 위치 생성 입력값 스키마
export const CreateLocationInputSchema = LocationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
});

export type CreateLocationInput = z.infer<typeof CreateLocationInputSchema>;

// 위치 업데이트 입력값 스키마
export const UpdateLocationInputSchema = LocationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type UpdateLocationInput = z.infer<typeof UpdateLocationInputSchema>;
