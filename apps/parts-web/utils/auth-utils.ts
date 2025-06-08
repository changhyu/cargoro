/**
 * 부품 관리 앱을 위한 인증 유틸리티 함수
 */

// 사용자 역할 타입 정의
export type UserRole = 'parts_manager' | 'warehouse' | 'admin' | 'guest';

// 사용자 데이터 타입 정의
export interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// 쿠키 이름 상수
const AUTH_TOKEN_KEY = 'auth-token';
const USER_ROLE_KEY = 'user-role';
const USER_DATA_KEY = 'user-data';

// 필요한 모듈 미리 임포트
import { cookies } from 'next/headers';

/**
 * 안전하게 next/headers에서 cookies를 가져오는 함수
 * @returns cookies 함수 또는 null
 */
const getSafeCookies = () => {
  try {
    // App Router 환경에서만 next/headers가 작동
    if (typeof window === 'undefined') {
      return cookies();
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * 클라이언트 사이드에서 쿠키 값을 가져오는 함수
 * @param {string} name 쿠키 이름
 * @returns {string | undefined} 쿠키 값
 */
const getClientCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue;
  }
  return undefined;
};

/**
 * 서버/클라이언트 모두에서 안전하게 쿠키 값을 가져오는 함수
 * @param {string} name 쿠키 이름
 * @returns {string | undefined} 쿠키 값
 */
const getCookieValue = (name: string): string | undefined => {
  const cookieStore = getSafeCookies();

  if (cookieStore) {
    // 서버 사이드 (App Router)
    try {
      const cookie = cookieStore.get(name);
      return cookie?.value;
    } catch {
      return undefined;
    }
  } else {
    // 클라이언트 사이드 또는 Pages Router
    return getClientCookie(name);
  }
};

/**
 * 인증 상태 확인
 * @returns {boolean} 인증 여부
 */
export const isAuthenticated = (): boolean => {
  const token = getCookieValue(AUTH_TOKEN_KEY);
  return token !== undefined;
};

/**
 * 사용자 로그인
 * @param {string} email 이메일
 * @param {string} password 비밀번호
 * @returns {Promise<boolean>} 로그인 성공 여부
 */
export const login = async (email: string, password: string): Promise<boolean> => {
  try {
    // 로그인 로직은 실제 구현 시 API 호출로 대체
    if (email && password) {
      const mockToken = 'mock-auth-token-' + Date.now();
      const mockRole: UserRole = 'parts_manager';
      const mockUserData: UserData = {
        id: '555',
        name: '부품 관리자',
        email: email,
        role: mockRole,
      };

      // 쿠키에 저장 (클라이언트 사이드에서만 가능)
      if (typeof document !== 'undefined') {
        document.cookie = `${AUTH_TOKEN_KEY}=${mockToken}; path=/; max-age=86400`;
        document.cookie = `${USER_ROLE_KEY}=${mockRole}; path=/; max-age=86400`;
        document.cookie = `${USER_DATA_KEY}=${JSON.stringify(mockUserData)}; path=/; max-age=86400`;
      }

      return true;
    }
    return false;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('로그인 실패:', error);
    return false;
  }
};

/**
 * 사용자 로그아웃
 * @returns {void}
 */
export const logout = (): void => {
  clearAuthState();
};

/**
 * 인증 상태 초기화
 * @returns {void}
 */
export const clearAuthState = (): void => {
  try {
    // 클라이언트 사이드에서는 document.cookie를 사용
    if (typeof document !== 'undefined') {
      document.cookie = `${AUTH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${USER_ROLE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${USER_DATA_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('인증 상태 초기화 실패:', error);
  }
};

/**
 * 현재 사용자 역할 가져오기
 * @returns {UserRole} 사용자 역할
 */
export const getUserRole = (): UserRole => {
  const role = getCookieValue(USER_ROLE_KEY) as UserRole;
  return role || 'guest';
};

/**
 * 현재 사용자 데이터 가져오기
 * @returns {UserData | null} 사용자 데이터
 */
export const getUserData = (): UserData | null => {
  try {
    const userData = getCookieValue(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

/**
 * 특정 역할 권한 확인
 * @param {UserRole[]} allowedRoles 허용된 역할 목록
 * @returns {boolean} 권한 여부
 */
export const hasRole = (allowedRoles: UserRole[]): boolean => {
  const currentRole = getUserRole();
  return allowedRoles.includes(currentRole);
};

/**
 * 관리자 권한 확인
 * @returns {boolean} 관리자 여부
 */
export const isAdmin = (): boolean => {
  return hasRole(['admin']);
};

/**
 * 부품 관리자 권한 확인
 * @returns {boolean} 부품 관리자 여부
 */
export const isPartsManager = (): boolean => {
  return hasRole(['parts_manager', 'admin']);
};

/**
 * 창고 관리자 권한 확인
 * @returns {boolean} 창고 관리자 여부
 */
export const isWarehouse = (): boolean => {
  return hasRole(['warehouse', 'admin']);
};

export default {
  login,
  logout,
  isAuthenticated,
  getUserRole,
  getUserData,
  clearAuthState,
  isAdmin,
  isPartsManager,
  isWarehouse,
};
