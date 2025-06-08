/**
 * Clerk 인증 미들웨어
 *
 * Next.js 앱에서 사용하는 Clerk 인증 미들웨어 설정
 * 모든 앱에서 공통으로 사용할 수 있는 구성을 제공합니다.
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isProduction = process.env.NODE_ENV === 'production';
const bypassAuth = process.env.BYPASS_AUTH === 'true';

/**
 * 공개 경로 설정
 * 각 앱은 이 배열을 확장하여 자체 공개 경로를 추가할 수 있습니다
 */
export const publicRoutes = [
  '/',
  '/sign-in',
  '/sign-up',
  '/api/health',
  '/api/webhook',
  '/api/auth/(.*)',
  '/health',
  '/oauth/(.*)',
  '/forgot-password',
  '/reset-password',
  '/legal/(.*)',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/support',
  '/verify-(.*)',
];

/**
 * 인증 필요 경로 설정
 */
export const authRoutes = [
  '/dashboard(.*)',
  '/account(.*)',
  '/settings(.*)',
  '/profile(.*)',
  '/bookings(.*)',
  '/vehicles(.*)',
  '/repairs(.*)',
  '/deliveries(.*)',
  '/parts(.*)',
  '/admin(.*)',
  '/api/((?!health|webhook|auth).)*',
];

/**
 * 커스텀 Clerk 미들웨어
 * 모든 앱에서 사용할 수 있도록 구성되었습니다.
 */
export function createClerkMiddleware({
  customPublicRoutes = [],
  customAuthRoutes = [],
}: {
  customPublicRoutes?: string[];
  customAuthRoutes?: string[];
} = {}) {
  // 개발 환경에서 인증 우회가 활성화된 경우 인증 없이 모든 요청 허용
  if (!isProduction && bypassAuth) {
    return (req: NextRequest) => {
      console.warn('⚠️ 개발 환경에서 인증이 우회되었습니다. 프로덕션에서는 비활성화하세요.');
      return NextResponse.next();
    };
  }

  // 모든 공개 경로와 커스텀 공개 경로 결합
  const allPublicRoutes = [...publicRoutes, ...customPublicRoutes];
  const allAuthRoutes = [...authRoutes, ...customAuthRoutes];

  // 경로 매처 생성
  const isPublic = createRouteMatcher(allPublicRoutes);
  const isAuth = createRouteMatcher(allAuthRoutes);

  // Clerk v5 미들웨어 반환
  return clerkMiddleware(async (auth, req) => {
    // 인증이 필요한 경로에 대해 보호
    if (isAuth(req)) {
      await auth.protect();
    }
  });
}

// 기본 Clerk 미들웨어 내보내기
export default createClerkMiddleware();
