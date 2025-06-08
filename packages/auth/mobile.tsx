// Mobile (Expo) 앱용 Clerk exports
export {
  ClerkProvider,
  useAuth,
  useUser,
  useClerk,
  useSession,
  useSignIn,
  useSignUp,
  SignedIn,
  SignedOut,
} from '@clerk/clerk-expo';

// 모바일 전용 컴포넌트와 훅
export { useClerkTokenCache } from './hooks/useClerkTokenCache';
export { MobileAuthGuard } from './components/MobileAuthGuard';

// 타입 exports
export type { ClerkProviderProps } from '@clerk/clerk-expo';

// Clerk types
// 타입 exports
export type { UserResource as User, SessionResource as Session } from '@clerk/types';
