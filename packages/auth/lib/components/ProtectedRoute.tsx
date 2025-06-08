'use client';

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ClerkUserRole } from '../clerk';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: ClerkUserRole[];
  fallback?: string;
}

export default function ProtectedRoute({
  children,
  roles = [],
  fallback = '/sign-in',
}: ProtectedRouteProps) {
  const { isLoaded, isSignedIn, checkRole } = useAuth();

  if (!isLoaded) {
    return <div>로딩 중...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to={fallback} replace />;
  }

  if (roles.length > 0 && !checkRole(roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
