/**
 * 배송 기사 앱의 사용자 상태 관리
 */
import { createAppStore } from '@cargoro/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApi } from '../providers/api-provider';

// 모바일 인증 상태 관리 헬퍼 함수들
const getMobileAuthToken = async () => {
  return await AsyncStorage.getItem('auth_token');
};

const setMobileAuthToken = async (token: string) => {
  await AsyncStorage.setItem('auth_token', token);
};

const getMobileUserInfo = async () => {
  const userInfo = await AsyncStorage.getItem('user_info');
  return userInfo ? JSON.parse(userInfo) : null;
};

const setMobileUserInfo = async (userInfo: User) => {
  await AsyncStorage.setItem('user_info', JSON.stringify(userInfo));
};

const clearMobileAuthState = async () => {
  await AsyncStorage.removeItem('auth_token');
  await AsyncStorage.removeItem('user_info');
};

// 사용자 타입
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string | null;
  rating?: number;
  deliveriesCompleted?: number;
  memberSince?: string;
  licenseNumber?: string;
  vehicleCapacity?: string;
  isAvailable?: boolean;
}

// 사용자 스토어 상태 타입
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// 사용자 스토어 액션 타입
interface UserActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  toggleAvailability: (isAvailable: boolean) => Promise<void>;
}

// 임시 사용자 데이터 (개발/테스트용으로 유지)
const DUMMY_USER: User = {
  id: 'u1',
  name: '홍길동',
  email: 'driver@cargoro.com',
  phone: '010-1234-5678',
  profileImage: null,
  rating: 4.8,
  deliveriesCompleted: 328,
  memberSince: '2023년 5월',
  licenseNumber: '123456789012',
  vehicleCapacity: '중형',
  isAvailable: true,
};

// AsyncStorage를 zustand persist용 storage로 변환
const asyncStorageAdapter = {
  getItem: async (name: string) => {
    const value = await AsyncStorage.getItem(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: async (name: string, value: unknown) => {
    await AsyncStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: async (name: string) => {
    await AsyncStorage.removeItem(name);
  },
};

// 사용자 스토어 생성 (통합된 방식으로)
const useUserStore = createAppStore<UserState, UserActions>(
  'delivery-driver-user',
  {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
  set => {
    // API 클라이언트 가져오기
    const api = useApi();

    return {
      // 로그인
      login: async (email: string, password: string) => {
        set((state: UserState) => ({ ...state, isLoading: true, error: null }));

        try {
          // 개발/테스트용 로그인 처리
          // TODO: 실제 Clerk 인증 구현 필요
          const token = 'development-token';

          if (!token) {
            throw new Error('인증 토큰을 가져올 수 없습니다.');
          }

          // 백엔드 API에서 사용자 정보 가져오기
          const userData = await api.get<User>(`/api/v1/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // 토큰 및 사용자 정보 저장
          await setMobileAuthToken(token);
          await setMobileUserInfo(userData);

          set((state: UserState) => ({
            ...state,
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          }));
        } catch (error) {
          if (__DEV__) {
            console.error('Login error:', error);
          }

          // 개발 모드에서는 더미 데이터로 폴백
          if (__DEV__) {
            console.warn('개발 모드: 더미 사용자 데이터 사용');

            // 더미 토큰 & 사용자 정보 저장
            await setMobileAuthToken('dummy-token-for-development');
            await setMobileUserInfo(DUMMY_USER);

            set((state: UserState) => ({
              ...state,
              user: DUMMY_USER,
              isAuthenticated: true,
              isLoading: false,
            }));
            return;
          }

          set((state: UserState) => ({
            ...state,
            error: error instanceof Error ? error.message : '로그인에 실패했습니다.',
            isLoading: false,
          }));
          throw error;
        }
      },

      // 로그아웃
      logout: async () => {
        set((state: UserState) => ({ ...state, isLoading: true, error: null }));

        try {
          // TODO: 실제 Clerk 로그아웃 구현 필요

          // 로컬 스토리지에서 토큰 & 사용자 정보 삭제
          await clearMobileAuthState();

          set((state: UserState) => ({
            ...state,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          }));
        } catch (error) {
          if (__DEV__) {
            console.error('Logout error:', error);
          }
          set((state: UserState) => ({
            ...state,
            error: '로그아웃 중 오류가 발생했습니다.',
            isLoading: false,
          }));
        }
      },

      // 프로필 업데이트
      updateProfile: async (userData: Partial<User>) => {
        set((state: UserState) => ({ ...state, isLoading: true, error: null }));

        try {
          // 토큰 가져오기
          const token = await getMobileAuthToken();

          if (!token) {
            throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
          }

          // 백엔드 API로 프로필 업데이트
          const updatedUserData = await api.put<User>(`/api/v1/users/profile`, userData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // 로컬 스토리지 업데이트
          const currentUserInfo = await getMobileUserInfo();
          if (currentUserInfo) {
            await setMobileUserInfo({
              ...currentUserInfo,
              ...updatedUserData,
            });
          }

          set((state: UserState) => ({
            ...state,
            user: state.user ? { ...state.user, ...updatedUserData } : null,
            isLoading: false,
          }));
        } catch (error) {
          if (__DEV__) {
            console.error('Update profile error:', error);
          }

          // 개발 모드에서는 임시 프로필 업데이트
          if (__DEV__) {
            console.warn('개발 모드: 로컬 프로필 업데이트');
            set((state: UserState) => ({
              ...state,
              user: state.user ? { ...state.user, ...userData } : null,
              isLoading: false,
            }));
            return;
          }

          set((state: UserState) => ({
            ...state,
            error: '프로필 업데이트 중 오류가 발생했습니다.',
            isLoading: false,
          }));
        }
      },

      // 근무 가능 상태 전환
      toggleAvailability: async (isAvailable: boolean) => {
        set((state: UserState) => ({ ...state, isLoading: true, error: null }));

        try {
          // 토큰 가져오기
          const token = await getMobileAuthToken();

          if (!token) {
            throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
          }

          // 백엔드 API로 상태 업데이트
          await api.put(
            `/api/v1/drivers/availability`,
            { isAvailable },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // 로컬 상태 업데이트
          set((state: UserState) => ({
            ...state,
            user: state.user ? { ...state.user, isAvailable } : null,
            isLoading: false,
          }));

          // 로컬 스토리지 업데이트
          const currentUserInfo = await getMobileUserInfo();
          if (currentUserInfo) {
            await setMobileUserInfo({
              ...currentUserInfo,
              isAvailable,
            });
          }
        } catch (error) {
          if (__DEV__) {
            console.error('Toggle availability error:', error);
          }

          // 개발 모드에서는 임시 상태 업데이트
          if (__DEV__) {
            console.warn('개발 모드: 로컬 상태 업데이트');
            set((state: UserState) => ({
              ...state,
              user: state.user ? { ...state.user, isAvailable } : null,
              isLoading: false,
            }));
            return;
          }

          set((state: UserState) => ({
            ...state,
            error: '상태 변경 중 오류가 발생했습니다.',
            isLoading: false,
          }));
        }
      },
    };
  },
  {
    persist: true,
    storage: asyncStorageAdapter, // React Native AsyncStorage를 사용
    partialize: state => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
    }),
  }
);

export default useUserStore;
