import { hasRole, hasPermission, type ClerkUserRole } from '../clerk';
import type { UserResource } from '@clerk/types';

export function checkAuthStatus(user: UserResource | null | undefined) {
  return {
    isAuthenticated: !!user,
    isLoading: false,
    user,
  };
}

export function checkUserRole(
  user: UserResource | null | undefined,
  roles: ClerkUserRole[]
): boolean {
  return hasRole(user || null, roles);
}

export function checkUserPermission(
  user: UserResource | null | undefined,
  permission: string
): boolean {
  return hasPermission(user || null, permission);
}

export function getAuthHeaders(token: string | null): Record<string, string> {
  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() >= exp;
  } catch {
    return true;
  }
}
