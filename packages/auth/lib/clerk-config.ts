// import { ClerkOptions } from '@clerk/types';

/**
 * Clerk 인증 개발 환경 설정
 * 모든 웹앱에서 공통으로 사용하는 설정
 */

// Clerk 기본 설정
export const clerkConfig = {
  // 개발 환경에서 사용할 테스트 계정 자동 설정
  allowedRedirectOrigins: [
    // 모든 웹앱의 로컬 개발 URL 허용
    /^https?:\/\/localhost(:\d+)?$/,
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  ],
  // 개발 환경에서 세션 토큰 만료 시간 연장 (12시간)
  sessionOptions: {
    // 개발 환경에서는 세션 만료 시간을 늘려서 개발 편의성 향상
    tokenExpirationInSeconds: 12 * 60 * 60, // 12시간
  },
};

/**
 * 개발 환경 로깅 설정
 * 개발 환경에서 인증 디버깅을 위한 로깅 설정
 */
export const enableClerkDevLogging = (enabled = true) => {
  if (enabled && process.env.NODE_ENV === 'development') {
    // 개발 환경에서만 로깅 활성화
    if (typeof window !== 'undefined') {
      // @ts-expect-error - Clerk 디버그 모드 활성화
      window.__clerk_debug = true;
    }
  }
};

/**
 * 개발 환경에서 Clerk 인증 설정을 구성하는 함수
 */
export const configureClerkForDevelopment = () => {
  // 개발 환경에서만 실행
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // 로깅 활성화
  enableClerkDevLogging();

  // 개발용 쿠키 설정 (secure 옵션 비활성화)
  if (typeof window !== 'undefined') {
    // 개발 환경에서는 HTTPS가 아닌 경우에도 쿠키 사용 가능하도록 설정
    document.cookie = 'clerk_development=true; path=/;';
  }

  // eslint-disable-next-line no-console
  console.log('🔐 Clerk 개발 환경 설정이 적용되었습니다.');
};

/**
 * 개발 환경에서 사용할 테스트 계정 목록
 * 개발 및 테스트용 계정 정보
 */
export const devTestAccounts = {
  admin: {
    email: 'admin@cargoro-dev.com',
    password: 'test1234',
  },
  workshopManager: {
    email: 'workshop@cargoro-dev.com',
    password: 'test1234',
  },
  fleetManager: {
    email: 'fleet@cargoro-dev.com',
    password: 'test1234',
  },
  partsManager: {
    email: 'parts@cargoro-dev.com',
    password: 'test1234',
  },
};
