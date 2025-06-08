import { PrismaClient } from '@prisma/client';
import { prisma } from '../index';

/**
 * 역할 데이터 접근 계층
 *
 * Prisma ORM을 사용하여 역할 관련 데이터베이스 작업을 수행합니다.
 */
export class RoleRepository {
  /**
   * ID로 역할을 조회합니다.
   */
  async findById(id: number) {
    return prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  /**
   * 이름으로 역할을 조회합니다.
   */
  async findByName(name: string) {
    return prisma.role.findUnique({
      where: { name },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  /**
   * 새로운 역할을 생성합니다.
   */
  async create(data: { name: string; description?: string; permissionIds?: number[] }) {
    const { name, description, permissionIds = [] } = data;

    return prisma.role.create({
      data: {
        name,
        description: description || null,
        permissions: {
          create: permissionIds.map(permissionId => ({
            permission: {
              connect: { id: permissionId },
            },
          })),
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  /**
   * 역할 정보를 업데이트합니다.
   */
  async update(
    id: number,
    data: Partial<{
      name: string;
      description: string;
    }>
  ) {
    return prisma.role.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 역할을 삭제합니다.
   */
  async delete(id: number) {
    // 트랜잭션으로 관련 데이터 모두 삭제
    return prisma.$transaction(async tx => {
      // 연결된 역할-권한 관계 삭제
      await tx.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // 역할 삭제
      return tx.role.delete({
        where: { id },
      });
    });
  }

  /**
   * 역할에 권한을 추가합니다.
   */
  async addPermission(roleId: number, permissionId: number) {
    return prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
      include: {
        permission: true,
        role: true,
      },
    });
  }

  /**
   * 역할에서 권한을 제거합니다.
   */
  async removePermission(roleId: number, permissionId: number) {
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
   * 역할에 여러 권한을 설정합니다 (기존 권한 삭제 후 새로 추가).
   */
  async setPermissions(roleId: number, permissionIds: number[]) {
    return prisma.$transaction(async tx => {
      // 기존 권한 관계 모두 삭제
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      // 새 권한 관계 추가
      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map(permissionId => ({
            roleId,
            permissionId,
          })),
        });
      }

      // 업데이트된 역할 반환
      return tx.role.findUnique({
        where: { id: roleId },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    });
  }

  /**
   * 페이지 단위로 역할을 조회합니다.
   */
  async findMany(params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    const whereClause = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      }),
      prisma.role.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: roles,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }
}
