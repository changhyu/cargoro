/**
 * 인증 모듈 - 진입점
 *
 * 모든 앱에서 사용할 수 있는 인증 관련 유틸리티를 제공합니다.
 * 이 파일은 모든 인증 관련 기능에 대한 중앙 진입점입니다.
 */

// 웹 관련 exports (중복 제거)
export {
  ClerkProvider as WebClerkProvider,
  SignIn,
  SignUp,
  UserButton,
  UserProfile,
  OrganizationProfile,
  OrganizationSwitcher,
  useClerk,
  useSession,
  useSignIn,
  useSignUp,
  useOrganizationList,
} from './web';

// 서버 관련 exports (중복 제거)
export { auth, currentUser, clerkClient, getAuth } from './server';

// 모바일 관련 exports
export * from './mobile';

// 컴포넌트 exports
export * from './components/RequireAuth';
export * from './components/SWRProvider';
export * from './components/MobileAuthGuard';
export { AuthProvider, useAuthContext } from './components/auth-provider';

// 훅 exports
export { useAuth } from './hooks/use-auth';

// 유틸리티 exports
export * from './utils';

// 미들웨어 exports
export { createClerkMiddleware } from './middleware';

// 타입 exports (UserRole 중복 제거)
export { AuthRole, type AuthUser, type AuthResult } from './types';
