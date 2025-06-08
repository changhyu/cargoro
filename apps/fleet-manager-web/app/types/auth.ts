/**
 * 인증 관련 타입 정의
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'MANAGER' | 'ADMIN';
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

export interface LoginRequest {
  username: string; // OAuth2 표준에서는 username 사용
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface UserCreate {
  email: string;
  name: string;
  password: string;
  role?: 'USER' | 'MANAGER' | 'ADMIN';
  is_active?: boolean;
  is_superuser?: boolean;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  is_active?: boolean;
  role?: 'USER' | 'MANAGER' | 'ADMIN';
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
