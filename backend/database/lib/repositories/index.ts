/**
 * 데이터 접근 계층 통합 인덱스
 *
 * 모든 리포지토리를 한 곳에서 관리하고 내보냅니다.
 */
import { PrismaClient } from '@prisma/client';
import { OrganizationRepository } from './organization-repository';
import { PermissionRepository } from './permission-repository';
import { RoleRepository } from './role-repository';
import { UserRepository } from './user-repository';

// Prisma 클라이언트 공통 인스턴스 생성
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// 싱글톤 인스턴스 생성
const userRepository = new UserRepository();
const permissionRepository = new PermissionRepository();
const roleRepository = new RoleRepository();
const organizationRepository = new OrganizationRepository();

// 리포지토리 객체 내보내기
export const repositories = {
  users: userRepository,
  permissions: permissionRepository,
  roles: roleRepository,
  organizations: organizationRepository,
};

// 개별 리포지토리 클래스 내보내기
export { OrganizationRepository, PermissionRepository, RoleRepository, UserRepository };

// DB 스키마는 더 이상 따로 export하지 않음 (Prisma 스키마로 대체)

// 기본 내보내기
export default repositories;
