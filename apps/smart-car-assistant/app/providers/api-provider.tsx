import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import React, { createContext, ReactNode, useContext } from 'react';

// API 클라이언트 타입 정의
interface ApiClientType {
  get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
  delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  setAuthToken: (token: string) => void;
}

// API 클라이언트 기본값
const ApiContext = createContext<ApiClientType | null>(null);

// 커스텀 훅 생성
export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

interface ApiProviderProps {
  children: ReactNode;
  baseURL?: string;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({
  children,
  baseURL = 'https://api.cargoro.com',
}) => {
  // Axios 인스턴스 생성
  const axiosInstance: AxiosInstance = axios.create({
    baseURL,
    timeout: 10000, // 10초 타임아웃
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // 인증 토큰 설정 함수
  const setAuthToken = (token: string) => {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // 응답 인터셉터 설정
  axiosInstance.interceptors.response.use(
    response => response.data,
    error => {
      // 오류 처리 로직
      console.error('API 요청 오류:', error);
      return Promise.reject(error);
    }
  );

  // API 클라이언트 객체 생성
  const apiClient: ApiClientType = {
    get: function <T>(url: string, config?: AxiosRequestConfig): Promise<T> {
      return axiosInstance.get(url, config) as Promise<T>;
    },
    post: function <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
      return axiosInstance.post(url, data, config) as Promise<T>;
    },
    put: function <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
      return axiosInstance.put(url, data, config) as Promise<T>;
    },
    delete: function <T>(url: string, config?: AxiosRequestConfig): Promise<T> {
      return axiosInstance.delete(url, config) as Promise<T>;
    },
    setAuthToken,
  };

  return <ApiContext.Provider value={apiClient}>{children}</ApiContext.Provider>;
};
