/**
 * 인증 관련 유틸리티 함수
 */

// 비동기 저장소 라이브러리를 불러옵니다.
import AsyncStorage from '@react-native-async-storage/async-storage';

// 사용자 역할 타입 정의
export type UserRole = 'driver' | 'admin' | 'guest';

// 토큰 저장 키
const AUTH_TOKEN_KEY = 'auth-token';
const USER_ROLE_KEY = 'user-role';
const USER_DATA_KEY = 'user-data';

/**
 * 인증 상태 확인
 * @returns {Promise<boolean>} 인증 여부
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  return token !== null;
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
      const mockRole: UserRole = 'driver';
      const mockUserData = {
        id: '123',
        name: '홍길동',
        email: email,
        role: mockRole,
      };

      await Promise.all([
        AsyncStorage.setItem(AUTH_TOKEN_KEY, mockToken),
        AsyncStorage.setItem(USER_ROLE_KEY, mockRole),
        AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(mockUserData)),
      ]);

      return true;
    }
    return false;
  } catch (error) {
    if (__DEV__) {
      console.error('로그인 실패:', error);
    }
    return false;
  }
};

/**
 * 사용자 로그아웃
 * @returns {Promise<void>}
 */
export const logout = async (): Promise<void> => {
  await clearAuthState();
};

/**
 * 인증 상태 초기화
 * @returns {Promise<void>}
 */
export const clearAuthState = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_ROLE_KEY);
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    if (__DEV__) {
      console.error('인증 상태 초기화 실패:', error);
    }
  }
};

/**
 * 사용자 역할 가져오기
 * @returns {Promise<UserRole|null>} 사용자 역할
 */
export const getUserRole = async (): Promise<UserRole | null> => {
  try {
    const role = await AsyncStorage.getItem(USER_ROLE_KEY);
    return role as UserRole | null;
  } catch (error) {
    if (__DEV__) {
      console.error('사용자 역할 가져오기 실패:', error);
    }
    return null;
  }
};

/**
 * 사용자 데이터 가져오기
 * @returns {Promise<unknown|null>} 사용자 데이터
 */
export const getUserData = async (): Promise<unknown | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    if (__DEV__) {
      console.error('사용자 데이터 가져오기 실패:', error);
    }
    return null;
  }
};

/**
 * 인증 토큰 가져오기
 * @returns {Promise<string|null>} 인증 토큰
 */
export const getAuthToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
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
