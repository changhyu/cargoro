'use server';

import { auth as nextAuth } from '@clerk/nextjs/server';

/**
 * 서버 측 인증 관련 유틸리티
 *
 * Next.js 서버 컴포넌트 및 API 라우트에서 사용할 수 있는 인증 유틸리티
 */
export async function auth() {
  return nextAuth();
}

/**
 * 사용자 인증 확인 미들웨어
 *
 * 인증되지 않은 사용자를 로그인 페이지로 리다이렉트
 */
export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('인증이 필요합니다.');
  }

  return { userId };
}

/**
 * 관리자 권한 확인 미들웨어
 *
 * 관리자 권한이 없는 사용자를 거부
 */
export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('인증이 필요합니다.');
  }

  // 관리자 권한 확인 로직 구현
  // 실제 환경에서는 사용자의 역할 및 권한 확인 로직 추가

  return { userId, isAdmin: true };
}

export default auth;
