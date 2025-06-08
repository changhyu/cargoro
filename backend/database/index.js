/**
 * 데이터베이스 모듈 진입점
 *
 * 이 파일은 데이터베이스 관련 공통 기능을 내보냅니다.
 */
import { PrismaClient } from '@prisma/client';
import * as repositories from './lib/repositories';

// 환경 설정 로드
const isDev = process.env.NODE_ENV === 'development';

// Prisma 클라이언트 인스턴스 생성
const prisma = new PrismaClient({
  log: isDev ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// 데이터베이스 연결
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('데이터베이스 연결 성공');
    return prisma;
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
    throw error;
  }
}

// 데이터베이스 연결 해제
export async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log('데이터베이스 연결 해제');
}

// 리포지토리 내보내기
export { repositories };

// Prisma 클라이언트 내보내기
export { prisma };

// 기본 내보내기
export default {
  prisma,
  connect: connectDatabase,
  disconnect: disconnectDatabase,
  repositories,
};
