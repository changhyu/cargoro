/**
 * React Native (모바일) 전용 인증 유틸리티
 *
 * AsyncStorage를 사용하여 토큰과 사용자 정보를 관리합니다.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserRole } from '../types';

// 스토리지 키
const AUTH_TOKEN_KEY = '@cargoro/auth_token';
const USER_ROLE_KEY = '@cargoro/user_role';
const USER_DATA_KEY = '@cargoro/user_data';

/**
 * 모바일 앱에서 인증 상태 확인
 */
export const isClientAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return token !== null;
  } catch (error) {
    console.error('인증 상태 확인 오류:', error);
    return false;
  }
};

/**
 * 인증 정보 저장 (모바일)
 */
export const setClientAuth = async (
  token: string,
  role: UserRole,
  userData: Record<string, unknown>
): Promise<void> => {
  try {
    await AsyncStorage.multiSet([
      [AUTH_TOKEN_KEY, token],
      [USER_ROLE_KEY, role],
      [USER_DATA_KEY, JSON.stringify(userData)],
    ]);
  } catch (error) {
    console.error('인증 정보 저장 오류:', error);
    throw error;
  }
};

/**
 * 인증 정보 삭제 (모바일)
 */
export const clearClientAuth = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_ROLE_KEY, USER_DATA_KEY]);
  } catch (error) {
    console.error('인증 정보 삭제 오류:', error);
    throw error;
  }
};

/**
 * 사용자 역할 가져오기 (모바일)
 */
export const getClientUserRole = async (): Promise<UserRole | null> => {
  try {
    const role = await AsyncStorage.getItem(USER_ROLE_KEY);
    return role as UserRole | null;
  } catch (error) {
    console.error('사용자 역할 가져오기 오류:', error);
    return null;
  }
};

/**
 * 사용자 데이터 가져오기 (모바일)
 */
export const getClientUserData = async (): Promise<Record<string, unknown> | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('사용자 데이터 가져오기 오류:', error);
    return null;
  }
};

/**
 * 인증 토큰 가져오기 (모바일)
 */
export const getClientAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('인증 토큰 가져오기 오류:', error);
    return null;
  }
};
