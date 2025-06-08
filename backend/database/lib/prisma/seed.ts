import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// 비밀번호 해싱 함수
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// 초기 시드 데이터 생성
async function main() {
  console.log('🌱 시드 데이터 생성 시작...');

  // 권한 생성
  const permissions = [
    // 관리자 권한
    {
      name: 'admin:users:manage',
      resource: 'users',
      action: 'manage',
      scope: 'all',
      description: '사용자 관리 권한',
    },
    {
      name: 'admin:organizations:manage',
      resource: 'organizations',
      action: 'manage',
      scope: 'all',
      description: '조직 관리 권한',
    },
    {
      name: 'admin:roles:manage',
      resource: 'roles',
      action: 'manage',
      scope: 'all',
      description: '역할 관리 권한',
    },
    {
      name: 'admin:permissions:manage',
      resource: 'permissions',
      action: 'manage',
      scope: 'all',
      description: '권한 관리 권한',
    },
    {
      name: 'admin:system:manage',
      resource: 'system',
      action: 'manage',
      scope: 'all',
      description: '시스템 설정 관리 권한',
    },

    // 워크샵 권한
    {
      name: 'workshop:repairs:manage',
      resource: 'repairs',
      action: 'manage',
      scope: 'org',
      description: '정비 작업 관리 권한',
    },
    {
      name: 'workshop:appointments:manage',
      resource: 'appointments',
      action: 'manage',
      scope: 'org',
      description: '예약 관리 권한',
    },
    {
      name: 'workshop:inventory:manage',
      resource: 'inventory',
      action: 'manage',
      scope: 'org',
      description: '재고 관리 권한',
    },
    {
      name: 'workshop:staff:manage',
      resource: 'staff',
      action: 'manage',
      scope: 'org',
      description: '직원 관리 권한',
    },

    // 차량 관리 권한
    {
      name: 'vehicles:read',
      resource: 'vehicles',
      action: 'read',
      scope: 'all',
      description: '차량 조회 권한',
    },
    {
      name: 'vehicles:write',
      resource: 'vehicles',
      action: 'write',
      scope: 'own',
      description: '차량 정보 수정 권한',
    },
    {
      name: 'vehicles:delete',
      resource: 'vehicles',
      action: 'delete',
      scope: 'own',
      description: '차량 삭제 권한',
    },

    // 부품 관리 권한
    {
      name: 'parts:read',
      resource: 'parts',
      action: 'read',
      scope: 'all',
      description: '부품 조회 권한',
    },
    {
      name: 'parts:write',
      resource: 'parts',
      action: 'write',
      scope: 'org',
      description: '부품 정보 수정 권한',
    },
    {
      name: 'parts:delete',
      resource: 'parts',
      action: 'delete',
      scope: 'org',
      description: '부품 삭제 권한',
    },
  ];

  console.log('👉 권한 생성 중...');
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: {
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
        scope: permission.scope,
        description: permission.description,
      },
    });
  }
  console.log('✅ 권한 생성 완료');

  // 역할 생성
  const roles = [
    {
      name: 'ADMIN',
      description: '시스템 관리자',
      permissions: [
        'admin:users:manage',
        'admin:organizations:manage',
        'admin:roles:manage',
        'admin:permissions:manage',
        'admin:system:manage',
      ],
    },
    {
      name: 'WORKSHOP_OWNER',
      description: '정비소 소유자',
      permissions: [
        'workshop:repairs:manage',
        'workshop:appointments:manage',
        'workshop:inventory:manage',
        'workshop:staff:manage',
        'vehicles:read',
        'vehicles:write',
        'parts:read',
        'parts:write',
      ],
    },
    {
      name: 'WORKSHOP_STAFF',
      description: '정비소 직원',
      permissions: [
        'workshop:repairs:manage',
        'workshop:appointments:manage',
        'vehicles:read',
        'parts:read',
      ],
    },
    {
      name: 'CUSTOMER',
      description: '고객',
      permissions: ['vehicles:read', 'vehicles:write', 'vehicles:delete'],
    },
    {
      name: 'DRIVER',
      description: '배송 기사',
      permissions: ['vehicles:read'],
    },
  ];

  console.log('👉 역할 생성 중...');
  for (const role of roles) {
    const createdRole = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: {
        name: role.name,
        description: role.description,
      },
    });

    // 역할에 권한 할당
    const permissionEntities = await prisma.permission.findMany({
      where: { name: { in: role.permissions } },
    });

    // 기존 역할-권한 관계 삭제
    await prisma.rolePermission.deleteMany({
      where: { roleId: createdRole.id },
    });

    // 새 역할-권한 관계 생성
    for (const permission of permissionEntities) {
      await prisma.rolePermission.create({
        data: {
          roleId: createdRole.id,
          permissionId: permission.id,
        },
      });
    }
  }
  console.log('✅ 역할 생성 완료');

  // 관리자 사용자 생성 (테스트 목적)
  const adminPassword = await hashPassword('admin123');
  const adminId = randomUUID();

  console.log('👉 관리자 사용자 생성 중...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cargoro.com' },
    update: {},
    create: {
      id: adminId,
      email: 'admin@cargoro.com',
      firstName: '관리자',
      lastName: '카고로',
      password: adminPassword,
      clerkId: 'admin_clerk_id', // Clerk ID (실제로는 Clerk에서 생성된 ID 사용)
      active: true,
    },
  });
  console.log('✅ 관리자 사용자 생성 완료');

  // 테스트 조직 생성
  console.log('👉 테스트 조직 생성 중...');
  const organization = await prisma.organization.upsert({
    where: { slug: 'cargoro-test' },
    update: {},
    create: {
      name: '카고로 테스트',
      slug: 'cargoro-test',
      description: '테스트 조직',
      type: 'ADMIN',
      tier: 'enterprise',
      active: true,
    },
  });
  console.log('✅ 테스트 조직 생성 완료');

  // 관리자를 조직에 추가
  console.log('👉 관리자를 조직에 추가 중...');
  const adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' },
  });

  if (adminRole) {
    await prisma.organizationMember.upsert({
      where: {
        userId_organizationId: {
          userId: admin.id,
          organizationId: organization.id,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        organizationId: organization.id,
        roleId: adminRole.id,
        isOwner: true,
        isAdmin: true,
        status: 'active',
      },
    });
  }
  console.log('✅ 관리자를 조직에 추가 완료');

  console.log('🎉 시드 데이터 생성 완료!');
}

main()
  .catch(e => {
    console.error('시드 데이터 생성 중 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
