import { z } from 'zod';

// 사용자 역할 정의
export const UserRoleEnum = z.enum([
  'ADMIN', // 시스템 관리자
  'WORKSHOP_OWNER', // 정비소 소유자/관리자
  'WORKSHOP_STAFF', // 정비소 직원/정비사
  'CUSTOMER', // 일반 고객
  'DRIVER', // 탁송 기사
  'FLEET_MANAGER', // 법인 차량 관리자
  'PARTS_MANAGER', // 부품 관리자
]);

export type UserRole = z.infer<typeof UserRoleEnum>;

// 사용자 스키마 정의
export const UserSchema = z.object({
  id: z.string().uuid(),
  clerkId: z.string().optional(), // Clerk 통합을 위한 필드
  email: z.string().email(),
  fullName: z.string().min(2).max(100),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  phoneNumber: z.string().optional(), // Clerk 호환성
  role: UserRoleEnum,
  organizationId: z.string().uuid().optional(),
  profileImageUrl: z.string().url().optional(),
  profileImage: z.string().url().optional(), // Clerk 호환성
  isActive: z.boolean().default(true),
  active: z.boolean().default(true), // 호환성을 위한 별칭
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLogin: z.date().optional(),
});

export type User = z.infer<typeof UserSchema>;

// 사용자 생성 입력값 스키마
export const CreateUserInputSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
}).extend({
  password: z.string().min(8).max(100),
});

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

// 사용자 업데이트 입력값 스키마
export const UpdateUserInputSchema = UserSchema.omit({
  id: true,
  email: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;
