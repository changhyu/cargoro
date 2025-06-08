/**
 * 인증 관련 API 요청
 */
import {
  User,
  LoginRequest,
  Token,
  UserCreate,
  UserUpdate,
  ChangePasswordRequest,
} from '@/app/types/auth';

import { apiClient } from './client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class AuthApi {
  /**
   * 로그인
   */
  async login(credentials: LoginRequest): Promise<Token> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '로그인 실패');
    }

    return response.json();
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(refreshToken: string): Promise<Token> {
    const response = await apiClient.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  }

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('사용자 정보 조회 실패');
    }

    return response.json();
  }

  /**
   * 사용자 정보 수정
   */
  async updateCurrentUser(data: UserUpdate, token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('사용자 정보 수정 실패');
    }

    return response.json();
  }

  /**
   * 비밀번호 변경
   */
  async changePassword(data: ChangePasswordRequest, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '비밀번호 변경 실패');
    }

    return response.json();
  }

  /**
   * 사용자 생성 (관리자)
   */
  async createUser(data: UserCreate, token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '사용자 생성 실패');
    }

    return response.json();
  }

  /**
   * 사용자 정보 수정 (관리자)
   */
  async updateUser(userId: string, data: UserUpdate, token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('사용자 정보 수정 실패');
    }

    return response.json();
  }

  /**
   * 사용자 비활성화 (관리자)
   */
  async deactivateUser(userId: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('사용자 비활성화 실패');
    }

    return response.json();
  }

  /**
   * 사용자 재활성화 (관리자)
   */
  async reactivateUser(userId: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/reactivate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('사용자 재활성화 실패');
    }

    return response.json();
  }
}

export const authApi = new AuthApi();
