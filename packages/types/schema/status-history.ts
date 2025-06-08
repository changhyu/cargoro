/**
 * 정비 작업 상태 이력 관리 관련 타입 정의
 */

import { z } from 'zod';

// 상태 이력 스키마
export const RepairStatusSchema = z.enum([
  'pending',
  'in_progress',
  'waiting_parts',
  'completed',
  'cancelled',
]);

export const StatusHistorySchema = z.object({
  id: z.string(),
  repair_id: z.string(),
  status: RepairStatusSchema,
  timestamp: z.string(),
  note: z.string().optional(),
  technician_id: z.string().optional(),
  technician_name: z.string().optional(),
});

// 상태 이력 생성 스키마
export const StatusHistoryCreateSchema = z.object({
  repair_id: z.string(),
  status: RepairStatusSchema,
  note: z.string().optional(),
  technician_id: z.string().optional(),
});

// 타입 추출
export type StatusHistory = z.infer<typeof StatusHistorySchema>;
export type StatusHistoryCreate = z.infer<typeof StatusHistoryCreateSchema>;
