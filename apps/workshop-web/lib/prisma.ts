// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// PrismaClient의 글로벌 인스턴스 선언
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 개발 환경에서 여러 인스턴스가 생성되는 것을 방지하기 위해
// 이미 존재하는 PrismaClient 인스턴스를 재사용
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// 개발 환경이 아닌 경우에만 글로벌 변수에 PrismaClient 인스턴스를 할당
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
