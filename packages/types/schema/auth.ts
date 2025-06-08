export type AuthUserRole =
  | 'ADMIN'
  | 'WORKSHOP_OWNER'
  | 'WORKSHOP_STAFF'
  | 'CUSTOMER'
  | 'DRIVER'
  | 'FLEET_MANAGER'
  | 'PARTS_MANAGER'
  | 'SYSTEM_ADMIN';

// Clerk에서 사용하는 소문자 role 값들
export type ClerkUserRole =
  | 'admin'
  | 'super_admin'
  | 'workshop_manager'
  | 'workshop_owner'
  | 'workshop_staff'
  | 'customer'
  | 'delivery_driver'
  | 'driver'
  | 'fleet_manager'
  | 'parts_manager'
  | 'system_admin';

// UserProfile 타입 정의 추가
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  role: ClerkUserRole;
  organizationId?: string;
  organizationName?: string;
  permissions: string[];
}

import type { User } from './user';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: Error | null;
  login: (token: string) => void;
  logout: () => void;
}

export interface UseAuthResult {
  isLoading: boolean;
  isAuthenticated: boolean;
  isLoaded?: boolean; // Clerk 호환성을 위한 속성 추가
  isSignedIn?: boolean; // Clerk 호환성을 위한 속성 추가
  userId: string | null;
  user: User | null; // User 타입으로 변경하여 일관성 유지
  role: AuthUserRole;
  hasRole: (requiredRole: AuthUserRole | AuthUserRole[]) => boolean;
  isAdmin: boolean;
  getToken: () => Promise<string | null>;
  organizationId: string | null | undefined;
  organizationName: string | null | undefined;
  hasPermission: (permission: string | string[]) => boolean;
  permissions: string[];
  checkAuthState?: () => {
    isReady: boolean;
    isAuthenticated: boolean;
    currentRole: AuthUserRole;
    currentPermissions: string[];
    organizationStatus: boolean;
  };
}

export interface UseFirebaseAuthResult {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: AuthUserRole;
  hasRole: (requiredRole: AuthUserRole | AuthUserRole[]) => boolean;
  isAdmin: boolean;
  permissions: string[];
  hasPermission: (permission: string | string[]) => boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  roles?: string[];
  permissions?: string[];
  organization_id?: string;
}

// 권한 관련 타입들
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}
