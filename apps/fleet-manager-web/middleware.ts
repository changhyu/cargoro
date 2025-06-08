import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 공개 경로 정의 (로그인하지 않아도 접근 가능)
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/api/webhooks(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // 공개 경로가 아닌 경우에만 보호
  if (!isPublicRoute(req)) {
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
