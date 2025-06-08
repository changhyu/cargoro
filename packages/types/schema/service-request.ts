/**
 * 정비 서비스 요청 관련 타입 정의
 */

import { z } from 'zod';

// 서비스 요청 상태 스키마
export const ServiceRequestStatusSchema = z.enum([
  'pending',
  'accepted',
  'in_progress',
  'completed',
  'rejected',
  'cancelled',
]);

// 서비스 요청 우선순위 스키마
export const PrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

// 서비스 요청 스키마
export const ServiceRequestSchema = z.object({
  id: z.string(),
  customer_id: z.string(),
  vehicle_id: z.string(),
  title: z.string(),
  description: z.string(),
  status: ServiceRequestStatusSchema,
  priority: PrioritySchema,
  requested_date: z.string(),
  scheduled_date: z.string().optional(),
  completed_date: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// 서비스 요청 생성 스키마
export const ServiceRequestCreateSchema = z.object({
  customer_id: z.string(),
  vehicle_id: z.string(),
  title: z.string().min(5, '제목은 최소 5자 이상이어야 합니다.'),
  description: z.string().min(10, '설명은 최소 10자 이상이어야 합니다.'),
  priority: PrioritySchema,
  requested_date: z.string(),
});

// 서비스 요청 수정 스키마
export const ServiceRequestUpdateSchema = z.object({
  title: z.string().min(5, '제목은 최소 5자 이상이어야 합니다.').optional(),
  description: z.string().min(10, '설명은 최소 10자 이상이어야 합니다.').optional(),
  status: ServiceRequestStatusSchema.optional(),
  priority: PrioritySchema.optional(),
  scheduled_date: z.string().optional(),
  completed_date: z.string().optional(),
});

// 타입 추출
export type ServiceRequest = z.infer<typeof ServiceRequestSchema>;
export type ServiceRequestCreate = z.infer<typeof ServiceRequestCreateSchema>;
export type ServiceRequestUpdate = z.infer<typeof ServiceRequestUpdateSchema>;
export type ServiceRequestStatus = z.infer<typeof ServiceRequestStatusSchema>;
export type Priority = z.infer<typeof PrioritySchema>;
