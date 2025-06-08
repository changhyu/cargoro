'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { checkUserPermissions } from '../utils/auth-utils';

interface RequirePermissionProps {
  permissions: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequirePermission({
  permissions,
  children,
  fallback = null,
}: RequirePermissionProps) {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkPermissions() {
      if (!isLoaded || !userId || !user) {
        setHasAccess(false);
        return;
      }

      try {
        // 사용자 메타데이터에서 권한 가져오기
        const userPermissions = (user.publicMetadata?.permissions as string[]) || [];
        // 권한 확인
        const result = checkUserPermissions(userPermissions, permissions);
        setHasAccess(result);
      } catch (error) {
        // 권한 확인 오류는 프로덕션에서 별도 로깅 시스템으로 처리
        setHasAccess(false);
      }
    }

    checkPermissions();
  }, [isLoaded, userId, user, permissions]);

  if (!isLoaded || hasAccess === null) {
    return <div>로딩 중...</div>;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default RequirePermission;
