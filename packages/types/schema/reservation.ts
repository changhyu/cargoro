/**
 * 정비소 예약 관리 관련 타입 정의
 */

import { z } from 'zod';

// 예약 상태 스키마
export const ReservationStatusSchema = z.enum([
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'in_progress',
]);

// 예약 상태 enum 값 (런타임에서 사용 가능)
export const ReservationStatus = {
  PENDING: 'pending' as const,
  CONFIRMED: 'confirmed' as const,
  COMPLETED: 'completed' as const,
  CANCELLED: 'cancelled' as const,
  IN_PROGRESS: 'in_progress' as const,
} as const;

// 예약 서비스 타입 스키마
export const ServiceTypeSchema = z.enum(['regular', 'repair', 'emergency', 'inspection']);

// 예약 타입 enum 값
export const ReservationType = {
  REGULAR: 'regular' as const,
  REPAIR: 'repair' as const,
  EMERGENCY: 'emergency' as const,
  INSPECTION: 'inspection' as const,
  MAINTENANCE: 'maintenance' as const,
} as const;

// 예약 스키마
export const ReservationSchema = z.object({
  id: z.string(),
  customer_id: z.string(),
  vehicle_id: z.string(),
  service_type: ServiceTypeSchema,
  date: z.string(),
  status: ReservationStatusSchema,
  notes: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// 예약 생성 스키마
export const ReservationCreateSchema = z.object({
  customer_id: z.string(),
  vehicle_id: z.string(),
  service_type: ServiceTypeSchema,
  date: z.string(),
  notes: z.string().optional(),
});

// 예약 수정 스키마
export const ReservationUpdateSchema = z.object({
  customer_id: z.string().optional(),
  vehicle_id: z.string().optional(),
  service_type: ServiceTypeSchema.optional(),
  date: z.string().optional(),
  status: ReservationStatusSchema.optional(),
  notes: z.string().optional(),
});

// 타입 추출
export type Reservation = z.infer<typeof ReservationSchema>;
export type ReservationCreate = z.infer<typeof ReservationCreateSchema>;
export type ReservationUpdate = z.infer<typeof ReservationUpdateSchema>;
export type ReservationStatusType = z.infer<typeof ReservationStatusSchema>;
export type ServiceType = z.infer<typeof ServiceTypeSchema>;
