/**
 * API 서비스 모듈
 * 정비소 앱에서 사용하는 API 클라이언트를 관리합니다.
 */

import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// 기본 API 설정
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://api.cargoro.com';

// 요청 인터셉터 함수
const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  // 브라우저 환경에서만 실행
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
};

// 응답 인터셉터 함수
const responseInterceptor = (response: AxiosResponse) => {
  return response;
};

// API 에러 타입 정의
interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
  message: string;
  isAxiosError?: boolean;
}

const responseErrorInterceptor = (error: ApiError) => {
  // 인증 오류 처리 (401)
  if (error.response && error.response.status === 401) {
    // 브라우저 환경에서만 실행
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/sign-in';
    }
  }
  return Promise.reject(error);
};

// 공통 Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인터셉터 추가
axiosInstance.interceptors.request.use(requestInterceptor);
axiosInstance.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// 각 API 서비스 클라이언트 생성
export const repairApi = axios.create({
  baseURL: `${baseURL}/repair`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const partsApi = axios.create({
  baseURL: `${baseURL}/parts`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const vehicleApi = axios.create({
  baseURL: `${baseURL}/vehicle`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const appointmentApi = axios.create({
  baseURL: `${baseURL}/appointment`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const userApi = axios.create({
  baseURL: `${baseURL}/user`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 각 API 클라이언트에 인터셉터 추가
[repairApi, partsApi, vehicleApi, appointmentApi, userApi].forEach(api => {
  api.interceptors.request.use(requestInterceptor);
  api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);
});

export default axiosInstance;

// API 클라이언트 구현 확인
