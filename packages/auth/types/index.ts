// Clerk 사용자 타입
export interface ClerkUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  username?: string;
  hasImage: boolean;
  primaryEmailAddressId?: string;
  emailAddresses: Array<{
    id: string;
    emailAddress: string;
    verification: {
      status: string;
    };
  }>;
  publicMetadata: Record<string, any>;
  privateMetadata: Record<string, any>;
  unsafeMetadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// 인증 상태 타입
export interface AuthState {
  user: ClerkUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  sessionId?: string;
  orgId?: string;
  orgRole?: string;
  orgSlug?: string;
}

// 앱별 인증 설정
export interface AppSpecificAuthConfig {
  appName: string;
  redirectUrls?: {
    signIn?: string;
    signUp?: string;
    afterSignIn?: string;
    afterSignUp?: string;
  };
  allowedRoles?: string[];
  features?: {
    organizations?: boolean;
    passwordless?: boolean;
    socialProviders?: string[];
  };
}

// 조직 타입
export interface ClerkOrganization {
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string;
  hasImage: boolean;
  createdAt: Date;
  updatedAt: Date;
  publicMetadata?: Record<string, any>;
  privateMetadata?: Record<string, any>;
  maxAllowedMemberships: number;
  adminDeleteEnabled: boolean;
  members?: ClerkOrganizationMember[];
}

// 조직 멤버 타입
export interface ClerkOrganizationMember {
  id: string;
  orgId: string;
  userId: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  publicMetadata?: Record<string, any>;
  privateMetadata?: Record<string, any>;
}

// 세션 타입
export interface ClerkSession {
  id: string;
  userId: string;
  status: 'active' | 'revoked' | 'ended' | 'expired' | 'removed' | 'replaced' | 'abandoned';
  lastActiveAt: Date;
  expireAt: Date;
  abandonAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Webhook 이벤트 타입
export interface ClerkWebhookEvent {
  id: string;
  type: string;
  object: 'event';
  data: Record<string, any>;
  createdAt: number;
}

// 에러 타입
export interface ClerkError {
  code: string;
  message: string;
  longMessage?: string;
  meta?: Record<string, any>;
}
