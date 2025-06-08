'use client';

import { ReactNode, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { checkUserPermission } from '../../utils/auth-utils';
import { useUserStore, Permission } from '../../state/user-store';

interface RequirePermissionProps {
  permissionId: string;
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export default function RequirePermission({
  permissionId,
  children,
  fallback,
  redirectTo = '/dashboard',
}: RequirePermissionProps) {
  const router = useRouter();
  const { currentUser } = useUserStore();

  // 사용자 권한 확인
  const userPermissions = currentUser?.permissions?.map((p: Permission) => p.id) || [];
  const hasAccess = checkUserPermission(userPermissions, permissionId);

  useEffect(() => {
    // 권한이 없고 리디렉션 경로가 지정된 경우
    if (!hasAccess && redirectTo) {
      router.push(redirectTo);
    }
  }, [hasAccess, redirectTo, router]);

  // 권한이 없는 경우
  if (!hasAccess) {
    // 폴백 컴포넌트가 있는 경우 표시
    if (fallback) {
      return <>{fallback}</>;
    }

    // 리디렉션 중이거나 폴백이 없는 경우 접근 거부 메시지 표시
    return (
      <div className="p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">접근 권한이 없습니다</h2>
        <p className="text-gray-500">
          이 페이지를 볼 수 있는 권한이 없습니다. 관리자에게 문의하세요.
        </p>
      </div>
    );
  }

  // 권한이 있는 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
}
