import { z } from 'zod';

// 정비 상태 정의
export const RepairStatusEnum = z.enum([
  'REQUESTED', // 요청됨
  'DIAGNOSED', // 진단 완료
  'QUOTED', // 견적 제공
  'APPROVED', // 견적 승인됨
  'IN_PROGRESS', // 정비 중
  'COMPLETED', // 완료
  'DELIVERED', // 인도됨
  'CANCELLED', // 취소됨
]);

export type RepairStatus = z.infer<typeof RepairStatusEnum>;

// 정비 우선순위 정의
export const RepairPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export type RepairPriority = z.infer<typeof RepairPriorityEnum>;

// 정비 유형 정의
export const RepairTypeEnum = z.enum([
  'ROUTINE', // 정기 점검
  'MAINTENANCE', // 유지 보수
  'BREAKDOWN', // 고장 수리
  'ACCIDENT', // 사고 수리
  'RECALL', // 리콜
  'WARRANTY', // 보증 수리
]);

export type RepairType = z.infer<typeof RepairTypeEnum>;

// 정비 스키마 정의
export const RepairSchema = z.object({
  id: z.string().uuid(),
  vehicleId: z.string().uuid(),
  customerId: z.string().uuid(),
  workshopId: z.string().uuid(),
  technicianId: z.string().uuid().optional(),
  description: z.string(),
  status: RepairStatusEnum,
  priority: RepairPriorityEnum,
  type: RepairTypeEnum,
  estimatedHours: z.number().optional(),
  actualHours: z.number().optional(),
  mileageAtService: z.number().int(),
  diagnosisNotes: z.string().optional(),
  requestedDate: z.date(),
  startDate: z.date().optional(),
  completionDate: z.date().optional(),
  estimatedCompletionDate: z.date().optional(),
  quotedAmount: z.number().optional(),
  finalAmount: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Repair = z.infer<typeof RepairSchema>;

// 정비 생성 입력값 스키마
export const CreateRepairInputSchema = RepairSchema.omit({
  id: true,
  technicianId: true,
  diagnosisNotes: true,
  actualHours: true,
  startDate: true,
  completionDate: true,
  finalAmount: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: z.literal(RepairStatusEnum.enum.REQUESTED).default(RepairStatusEnum.enum.REQUESTED),
});

export type CreateRepairInput = z.infer<typeof CreateRepairInputSchema>;

// 정비 업데이트 입력값 스키마
export const UpdateRepairInputSchema = RepairSchema.omit({
  id: true,
  vehicleId: true,
  customerId: true,
  workshopId: true,
  requestedDate: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type UpdateRepairInput = z.infer<typeof UpdateRepairInputSchema>;
