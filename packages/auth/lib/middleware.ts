import { NextRequest, NextResponse } from 'next/server';

// 타입 정의
export interface AuthObject {
  userId: string | null;
  sessionId: string | null;
  getToken: () => Promise<string | null>;
  sessionClaims?: {
    metadata?: {
      role?: string;
    };
  };
  isPublicRoute?: boolean;
}

// afterAuth 핸들러 함수 - 테스트를 위해 분리
export const handleAfterAuth = (auth: AuthObject, req: NextRequest) => {
  // 공개 경로 패턴
  const publicRoutes = ['/', '/sign-in', '/sign-up', '/api'];

  // 경로가 공개 경로인지 확인
  const isPublicRoute = publicRoutes.some(
    route => req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(`${route}/`)
  );

  // 이미 공개 경로인 경우 처리하지 않음
  if (!isPublicRoute) {
    // 사용자가 로그인하지 않은 경우
    if (!auth.userId) {
      // 로그인 페이지로 리다이렉트
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // 특정 역할 검사 등의 추가 로직을 여기에 구현할 수 있음
    // ex: 관리자만 접근 가능한 경로
    if (
      req.nextUrl.pathname.startsWith('/admin') &&
      auth.sessionClaims?.metadata?.role !== 'admin'
    ) {
      // 접근 거부 응답
      return NextResponse.json({ message: '접근 권한이 없습니다.' }, { status: 403 });
    }
  }

  // 접근 허용
  return NextResponse.next();
};

// 미들웨어 함수
export const middleware = (req: NextRequest) => {
  // 실제 구현에서는 Clerk의 authMiddleware를 사용하지만,
  // 현재는 직접 구현된 handleAfterAuth를 사용
  const auth: AuthObject = {
    userId: null, // 실제 구현에서는 Clerk에서 제공
    sessionId: null,
    getToken: async () => null,
    isPublicRoute: false,
  };

  return handleAfterAuth(auth, req);
};

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
