import { createClerkMiddleware } from '@cargoro/auth/server';

// workshop-web 앱 전용 미들웨어
export default createClerkMiddleware({
  protected: ['/workshop(.*)', '/api/workshop(.*)'],
  public: ['/workshop/public(.*)', '/api/workshop/public(.*)'],
  debug: process.env.NODE_ENV === 'development',
});

export const config = {
  matcher: [
    // Next.js internals와 static files 제외
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // API routes는 항상 포함
    '/(api|trpc)(.*)',
  ],
};
