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
  isLoading: boolean;
  error: string | null;
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
  const [[isLoading, session], setSession] = useStorageState('auth-session');
  const [error, setError] = React.useState<string | null>(null);

  // API 클라이언트에 토큰 설정
  useEffect(() => {
    if (session) {
      // API 클라이언트에 인증 토큰 설정
      apiClient.setAuthToken(session);
    } else {
      // 토큰 제거
      apiClient.clearAuthToken();
    }
  }, [session]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);

        // API 호출하여 로그인
        const response = await apiClient.post<{ token: string; user: any }>('/auth/driver/login', {
          email,
          password,
        });

        const { token, user } = response;

        // 토큰 저장
        await setSession(token);

        // 사용자 정보 저장 (필요한 경우)
        await setStorageItemAsync('user-info', JSON.stringify(user));
      } catch (err: any) {
        console.error('Sign in error:', err);

        // 개발 모드에서는 더미 토큰 사용
        if (__DEV__) {
          console.warn('개발 모드: 더미 인증 토큰 사용');
          await setSession('dev-token-12345');
          await setStorageItemAsync(
            'user-info',
            JSON.stringify({
              id: '1',
              name: '테스트 기사',
              email: email,
              role: 'driver',
            })
          );
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
          // 로그아웃 API 실패는 무시
          console.warn('Logout API failed:', err);
        }
      }

      // 로컬 토큰 제거
      await setSession(null);
      await setStorageItemAsync('user-info', null);
    } catch (err) {
      console.error('Sign out error:', err);
      // 로그아웃은 항상 성공하도록 처리
      await setSession(null);
      await setStorageItemAsync('user-info', null);
    }
  }, [session, setSession]);

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        session,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Export useAuth as alias for useSession
export const useAuth = useSession;

// Export AuthProviderWithClerk for compatibility
export const AuthProviderWithClerk = SessionProvider;
