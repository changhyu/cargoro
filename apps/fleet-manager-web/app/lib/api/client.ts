/**
 * API 클라이언트 설정
 */
import axios, { type AxiosInstance } from 'axios';

import { useAuthStore } from '@/app/state/auth-store';

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';

// Axios 인스턴스 생성
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 요청 인터셉터 - 토큰 추가
  instance.interceptors.request.use(
    config => {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터 - 에러 처리
  instance.interceptors.response.use(
    response => response,
    async error => {
      if (error.response?.status === 401) {
        // 토큰 만료 시 로그아웃
        useAuthStore.getState().logout();
        // 로그인 페이지로 리다이렉트
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const apiClient = createApiInstance();

// 외부에서 baseURL 접근을 위해 export
export const API_BASE_URL_EXPORT = API_BASE_URL;
