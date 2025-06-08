import React, {
  createContext,
  useContext,
  PropsWithChildren,
  useEffect,
  useCallback,
  useReducer,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '@cargoro/api-client';

// Auth Context 타입 정의
interface AuthContextType {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  session: string | null;
  user: TechnicianUser | null;
  isLoading: boolean;
  error: string | null;
}

interface TechnicianUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  workshopId: string;
  workshopName: string;
  specialties: string[];
  certifications: string[];
  employeeId: string;
  profileImage?: string;
  role: 'technician' | 'senior_technician' | 'master_technician';
}

// Auth Context 생성
const AuthContext = createContext<AuthContextType | null>(null);

// Custom Hook for Auth
export function useSession() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }
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
  // React Native에서는 SecureStore 사용
  if (value == null) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export async function getStorageItemAsync(key: string): Promise<string | null> {
  // React Native에서는 SecureStore 사용
  return await SecureStore.getItemAsync(key);
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
  const [[isLoading, session], setSession] = useStorageState('technician-auth-session');
  const [user, setUser] = React.useState<TechnicianUser | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // 사용자 정보 로드
  useEffect(() => {
    const loadUser = async () => {
      if (session) {
        const userStr = await getStorageItemAsync('technician-user-info');
        if (userStr) {
          setUser(JSON.parse(userStr));
        }
      } else {
        setUser(null);
      }
    };
    loadUser();
  }, [session]);

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
        const response = await apiClient.post<{ token: string; user: TechnicianUser }>(
          '/auth/technician/login',
          {
            email,
            password,
          }
        );

        const { token, user } = response;

        // 토큰 및 사용자 정보 저장
        await setSession(token);
        await setStorageItemAsync('technician-user-info', JSON.stringify(user));
        setUser(user);
      } catch (err: any) {
        console.error('Sign in error:', err);

        // 개발 모드에서는 더미 데이터 사용
        if (__DEV__) {
          console.warn('개발 모드: 더미 인증 데이터 사용');
          const dummyUser: TechnicianUser = {
            id: '1',
            name: '김기술',
            email: email,
            phone: '010-1234-5678',
            workshopId: 'ws1',
            workshopName: '강남 정비소',
            specialties: ['엔진', '전기시스템', '브레이크'],
            certifications: ['자동차정비기능장', '전기자동차정비'],
            employeeId: 'EMP001',
            role: 'senior_technician',
          };

          await setSession('dev-tech-token-12345');
          await setStorageItemAsync('technician-user-info', JSON.stringify(dummyUser));
          setUser(dummyUser);
          return;
        }

        setError(err.response?.data?.message || '로그인에 실패했습니다.');
        throw err;
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
      await setStorageItemAsync('technician-user-info', null);
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
      // 로그아웃은 항상 성공하도록 처리
      await setSession(null);
      await setStorageItemAsync('technician-user-info', null);
      setUser(null);
    }
  }, [session, setSession]);

  return (
    <AuthContext.Provider
      value={{
        signIn,
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
