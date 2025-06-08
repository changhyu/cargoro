import { Permission } from '@prisma/client';
import { prisma } from '../index';

/**
 * 권한 데이터 접근 계층
 *
 * Prisma ORM을 사용하여 권한 관련 데이터베이스 작업을 수행합니다.
 */
export class PermissionRepository {
  /**
   * ID로 권한을 조회합니다.
   */
  async findById(id: number): Promise<Permission | null> {
    return prisma.permission.findUnique({
      where: { id },
    });
  }

  /**
   * 이름으로 권한을 조회합니다.
   */
  async findByName(name: string): Promise<Permission | null> {
    return prisma.permission.findUnique({
      where: { name },
    });
  }

  /**
   * 새로운 권한을 생성합니다.
   */
  async create(data: {
    name: string;
    description?: string;
    resource: string;
    action: string;
    scope?: string;
  }): Promise<Permission> {
    return prisma.permission.create({
      data: {
        name: data.name,
        description: data.description || null,
        resource: data.resource,
        action: data.action,
        scope: data.scope || null,
      },
    });
  }

  /**
   * 권한 정보를 업데이트합니다.
   */
  async update(
    id: number,
    data: Partial<{
      name: string;
      description: string;
      resource: string;
      action: string;
      scope: string;
    }>
  ): Promise<Permission> {
    return prisma.permission.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 권한을 삭제합니다.
   */
  async delete(id: number): Promise<Permission> {
    // 트랜잭션으로 관련 데이터 모두 삭제
    return prisma.$transaction(async tx => {
      // 연결된 역할-권한 관계 삭제
      await tx.rolePermission.deleteMany({
        where: { permissionId: id },
      });

      // 연결된 사용자-권한 관계 삭제
      await tx.userPermission.deleteMany({
        where: { permissionId: id },
      });

      // 권한 삭제
      return tx.permission.delete({
        where: { id },
      });
    });
  }

  /**
   * 특정 사용자에게 권한을 부여합니다.
   */
  async grantToUser(
    userId: string,
    permissionId: number,
    granted: boolean = true
  ): Promise<{
    userId: string;
    permissionId: number;
    granted: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return prisma.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId,
          permissionId,
        },
      },
      update: {
        granted,
        updatedAt: new Date(),
      },
      create: {
        userId,
        permissionId,
        granted,
      },
    });
  }

  /**
   * 특정 역할에 권한을 부여합니다.
   */
  async assignToRole(
    roleId: number,
    permissionId: number
  ): Promise<{
    roleId: number;
    permissionId: number;
    createdAt: Date;
  }> {
    return prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });
  }

  /**
   * 사용자로부터 권한을 제거합니다.
   */
  async revokeFromUser(
    userId: string,
    permissionId: number
  ): Promise<{
    userId: string;
    permissionId: number;
    granted: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return prisma.userPermission.delete({
      where: {
        userId_permissionId: {
          userId,
          permissionId,
        },
      },
    });
  }

  /**
   * 역할로부터 권한을 제거합니다.
   */
  async removeFromRole(
    roleId: number,
    permissionId: number
  ): Promise<{
    roleId: number;
    permissionId: number;
    createdAt: Date;
  }> {
    return prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });
  }

  /**
   * 사용자 (또는 해당 역할)에게 부여된 모든 권한을 조회합니다.
   */
  async getUserPermissions(
    userId: string,
    options: { includeRoles?: boolean } = {}
  ): Promise<Permission[]> {
    const { includeRoles = true } = options;

    // 사용자에게 직접 부여된 권한 조회
    const directPermissions = await prisma.userPermission.findMany({
      where: {
        userId,
        granted: true,
      },
      include: {
        permission: true,
      },
    });

    let rolePermissions: { permission: Permission }[] = [];

    // 역할을 통해 부여된 권한 조회 (옵션이 활성화된 경우)
    if (includeRoles) {
      const memberships = await prisma.organizationMember.findMany({
        where: {
          userId,
          roleId: { not: null },
        },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      // 역할을 통해 부여된 권한 추출
      rolePermissions = memberships.flatMap(
        m => m.role?.permissions.map(rp => ({ permission: rp.permission })) || []
      );
    }

    // 직접 권한과 역할 권한 결합 (중복 제거)
    const allPermissions = [...directPermissions, ...rolePermissions];

    // 권한 이름 기준 중복 제거
    const uniquePermissions = [
      ...new Map(allPermissions.map(p => [p.permission.name, p.permission])).values(),
    ];

    return uniquePermissions;
  }

  /**
   * 페이지 단위로 권한을 조회합니다.
   */
  async findMany(params: {
    page?: number;
    limit?: number;
    search?: string;
    resource?: string;
    action?: string;
  }): Promise<{
    data: Permission[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  }> {
    const { page = 1, limit = 10, search, resource, action } = params;
    const skip = (page - 1) * limit;

    const whereClause = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(resource ? { resource } : {}),
      ...(action ? { action } : {}),
    };

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.permission.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: permissions,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }
}
