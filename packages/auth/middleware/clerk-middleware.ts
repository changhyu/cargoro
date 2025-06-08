import { clerkMiddleware as baseClerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 공통 보호 경로 패턴
const commonProtectedRoutes = [
  '/dashboard(.*)',
  '/api/protected(.*)',
  '/admin(.*)',
  '/settings(.*)',
  '/profile(.*)',
];

// 공통 공개 경로 패턴
const commonPublicRoutes = [
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/public(.*)',
  '/api/webhooks(.*)',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
];

export interface ClerkMiddlewareConfig {
  protected?: string[];
  public?: string[];
  debug?: boolean;
}

export const createClerkMiddleware = (appSpecificRoutes?: ClerkMiddlewareConfig) => {
  const protectedRoutes = [...commonProtectedRoutes, ...(appSpecificRoutes?.protected || [])];

  const publicRoutes = [...commonPublicRoutes, ...(appSpecificRoutes?.public || [])];

  const isProtectedRoute = createRouteMatcher(protectedRoutes);
  const isPublicRoute = createRouteMatcher(publicRoutes);

  return baseClerkMiddleware(async (auth, request) => {
    const { pathname } = new URL(request.url);

    // 디버그 모드
    if (appSpecificRoutes?.debug) {
      console.log(`[Clerk Middleware] Path: ${pathname}`);
      console.log(`[Clerk Middleware] Is Public: ${isPublicRoute(request)}`);
      console.log(`[Clerk Middleware] Is Protected: ${isProtectedRoute(request)}`);
    }

    // 보호된 경로이고 공개 경로가 아닌 경우
    if (!isPublicRoute(request) && isProtectedRoute(request)) {
      // auth.protect()를 사용하여 인증 확인
      await auth.protect();
    }
  });
};

// 기본 미들웨어 export
export const clerkMiddleware = createClerkMiddleware();

// 미들웨어 매처 설정
export const defaultConfig = {
  matcher: [
    // Next.js internals와 static files 제외
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // API routes는 항상 포함
    '/(api|trpc)(.*)',
  ],
};
