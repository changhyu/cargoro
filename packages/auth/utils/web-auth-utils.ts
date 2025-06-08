/**
 * 웹 앱용 클라이언트 사이드 인증 관련 유틸리티 함수들
 * 브라우저 환경에서 쿠키를 사용하여 인증 상태를 관리합니다.
 */

// 사용자 역할 타입 정의
export type UserRole =
  | 'fleet_manager'
  | 'driver'
  | 'admin'
  | 'guest'
  | 'workshop_owner'
  | 'workshop_staff'
  | 'customer'
  | 'parts_manager';

// 쿠키 이름 상수
export const AUTH_TOKEN_KEY = 'auth-token';
export const USER_ROLE_KEY = 'user-role';
export const USER_DATA_KEY = 'user-data';

/**
 * 클라이언트에서 인증 상태 확인
 * @returns {boolean} 인증 여부
 */
export const isClientAuthenticated = (): boolean => {
  try {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      return cookies.some(cookie => cookie.trim().startsWith(`${AUTH_TOKEN_KEY}=`));
    }
    return false;
  } catch (error) {
    console.error('인증 상태 확인 실패:', error);
    return false;
  }
};

/**
 * 클라이언트에서 사용자 로그인 처리
 * @param {string} token 인증 토큰
 * @param {UserRole} role 사용자 역할
 * @param {Record<string, unknown>} userData 사용자 데이터
 * @returns {boolean} 로그인 성공 여부
 */
export const setClientAuth = (
  token: string,
  role: UserRole,
  userData: Record<string, unknown>
): boolean => {
  try {
    if (typeof document !== 'undefined') {
      // 쿠키에 저장 (보안을 위해 실제 구현 시 httpOnly, secure 옵션 추가 필요)
      document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=86400`;
      document.cookie = `${USER_ROLE_KEY}=${role}; path=/; max-age=86400`;
      document.cookie = `${USER_DATA_KEY}=${JSON.stringify(userData)}; path=/; max-age=86400`;
      return true;
    }
    return false;
  } catch (error) {
    console.error('인증 정보 설정 실패:', error);
    return false;
  }
};

/**
 * 클라이언트에서 사용자 로그아웃
 * @returns {void}
 */
export const clearClientAuth = (): void => {
  try {
    // 클라이언트 사이드에서는 document.cookie를 사용
    if (typeof document !== 'undefined') {
      document.cookie = `${AUTH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${USER_ROLE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${USER_DATA_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  } catch (error) {
    console.error('인증 상태 초기화 실패:', error);
  }
};

/**
 * 클라이언트에서 사용자 역할 가져오기
 * @returns {UserRole|null} 사용자 역할
 */
export const getClientUserRole = (): UserRole | null => {
  try {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const roleCookie = cookies.find(cookie => cookie.trim().startsWith(`${USER_ROLE_KEY}=`));

      if (roleCookie) {
        const roleValue = roleCookie.split('=')[1];
        return roleValue as UserRole;
      }
    }
    return null;
  } catch (error) {
    console.error('사용자 역할 가져오기 실패:', error);
    return null;
  }
};

/**
 * 클라이언트에서 사용자 데이터 가져오기
 * @returns {unknown|null} 사용자 데이터
 */
export const getClientUserData = (): unknown | null => {
  try {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const userDataCookie = cookies.find(cookie => cookie.trim().startsWith(`${USER_DATA_KEY}=`));

      if (userDataCookie) {
        const userDataValue = userDataCookie.split('=')[1];
        return JSON.parse(decodeURIComponent(userDataValue));
      }
    }
    return null;
  } catch (error) {
    console.error('사용자 데이터 가져오기 실패:', error);
    return null;
  }
};

/**
 * 클라이언트에서 인증 토큰 가져오기
 * @returns {string|null} 인증 토큰
 */
export const getClientAuthToken = (): string | null => {
  try {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith(`${AUTH_TOKEN_KEY}=`));

      if (tokenCookie) {
        return tokenCookie.split('=')[1];
      }
    }
    return null;
  } catch (error) {
    console.error('인증 토큰 가져오기 실패:', error);
    return null;
  }
};

export default {
  // 클라이언트용만 export
  isClientAuthenticated,
  setClientAuth,
  clearClientAuth,
  getClientUserRole,
  getClientUserData,
  getClientAuthToken,
};
