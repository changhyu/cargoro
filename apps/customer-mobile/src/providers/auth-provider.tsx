import React, {
  createContext,
  useContext,
  PropsWithChildren,
  useEffect,
  useCallback,
  useReducer,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { apiClient } from '@cargoro/api-client';

// Auth Context 타입 정의
interface AuthContextType {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  session: string | null;
  user: CustomerUser | null;
  isLoading: boolean;
  error: string | null;
}

interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  vehicles?: Vehicle[];
  memberSince: string;
  totalServices: number;
  activeBookings: number;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  color?: string;
  mileage?: number;
}

interface SignUpData {
  name: string;
  email: string;
  password: string;
  phone: string;
  [key: string]: string; // 인덱스 시그니처 추가
}

// Auth Context 생성
const AuthContext = createContext<AuthContextType>({
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  session: null,
  user: null,
  isLoading: true,
  error: null,
});

// Custom Hook for Auth
export function useSession(): AuthContextType {
  const context = useContext(AuthContext);
  return context;
}

// Async State Hook 타입
type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

// Async State Hook
function useAsyncState<T>(initialValue: [boolean, T | null] = [true, null]): UseStateHook<T> {
  return useReducer(
    (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>;
}

// Storage Helper Functions
export async function setStorageItemAsync(key: string, value: string | null) {
  if (Platform.OS === 'web') {
    try {
      // Web 환경에서 localStorage 사용
      const storage = (globalThis as unknown as Window & { localStorage?: Storage }).localStorage;
      if (storage) {
        if (value === null) {
          storage.removeItem(key);
        } else {
          storage.setItem(key, value);
        }
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    if (value == null) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }
}

export async function getStorageItemAsync(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      const storage = (globalThis as unknown as Window & { localStorage?: Storage }).localStorage;
      if (storage) {
        return storage.getItem(key);
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    return await SecureStore.getItemAsync(key);
  }
  return null;
}

// Storage State Hook
export function useStorageState(key: string): UseStateHook<string> {
  const [state, setState] = useAsyncState<string>();

  // 초기 값 로드
  useEffect(() => {
    (async () => {
      const value = await getStorageItemAsync(key);
      setState(value);
    })();
  }, [key]);

  // 값 설정 함수
  const setValue = useCallback(
    async (value: string | null) => {
      setState(value);
      await setStorageItemAsync(key, value);
    },
    [key]
  );

  return [state, setValue];
}

// Session Provider Component
export function SessionProvider({ children }: PropsWithChildren) {
  const [[isStorageLoading, session], setSession] = useStorageState('customer-auth-session');
  const [user, setUser] = React.useState<CustomerUser | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false); // 사용자 정보 로드
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (session) {
          const userStr = await getStorageItemAsync('customer-user-info');
          if (userStr) {
            setUser(JSON.parse(userStr));
          }
        } else {
          // 세션이 없어도 기본 사용자 정보 설정 (게스트 모드)
          const guestUser: CustomerUser = {
            id: 'guest',
            name: '게스트 사용자',
            email: 'guest@example.com',
            phone: '',
            memberSince: new Date().toISOString(),
            totalServices: 0,
            activeBookings: 0,
          };
          setUser(guestUser);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
      } finally {
        setIsInitialized(true);
      }
    };

    if (!isStorageLoading) {
      loadUser();
    }
  }, [session, isStorageLoading]);

  // API 클라이언트에 토큰 설정
  useEffect(() => {
    if (session) {
      apiClient.setAuthToken(session);
    } else {
      apiClient.clearAuthToken();
    }
  }, [session]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);

        // API 호출하여 로그인
        const response = await apiClient.post<{ token: string; user: CustomerUser }>(
          '/auth/customer/login',
          {
            email,
            password,
          }
        );

        const { token, user } = response;

        // 토큰 및 사용자 정보 저장
        await setSession(token);
        await setStorageItemAsync('customer-user-info', JSON.stringify(user));
        setUser(user);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        console.error('Sign in error:', error);

        // 개발 모드에서는 더미 데이터 사용
        if (__DEV__) {
          console.warn('개발 모드: 더미 인증 데이터 사용');
          const dummyUser: CustomerUser = {
            id: '1',
            name: '홍길동',
            email: email,
            phone: '010-1234-5678',
            vehicles: [
              {
                id: 'v1',
                make: '현대',
                model: '아반떼',
                year: 2022,
                licensePlate: '12가 3456',
                color: '흰색',
                mileage: 15000,
              },
              {
                id: 'v2',
                make: '기아',
                model: 'K5',
                year: 2021,
                licensePlate: '34나 5678',
                color: '검정색',
                mileage: 32000,
              },
            ],
            memberSince: '2023-01-15',
            totalServices: 12,
            activeBookings: 1,
          };

          await setSession('dev-customer-token-12345');
          await setStorageItemAsync('customer-user-info', JSON.stringify(dummyUser));
          setUser(dummyUser);
          return;
        }

        setError(error.response?.data?.message || '로그인에 실패했습니다.');
        throw error;
      }
    },
    [setSession]
  );

  const signUp = useCallback(
    async (data: SignUpData) => {
      try {
        setError(null);

        // API 호출하여 회원가입
        const response = await apiClient.post<{ token: string; user: CustomerUser }>(
          '/auth/customer/signup',
          data
        );

        const { token, user } = response;

        // 토큰 및 사용자 정보 저장
        await setSession(token);
        await setStorageItemAsync('customer-user-info', JSON.stringify(user));
        setUser(user);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        console.error('Sign up error:', error);

        // 개발 모드에서는 더미 데이터로 회원가입 성공 처리
        if (__DEV__) {
          console.warn('개발 모드: 더미 회원가입 처리');
          const dummyUser: CustomerUser = {
            id: '1',
            name: data.name,
            email: data.email,
            phone: data.phone,
            vehicles: [],
            memberSince: new Date().toISOString(),
            totalServices: 0,
            activeBookings: 0,
          };

          await setSession('dev-customer-token-12345');
          await setStorageItemAsync('customer-user-info', JSON.stringify(dummyUser));
          setUser(dummyUser);
          return;
        }

        setError(error.response?.data?.message || '회원가입에 실패했습니다.');
        throw error;
      }
    },
    [setSession]
  );

  const signOut = useCallback(async () => {
    try {
      // API 호출하여 로그아웃 (옵션)
      if (session) {
        try {
          await apiClient.post('/auth/logout');
        } catch (err) {
          console.warn('Logout API failed:', err);
        }
      }

      // 로컬 데이터 제거
      await setSession(null);
      await setStorageItemAsync('customer-user-info', null);
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
      // 로그아웃은 항상 성공하도록 처리
      await setSession(null);
      await setStorageItemAsync('customer-user-info', null);
      setUser(null);
    }
  }, [session, setSession]);

  // isLoading은 스토리지 로딩 중이거나 초기화되지 않은 상태
  const isLoading = isStorageLoading || !isInitialized;

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signUp,
        signOut,
        session,
        user,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
