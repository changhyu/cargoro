import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 보호된 경로 패턴 정의
const isProtectedRoute = createRouteMatcher([
  '/(.*)', // 모든 경로를 보호
  '!/sign-in(.*)',
  '!/sign-up(.*)',
  '!/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
