/**
 * 데이터베이스 계층 진입점
 *
 * Prisma 클라이언트와 리포지토리를 내보냅니다.
 */
import { repositories, prisma } from './repositories';

// 리포지토리 모듈 내보내기
export { repositories, prisma };

// Prisma 클라이언트 내보내기
export default prisma;
