/**
 * Zustand v4.4.0 기반 전역 상태 관리 훅
 * 이 파일은 모든 앱에서 공통으로 사용하는 전역 상태 관리 훅을 제공합니다.
 * React 19 호환성 검증 완료
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// 공통 상태 타입 (모든 앱에서 공유)
export interface CommonState {
  // 인증 상태
  auth: {
    isAuthenticated: boolean;
    user: {
      id?: string;
      name?: string;
      email?: string;
      role?: string;
    } | null;
  };

  // 테마 상태
  theme: {
    mode: 'light' | 'dark' | 'system';
  };

  // 앱 상태
  app: {
    isLoading: boolean;
    isOffline: boolean;
    toasts: Array<{
      id: string;
      message: string;
      type: 'info' | 'success' | 'warning' | 'error';
    }>;
  };

  // 액션 메서드
  actions: {
    // 인증 관련 액션
    login: (user: CommonState['auth']['user']) => void;
    logout: () => void;

    // 테마 관련 액션
    setTheme: (mode: CommonState['theme']['mode']) => void;

    // 앱 상태 관련 액션
    setLoading: (isLoading: boolean) => void;
    setOffline: (isOffline: boolean) => void;
    addToast: (toast: Omit<CommonState['app']['toasts'][0], 'id'>) => void;
    removeToast: (id: string) => void;
  };
}

// 초기 상태
const initialState: Omit<CommonState, 'actions'> = {
  auth: {
    isAuthenticated: false,
    user: null,
  },
  theme: {
    mode: 'system',
  },
  app: {
    isLoading: false,
    isOffline: false,
    toasts: [],
  },
};

// 기본 Zustand 스토어 생성
export const useStore = create<CommonState>()(
  devtools(
    set => ({
      ...initialState,

      actions: {
        // 인증 관련 액션
        login: user =>
          set(state => ({
            auth: {
              ...state.auth,
              isAuthenticated: true,
              user,
            },
          })),

        logout: () =>
          set(state => ({
            auth: {
              ...state.auth,
              isAuthenticated: false,
              user: null,
            },
          })),

        // 테마 관련 액션
        setTheme: mode =>
          set(state => ({
            theme: {
              ...state.theme,
              mode,
            },
          })),

        // 앱 상태 관련 액션
        setLoading: isLoading =>
          set(state => ({
            app: {
              ...state.app,
              isLoading,
            },
          })),

        setOffline: isOffline =>
          set(state => ({
            app: {
              ...state.app,
              isOffline,
            },
          })),

        addToast: toast =>
          set(state => ({
            app: {
              ...state.app,
              toasts: [
                ...state.app.toasts,
                {
                  ...toast,
                  id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                },
              ],
            },
          })),

        removeToast: id =>
          set(state => ({
            app: {
              ...state.app,
              toasts: state.app.toasts.filter(toast => toast.id !== id),
            },
          })),
      },
    }),
    { name: 'cargoro-global-store' }
  )
);

/**
 * 특정 상태만 선택해서 사용하는 훅
 *
 * 사용 예시:
 * const isAuthenticated = useStoreSelector((state) => state.auth.isAuthenticated);
 */
export function useStoreSelector<T>(selector: (state: CommonState) => T): T {
  return useStore(selector);
}

/**
 * 인증 관련 상태와 액션만 사용하는 훅
 */
export function useAuth() {
  const { auth, actions } = useStore();
  return {
    ...auth,
    login: actions.login,
    logout: actions.logout,
  };
}

/**
 * 테마 관련 상태와 액션만 사용하는 훅
 * 기존 theme/useTheme과 구분하기 위해 useGlobalTheme로 이름 변경
 */
export function useGlobalTheme() {
  const { theme, actions } = useStore();
  return {
    ...theme,
    setTheme: actions.setTheme,
  };
}

/**
 * 앱 상태 관련 상태와 액션만 사용하는 훅
 */
export function useAppState() {
  const { app, actions } = useStore();
  return {
    ...app,
    setLoading: actions.setLoading,
    setOffline: actions.setOffline,
    addToast: actions.addToast,
    removeToast: actions.removeToast,
  };
}

/**
 * 앱별 Zustand 스토어 생성 헬퍼 함수 (단순화된 버전)
 */
export function createAppStore<T, A>(
  name: string,
  initialState: T,
  actions: (set: any, get: any) => A,
  options?: {
    persist?: boolean;
    storage?: any;
    partialize?: (state: any) => any;
  }
) {
  const storeCreator = (set: any, get: any) => ({
    ...initialState,
    actions: actions(
      (fn: any) => set((state: any) => ({ ...state, ...fn(state) })),
      () => get()
    ),
  });

  if (options?.persist) {
    return create<T & { actions: A }>()(
      devtools(
        persist(storeCreator as any, {
          name: `cargoro-${name}-storage`,
          storage: options.storage,
          partialize: options.partialize,
        }),
        { name }
      )
    );
  }

  return create<T & { actions: A }>()(devtools(storeCreator as any, { name }));
}

// 스토리지 관련 내보내기 (React Native 호환용)
export const StoreProvider = ({ children }: { children: React.ReactNode }) => children;
export const useStoreInitialized = () => true;
