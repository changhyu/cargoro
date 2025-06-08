'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { useAuthStore } from '@/app/state/auth-store';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'USER' | 'MANAGER' | 'ADMIN';
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // 인증되지 않은 경우 로그인 페이지로
    if (!isAuthenticated && pathname !== '/login') {
      router.push('/login');
      return;
    }

    // 권한 확인
    if (requiredRole && user) {
      const roleHierarchy = {
        USER: 1,
        MANAGER: 2,
        ADMIN: 3,
      };

      const userRoleLevel = roleHierarchy[user.role] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

      if (userRoleLevel < requiredRoleLevel) {
        // 권한 부족
        router.push('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, user, requiredRole, router, pathname]);

  // 인증되지 않은 경우 렌더링하지 않음
  if (!isAuthenticated && pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}
