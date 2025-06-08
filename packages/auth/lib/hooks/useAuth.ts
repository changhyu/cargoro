'use client';

import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import { extractUserProfile, hasRole, hasPermission, type ClerkUserRole } from '../clerk';

export function useAuth() {
  const { signOut } = useClerkAuth();
  const { user, isLoaded, isSignedIn } = useUser();

  const profile = user ? extractUserProfile(user) : null;

  const checkRole = (allowedRoles: ClerkUserRole | ClerkUserRole[]): boolean => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return hasRole(user || null, roles);
  };

  const checkPermission = (requiredPermission: string): boolean => {
    return hasPermission(user || null, requiredPermission);
  };

  const logout = async () => {
    await signOut();
  };

  return {
    user,
    profile,
    isLoaded,
    isSignedIn,
    checkRole,
    checkPermission,
    logout,
  };
}
