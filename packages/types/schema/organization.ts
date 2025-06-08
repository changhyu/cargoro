import { z } from 'zod';

// 조직 유형 정의
export const OrganizationTypeEnum = z.enum([
  'WORKSHOP', // 정비소
  'FLEET', // 차량 관리 업체
  'PARTS_SHOP', // 부품 상점
  'RENTAL', // 렌탈 업체
  'DELIVERY', // 배송 업체
  'CORPORATE', // 일반 기업
]);

export type OrganizationType = z.infer<typeof OrganizationTypeEnum>;

// 조직 스키마 정의
export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  type: OrganizationTypeEnum,
  address: z.string(),
  city: z.string(),
  state: z.string().optional(),
  postalCode: z.string(),
  country: z.string(),
  phone: z.string(),
  email: z.string().email(),
  website: z.string().url().optional(),
  taxId: z.string().optional(),
  businessRegistrationNumber: z.string(),
  logoUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
  parentOrganizationId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Organization = z.infer<typeof OrganizationSchema>;

// 조직 생성 입력값 스키마
export const CreateOrganizationInputSchema = OrganizationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
});

export type CreateOrganizationInput = z.infer<typeof CreateOrganizationInputSchema>;

// 조직 업데이트 입력값 스키마
export const UpdateOrganizationInputSchema = OrganizationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationInputSchema>;
