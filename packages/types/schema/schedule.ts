/**
 * 정비사 일정 관리 관련 타입 정의
 */

import { z } from 'zod';

// 일정 스키마
export const ScheduleSchema = z.object({
  id: z.string(),
  technician_id: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  repair_id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// 일정 생성 스키마
export const ScheduleCreateSchema = z.object({
  technician_id: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  repair_id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
});

// 일정 수정 스키마
export const ScheduleUpdateSchema = z.object({
  technician_id: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  repair_id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
});

// 타입 추출
export type Schedule = z.infer<typeof ScheduleSchema>;
export type ScheduleCreate = z.infer<typeof ScheduleCreateSchema>;
export type ScheduleUpdate = z.infer<typeof ScheduleUpdateSchema>;
