import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API 기본 URL 설정
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * 기본 API 클라이언트 설정
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * 요청 인터셉터 설정
 * - 인증 토큰 추가
 * - 요청 로깅
 */
api.interceptors.request.use(
  async config => {
    // AsyncStorage에서 토큰 가져오기
    const token = await AsyncStorage.getItem('auth_token');

    // 토큰이 있으면 요청 헤더에 추가
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 개발 환경에서 요청 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log(`API 요청: ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터 설정
 * - 응답 로깅
 * - 에러 핸들링
 * - 토큰 만료 처리
 */
api.interceptors.response.use(
  response => {
    // 개발 환경에서 응답 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log(`API 응답: ${response.status} ${response.config.url}`);
    }

    return response;
  },
  async error => {
    // 에러 응답이 존재하는 경우
    if (error.response) {
      // 토큰 만료 (401) 처리
      if (error.response.status === 401) {
        // AsyncStorage에서 토큰 제거
        await AsyncStorage.removeItem('auth_token');

        // 로그인 페이지로 리다이렉트
        // TODO: 인증 상태 관리자에게 로그아웃 이벤트 발행
      }

      // 개발 환경에서 에러 로깅
      if (process.env.NODE_ENV === 'development') {
        console.error('API 에러 응답:', {
          status: error.response.status,
          url: error.config.url,
          data: error.response.data,
        });
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      console.error('API 응답 없음:', error.request);
    } else {
      // 요청 설정 도중 에러 발생
      console.error('API 요청 에러:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * API 유틸 함수 - 캐시된 GET 요청
 * @param url API 엔드포인트
 * @param expiry 캐시 만료 시간 (밀리초)
 */
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const cache: Record<string, CacheEntry> = {};

export const cachedGet = async <T = unknown>(
  url: string,
  expiry: number = 5 * 60 * 1000
): Promise<T> => {
  const now = Date.now();

  // 캐시에 유효한 데이터가 있는 경우
  if (cache[url] && now - cache[url].timestamp < expiry) {
    return cache[url].data as T;
  }

  // 캐시가 없거나 만료된 경우, 새로 요청
  const response = await api.get<T>(url);

  // 새 응답을 캐시에 저장
  cache[url] = {
    data: response.data,
    timestamp: now,
  };

  return response.data;
};
