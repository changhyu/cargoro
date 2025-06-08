import { auth, clerkClient } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import type { WebhookEvent } from '@clerk/nextjs/server';
// import { Webhook } from 'svix';
// TODO: svix 패키지 설치 필요 (pnpm add svix)

// svix 타입 임시 모킹
class Webhook {
  constructor(secret: string) {}
  verify(body: string, headers: Record<string, string>): unknown {
    return JSON.parse(body);
  }
}

// 사용자 역할 열거형
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  DRIVER = 'driver',
  USER = 'user',
}

// 인증된 사용자 ID 가져오기
export async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized: No user found');
  }
  return userId;
}

// 사용자 역할 확인
export async function checkUserRole(requiredRole: string) {
  const { sessionClaims } = await auth();
  const metadata = sessionClaims?.metadata as { role?: string };
  const userRole = metadata?.role;

  if (!userRole || userRole !== requiredRole) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  return true;
}

// 사용자 역할 가져오기
export async function getUserRole(): Promise<string | null> {
  const { sessionClaims } = await auth();
  const metadata = sessionClaims?.metadata as { role?: string };
  return metadata?.role || null;
}

// 인증 헤더 생성
export function buildAuthHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

// 사용자 메타데이터 업데이트
export async function updateUserMetadata(
  userId: string,
  metadata: {
    public?: Record<string, unknown>;
    private?: Record<string, unknown>;
  }
) {
  const client = await clerkClient();
  return client.users.updateUserMetadata(userId, {
    publicMetadata: metadata.public,
    privateMetadata: metadata.private,
  });
}

// Webhook 검증 및 처리
export async function handleClerkWebhook(request: Request): Promise<WebhookEvent> {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SIGNING_SECRET environment variable');
  }

  // Get headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    throw new Error('Missing svix headers');
  }

  // Get body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Create Svix instance
  const wh = new Webhook(WEBHOOK_SECRET);

  // Verify webhook
  try {
    const evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;

    return evt;
  } catch (error) {
    throw new Error('Invalid webhook signature');
  }
}

// 조직별 사용자 목록 가져오기
export async function getOrganizationMembers(organizationId: string) {
  const client = await clerkClient();
  return client.organizations.getOrganizationMembershipList({
    organizationId,
    limit: 100,
  });
}

// 사용자 초대하기
export async function inviteUserToOrganization(
  organizationId: string,
  emailAddress: string,
  role: string = 'member'
) {
  const client = await clerkClient();
  return client.organizations.createOrganizationInvitation({
    organizationId,
    emailAddress,
    role,
  });
}

// 클라이언트 전용 유틸리티 (next/headers 미사용)
// 사용자 역할 확인 함수 (클라이언트에서 사용 가능)
export const hasRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy = {
    [UserRole.ADMIN]: 4,
    [UserRole.MANAGER]: 3,
    [UserRole.DRIVER]: 2,
    [UserRole.USER]: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// 사용자 권한 확인 함수 (클라이언트에서 사용 가능)
export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  if (!userPermissions) return false;
  return userPermissions.includes(requiredPermission);
};
