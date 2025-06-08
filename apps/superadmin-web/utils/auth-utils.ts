/**
 * 슈퍼 관리자 앱을 위한 인증 유틸리티 함수
 */

// 사용자 역할 타입 정의
export type UserRole = 'superadmin' | 'admin' | 'guest';

// 쿠키 이름 상수
const AUTH_TOKEN_KEY = 'auth-token';
const USER_ROLE_KEY = 'user-role';
const USER_DATA_KEY = 'user-data';

// next/headers의 cookies 함수 타입 정의
type CookiesFunction = () => {
  get: (name: string) => { value: string } | undefined;
};

// next/headers를 조건부로 import하여 Pages Router 호환성 확보
let cookies: CookiesFunction | null = null;

try {
  if (typeof window === 'undefined') {
    // 서버 환경에서만 next/headers를 import 시도
    cookies = eval('require')('next/headers').cookies;
  }
} catch {
  // Pages Router 등에서 next/headers를 지원하지 않는 경우
  // console.warn(
  //   'next/headers is not available in this environment. Using fallback for Pages Router compatibility.'
  // );
  cookies = null;
}

/**
 * 인증 상태 확인
 * @returns {Promise<boolean>} 인증 여부
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    if (!cookies) {
      // 클라이언트 사이드에서는 document.cookie를 사용
      if (typeof document !== 'undefined') {
        return document.cookie.includes(AUTH_TOKEN_KEY);
      }
      return false;
    }

    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_TOKEN_KEY);
    return token !== undefined;
  } catch {
    // console.error('인증 상태 확인 실패');
    return false;
  }
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
      const mockRole: UserRole = 'superadmin';
      const mockUserData = {
        id: '999',
        name: '슈퍼 관리자',
        email: email,
        role: mockRole,
      };

      // 쿠키에 저장
      document.cookie = `${AUTH_TOKEN_KEY}=${mockToken}; path=/; max-age=86400`;
      document.cookie = `${USER_ROLE_KEY}=${mockRole}; path=/; max-age=86400`;
      document.cookie = `${USER_DATA_KEY}=${JSON.stringify(mockUserData)}; path=/; max-age=86400`;

      return true;
    }
    return false;
  } catch {
    // console.error('로그인 실패:', error);
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
  } catch {
    // console.error('인증 상태 초기화 실패:', error);
  }
};

/**
 * 사용자 역할 가져오기
 * @returns {Promise<UserRole|null>} 사용자 역할
 */
export const getUserRole = async (): Promise<UserRole | null> => {
  try {
    if (!cookies) {
      // 클라이언트 사이드에서는 document.cookie를 사용
      if (typeof document !== 'undefined') {
        const cookieValue = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${USER_ROLE_KEY}=`))
          ?.split('=')[1];
        return (cookieValue as UserRole) || null;
      }
      return null;
    }

    const cookieStore = cookies();
    const roleCookie = cookieStore.get(USER_ROLE_KEY);
    return (roleCookie?.value as UserRole) || null;
  } catch {
    // console.error('사용자 역할 가져오기 실패');
    return null;
  }
};

/**
 * 사용자 데이터 가져오기
 * @returns {unknown|null} 사용자 데이터
 */
export const getUserData = (): unknown | null => {
  try {
    if (!cookies) {
      // 클라이언트 사이드에서는 document.cookie를 사용
      if (typeof document !== 'undefined') {
        const cookieValue = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${USER_DATA_KEY}=`))
          ?.split('=')[1];
        return cookieValue ? JSON.parse(decodeURIComponent(cookieValue)) : null;
      }
      return null;
    }

    const cookieStore = cookies();
    const userDataCookie = cookieStore.get(USER_DATA_KEY);
    return userDataCookie?.value ? JSON.parse(userDataCookie.value) : null;
  } catch {
    // console.error('사용자 데이터 가져오기 실패');
    return null;
  }
};

/**
 * 인증 토큰 가져오기
 * @returns {string|null} 인증 토큰
 */
export const getAuthToken = (): string | null => {
  try {
    if (!cookies) {
      // 클라이언트 사이드에서는 document.cookie를 사용
      if (typeof document !== 'undefined') {
        const cookieValue = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${AUTH_TOKEN_KEY}=`))
          ?.split('=')[1];
        return cookieValue || null;
      }
      return null;
    }

    const cookieStore = cookies();
    const tokenCookie = cookieStore.get(AUTH_TOKEN_KEY);
    return tokenCookie?.value || null;
  } catch {
    // console.error('인증 토큰 가져오기 실패');
    return null;
  }
};

export default {
  login,
  logout,
  isAuthenticated,
  getUserRole,
  getUserData,
  getAuthToken,
  clearAuthState,
};
