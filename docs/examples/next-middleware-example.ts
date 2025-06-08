/**
 * Next.js 앱 인증 미들웨어 예제
 *
 * 이 예제는 각 Next.js 앱에서 Clerk 인증 미들웨어를 구현하는 방법을 보여줍니다.
 * 이 파일을 앱의 루트 디렉토리에 middleware.ts 파일로 저장하세요.
 */

import { createClerkMiddleware } from '@cargoro/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 앱별 공개 경로 정의
 * 각 앱은 자체 공개 경로를 정의할 수 있습니다.
 */
const appPublicRoutes = [
  // 앱별 공개 경로 추가
  '/public-feature',
  '/api/public-api',
  '/legal/(.*)',
];

/**
 * 앱별 인증 필요 경로 정의
 * 각 앱은 자체 인증 필요 경로를 정의할 수 있습니다.
 */
const appAuthRoutes = [
  // 앱별 인증 필요 경로 추가
  '/app-specific/(.*)',
  '/api/protected/(.*)',
];

/**
 * Next.js 미들웨어 함수
 *
 * 이 함수는 모든 요청에 대해 실행되며 인증 로직을 처리합니다.
 */
export default createClerkMiddleware({
  customPublicRoutes: appPublicRoutes,
  customAuthRoutes: appAuthRoutes,
});

/**
 * 미들웨어 구성
 *
 * 미들웨어 구성에 대한 자세한 내용은 Next.js 문서를 참조하세요:
 * https://nextjs.org/docs/app/building-your-application/routing/middleware
 */
export const config = {
  // 모든 경로에 미들웨어 적용
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.ico|.*\\.svg).*)'],
};
