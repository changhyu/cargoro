/**
 * 인증 보호 컴포넌트
 *
 * 특정 라우트를 인증된 사용자 또는 특정 역할을 가진 사용자만 접근 가능하도록 보호합니다.
 */

import React from 'react';
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs';
import { hasRole, hasPermission, type ClerkUserRole } from '../lib/clerk';

interface RequireAuthProps {
  children: React.ReactNode;
  roles?: ClerkUserRole[];
  permissions?: string[];
  fallback?: React.ReactNode;
}

/**
 * 인증 보호 컴포넌트
 *
 * @param children - 보호할 컴포넌트/컨텐츠
 * @param roles - 접근을 허용할 역할 목록 (선택 사항)
 * @param permissions - 필요한 권한 목록 (선택 사항)
 * @param fallback - 인증 실패 시 표시할 대체 컴포넌트 (기본값: 로그인 페이지로 리다이렉트)
 */
export function RequireAuth({
  children,
  roles,
  permissions,
  fallback = <RedirectToSignIn />,
}: RequireAuthProps) {
  const { user } = useUser();

  // 로그인한 사용자가 있는지 확인
  const isAuthenticated = !!user;

  // 역할 확인 (역할이 지정된 경우)
  const hasRequiredRole = !roles || (user && hasRole(user, roles));

  // 권한 확인 (권한이 지정된 경우)
  const hasRequiredPermissions =
    !permissions || (user && permissions.every(permission => hasPermission(user, permission)));

  // 인증, 역할, 권한 모두 통과해야 함
  const isAuthorized = isAuthenticated && hasRequiredRole && hasRequiredPermissions;

  return (
    <>
      <SignedIn>
        {isAuthorized ? (
          children
        ) : (
          // 로그인은 되어 있지만 권한이 없는 경우
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="mb-2 text-xl font-bold text-red-700">접근 권한 없음</h2>
            <p className="text-red-600">이 페이지에 접근하기 위한 권한이 없습니다.</p>
          </div>
        )}
      </SignedIn>
      <SignedOut>{fallback}</SignedOut>
    </>
  );
}

/**
 * 인증되지 않은 사용자만 접근 가능한 컴포넌트
 */
interface RequireUnAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireUnAuth({
  children,
  fallback = <div>이미 로그인 되었습니다.</div>,
}: RequireUnAuthProps) {
  return (
    <>
      <SignedIn>{fallback}</SignedIn>
      <SignedOut>{children}</SignedOut>
    </>
  );
}

export default RequireAuth;
