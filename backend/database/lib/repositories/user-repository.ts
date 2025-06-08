import { compare, hash } from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../index';

/**
 * 사용자 데이터 접근 계층
 *
 * Prisma ORM을 사용하여 사용자 관련 데이터베이스 작업을 수행합니다.
 */
export class UserRepository {
  /**
   * ID로 사용자를 조회합니다.
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            organization: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * 이메일로 사용자를 조회합니다.
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            organization: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Clerk ID로 사용자를 조회합니다.
   */
  async findByClerkId(clerkId: string) {
    return prisma.user.findUnique({
      where: { clerkId },
      include: {
        memberships: {
          include: {
            organization: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Firebase UID로 사용자를 조회합니다.
   */
  async findByFirebaseUid(firebaseUid: string) {
    return prisma.user.findUnique({
      where: { firebaseUid },
      include: {
        memberships: {
          include: {
            organization: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * 새로운 사용자를 생성합니다.
   */
  async create(data: {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    clerkId?: string;
    firebaseUid?: string;
    phoneNumber?: string;
    role?: string;
  }) {
    let hashedPassword: string | undefined = undefined;

    if (data.password) {
      hashedPassword = await hash(data.password, 10);
    }

    return prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        clerkId: data.clerkId || null,
        firebaseUid: data.firebaseUid || null,
        phoneNumber: data.phoneNumber || null,
      },
    });
  }

  /**
   * 사용자 정보를 업데이트합니다.
   */
  async update(
    id: string,
    data: Partial<{
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      clerkId: string;
      firebaseUid: string;
      phoneNumber: string;
      lastLogin: Date;
    }>
  ) {
    const updateData = { ...data };

    if (data.password) {
      updateData.password = await hash(data.password, 10);
    }

    return prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 비밀번호를 검증합니다.
   */
  async verifyPassword(id: string, password: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { password: true },
    });

    if (!user || !user.password) {
      return false;
    }

    return compare(password, user.password);
  }

  /**
   * 사용자 삭제
   */
  async delete(id: string) {
    // 트랜잭션으로 관련 데이터 모두 삭제
    return prisma.$transaction(async tx => {
      // 연결된 조직 멤버십 삭제
      await tx.organizationMember.deleteMany({
        where: { userId: id },
      });

      // 연결된 사용자 권한 삭제
      await tx.userPermission.deleteMany({
        where: { userId: id },
      });

      // 사용자 로그 삭제
      await tx.authLog.deleteMany({
        where: { userId: id },
      });

      // 사용자 삭제
      return tx.user.delete({
        where: { id },
      });
    });
  }

  /**
   * 페이지 단위로 사용자를 조회합니다.
   */
  async findMany(params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    const whereClause = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          memberships: {
            include: {
              organization: true,
              role: true,
            },
          },
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }
}
