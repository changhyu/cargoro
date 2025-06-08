import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  // Clerk 미들웨어 설정 (기본적으로 모든 경로가 public)
  // 필요한 경우 보호된 경로 설정 가능
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(js|css|jpg|jpeg|png|gif|svg|ico)).*)',
    // Skip all api routes except the ones you want to protect
    '/(api|trpc)(.*)',
  ],
};
