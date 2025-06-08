import { ReactNode } from 'react';

import { redirect } from 'next/navigation';

import { checkPermission, checkAllPermissions } from '../../utils/auth';

interface WithPermissionProps {
  permissionId?: string;
  permissionIds?: string[];
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export default async function withPermission({
  permissionId,
  permissionIds,
  children,
  fallback,
  redirectTo = '/dashboard',
}: WithPermissionProps) {
  // 권한 확인
  let hasAccess = false;

  try {
    if (permissionId) {
      hasAccess = await checkPermission(permissionId);
    } else if (permissionIds && permissionIds.length > 0) {
      hasAccess = await checkAllPermissions(permissionIds);
    } else {
      // 권한 검사가 필요없는 경우
      hasAccess = true;
    }
  } catch {
    hasAccess = false;
  }

  // 권한이 없는 경우
  if (!hasAccess) {
    if (redirectTo) {
      redirect(redirectTo);
    }

    if (fallback) {
      return <>{fallback}</>;
    }

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
