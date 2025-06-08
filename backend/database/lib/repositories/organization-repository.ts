import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../index';

/**
 * 조직 데이터 접근 계층
 *
 * Prisma ORM을 사용하여 조직 관련 데이터베이스 작업을 수행합니다.
 */
export class OrganizationRepository {
  /**
   * ID로 조직을 조회합니다.
   */
  async findById(id: string) {
    return prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * 슬러그로 조직을 조회합니다.
   */
  async findBySlug(slug: string) {
    return prisma.organization.findUnique({
      where: { slug },
      include: {
        members: {
          include: {
            user: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * 새로운 조직을 생성합니다.
   */
  async create(data: {
    name: string;
    slug: string;
    description?: string;
    Logo?: string;
    type?: string;
    tier?: string;
  }) {
    return prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        Logo: data.Logo || null,
        type: data.type || null,
        tier: data.tier || 'free',
      },
    });
  }

  /**
   * 조직 정보를 업데이트합니다.
   */
  async update(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      description: string;
      Logo: string;
      type: string;
      tier: string;
      active: boolean;
    }>
  ) {
    return prisma.organization.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 조직을 삭제합니다.
   */
  async delete(id: string) {
    // 트랜잭션으로 관련 데이터 모두 삭제
    return prisma.$transaction(async tx => {
      // 연결된 멤버십 삭제
      await tx.organizationMember.deleteMany({
        where: { organizationId: id },
      });

      // 조직 삭제
      return tx.organization.delete({
        where: { id },
      });
    });
  }

  /**
   * 사용자를 조직에 추가합니다.
   */
  async addMember(params: {
    organizationId: string;
    userId: string;
    roleId?: number;
    isAdmin?: boolean;
    isOwner?: boolean;
  }) {
    const { organizationId, userId, roleId, isAdmin = false, isOwner = false } = params;

    return prisma.organizationMember.create({
      data: {
        organizationId,
        userId,
        roleId: roleId || null,
        isAdmin,
        isOwner,
        status: 'active',
      },
      include: {
        user: true,
        organization: true,
        role: true,
      },
    });
  }

  /**
   * 조직 멤버를 업데이트합니다.
   */
  async updateMember(
    organizationId: string,
    userId: string,
    data: Partial<{
      roleId: number;
      isAdmin: boolean;
      isOwner: boolean;
      status: string;
    }>
  ) {
    return prisma.organizationMember.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        user: true,
        organization: true,
        role: true,
      },
    });
  }

  /**
   * 조직에서 멤버를 제거합니다.
   */
  async removeMember(organizationId: string, userId: string) {
    return prisma.organizationMember.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });
  }

  /**
   * 조직 멤버십 정보를 조회합니다.
   */
  async findMembership(organizationId: string, userId: string) {
    return prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      include: {
        user: true,
        organization: true,
        role: true,
      },
    });
  }

  /**
   * 사용자의 모든 조직 멤버십을 조회합니다.
   */
  async findUserMemberships(userId: string) {
    return prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: true,
        role: true,
      },
    });
  }

  /**
   * 모든 조직 멤버를 페이지네이션으로 조회합니다.
   */
  async findMembers(
    organizationId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
    }
  ) {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    const whereClause = {
      organizationId,
      ...(search
        ? {
            user: {
              OR: [
                { email: { contains: search, mode: 'insensitive' as const } },
                { firstName: { contains: search, mode: 'insensitive' as const } },
                { lastName: { contains: search, mode: 'insensitive' as const } },
              ],
            },
          }
        : {}),
    };

    const [members, total] = await Promise.all([
      prisma.organizationMember.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          user: true,
          role: true,
        },
        orderBy: { joinedAt: 'desc' },
      }),
      prisma.organizationMember.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: members,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }

  /**
   * 페이지 단위로 조직을 조회합니다.
   */
  async findMany(params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    tier?: string;
  }) {
    const { page = 1, limit = 10, search, type, tier } = params;
    const skip = (page - 1) * limit;

    const whereClause = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { slug: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(type ? { type } : {}),
      ...(tier ? { tier } : {}),
    };

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          members: {
            include: {
              user: true,
              role: true,
            },
          },
        },
      }),
      prisma.organization.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: organizations,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }
}
