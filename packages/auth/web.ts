// 웹 앱용 Clerk exports
export {
  ClerkProvider,
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
  UserButton,
  UserProfile,
  OrganizationProfile,
  OrganizationSwitcher,
  useAuth,
  useUser,
  useClerk,
  useSession,
  useSignIn,
  useSignUp,
  useOrganization,
  useOrganizationList,
} from '@clerk/nextjs';

// 설정 관련 exports
export { authConfig, getAuthConfig, validateClerkEnv } from './config/auth-config';

// 커스텀 훅 exports
export { useSafeAuth } from './hooks/useSafeAuth';

// Clerk 컴포넌트 Props 타입 - UserButtonProps는 export되지 않음
// export type { UserButtonProps } from '@clerk/nextjs';
