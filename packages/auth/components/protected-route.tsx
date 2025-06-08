'use client';

import { ReactNode, useEffect } from 'react';

import { UserRole } from '@cargoro/types';
import { useRouter } from 'next/navigation';

import { useAuth } from '../hooks/use-auth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole | UserRole[];
  requiredPermissions?: string | string[];
  fallbackUrl?: string;
  loadingComponent?: ReactNode;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requiredPermissions,
  fallbackUrl = '/login',
  loadingComponent,
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, hasRole, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 로딩 중이 아니고 인증되지 않은 경우
    if (!isLoading && !isAuthenticated) {
      router.push(fallbackUrl);
      return;
    }

    // 역할 제한이 있고, 해당 역할을 가지고 있지 않은 경우
    if (!isLoading && allowedRoles && !hasRole(allowedRoles)) {
      router.push('/unauthorized');
      return;
    }

    // 권한 제한이 있고, 해당 권한을 가지고 있지 않은 경우
    if (!isLoading && requiredPermissions && !hasPermission(requiredPermissions)) {
      router.push('/unauthorized');
      return;
    }
  }, [
    isLoading,
    isAuthenticated,
    allowedRoles,
    requiredPermissions,
    hasRole,
    hasPermission,
    router,
    fallbackUrl,
  ]);

  // 로딩 중인 경우
  if (isLoading) {
    return (
      <>
        {loadingComponent || (
          <div className="flex min-h-screen items-center justify-center">
            <div className="loader">로딩 중...</div>
          </div>
        )}
      </>
    );
  }

  // 인증되지 않았거나 역할/권한이 없는 경우 (리디렉션 전까지 빈 페이지 표시)
  if (
    !isAuthenticated ||
    (allowedRoles && !hasRole(allowedRoles)) ||
    (requiredPermissions && !hasPermission(requiredPermissions))
  ) {
    return null;
  }

  // 인증되고 권한이 있는 경우 자식 컴포넌트 표시
  return <>{children}</>;
}
