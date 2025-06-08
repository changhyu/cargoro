import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// 공개 라우트 정의 (로그인 없이 접근 가능)
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/public(.*)',
]);

// 관리자 전용 라우트 정의
const isAdminRoute = createRouteMatcher(['/admin(.*)', '/dashboard/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // 공개 라우트가 아닌 경우 인증 필요
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // 관리자 라우트에 대한 추가 권한 확인
  if (isAdminRoute(req)) {
    await auth.protect({ role: 'org:admin' });
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Next.js internals과 정적 파일 제외
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // API 라우트는 항상 실행
    '/(api|trpc)(.*)',
  ],
};
