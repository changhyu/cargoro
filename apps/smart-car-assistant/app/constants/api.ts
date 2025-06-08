/**
 * API 관련 상수 정의
 */

/**
 * API 기본 URL
 * 환경별로 다른 URL 사용
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.dev.cargoro.com';

/**
 * API 타임아웃 (밀리초)
 */
export const API_TIMEOUT = 10000;

/**
 * API 버전
 */
export const API_VERSION = 'v1';

/**
 * API 엔드포인트
 */
export const API_ENDPOINTS = {
  // 인증 관련
  AUTH: {
    SIGN_IN: '/auth/sign-in',
    SIGN_OUT: '/auth/sign-out',
    REFRESH_TOKEN: '/auth/refresh-token',
    VERIFY: '/auth/verify',
  },

  // 사용자 관련
  USER: {
    PROFILE: '/user/profile',
    PREFERENCES: '/user/preferences',
    NOTIFICATIONS: '/user/notifications',
  },

  // 차량 관련
  VEHICLE: {
    LIST: '/vehicles',
    DETAILS: (id: string) => `/vehicles/${id}`,
    REGISTER: '/vehicles/register',
  },

  // 진단 관련
  DIAGNOSTICS: {
    SCAN: (vehicleId: string) => `/vehicle/${vehicleId}/diagnostics/scan`,
    HISTORY: (vehicleId: string) => `/vehicle/${vehicleId}/diagnostics/history`,
    DETAIL: (id: string) => `/diagnostics/${id}`,
    SAVE: (vehicleId: string) => `/vehicle/${vehicleId}/diagnostics/save`,
  },

  // 예약 관련
  RESERVATION: {
    LIST: '/reservations',
    CREATE: '/reservations',
    DETAIL: (id: string) => `/reservations/${id}`,
    CANCEL: (id: string) => `/reservations/${id}/cancel`,
  },

  // 내비게이션 관련
  NAVIGATION: {
    SEARCH: '/navigation/search',
    ROUTE: '/navigation/route',
    NEARBY: '/navigation/nearby',
  },
};

/**
 * API 요청 헤더
 */
export const API_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'X-Client-Version': '1.0.0',
  'X-Client-Platform': 'mobile',
};
