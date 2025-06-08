// 서버 사이드 Clerk exports
export { auth, currentUser, clerkClient, getAuth } from '@clerk/nextjs/server';

// 서버 유틸리티 - 별칭 추가
export { auth as serverAuth } from '@clerk/nextjs/server';

// 타입만 import
import type { User as ClerkUser } from '@clerk/nextjs/server';

// auth와 currentUser를 직접 import하여 사용
import { auth as clerkAuth, currentUser as clerkCurrentUser } from '@clerk/nextjs/server';

// requireAuth 함수 추가
export async function requireAuth(): Promise<string> {
  const { userId } = await clerkAuth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

// requireAdmin 함수 추가
export async function requireAdmin(): Promise<ClerkUser> {
  const user = await clerkCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  // 실제로는 user의 role을 확인해야 함
  // const isAdmin = user.publicMetadata?.role === 'admin';
  // if (!isAdmin) {
  //   throw new Error('Forbidden');
  // }
  return user;
}

// 미들웨어 관련 exports
export {
  createClerkMiddleware,
  clerkMiddleware,
  defaultConfig as clerkMiddlewareConfig,
  type ClerkMiddlewareConfig,
} from './middleware/clerk-middleware';

// 서버 유틸리티
export {
  getAuthenticatedUser,
  checkUserRole,
  buildAuthHeader,
  handleClerkWebhook,
} from './utils/auth-utils';

// Clerk 서버 타입 exports
export type { User, Session, Organization } from '@clerk/nextjs/server';
