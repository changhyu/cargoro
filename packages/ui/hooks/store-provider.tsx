/**
 * 글로벌 상태 관리 Provider 컴포넌트
 */
import React, { createContext, ReactNode, useContext, useEffect } from 'react';

import { useStore } from './use-store';

// 스토어 컨텍스트
const StoreContext = createContext<boolean>(false);

/**
 * 앱의 루트에 위치하여 글로벌 상태를 초기화하는 Provider
 */
export function StoreProvider({ children }: { children: ReactNode }): React.ReactElement {
  // 스토어 상태 초기화 로직 (필요시 서버 데이터 로드)
  useEffect(() => {
    // 여기에 스토어 초기화 로직 구현
    console.log('StoreProvider initialized');

    // 기본 테마 설정
    const prefersDarkMode = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    useStore.getState().actions.setTheme(prefersDarkMode ? 'dark' : 'light');

    // 네트워크 상태 감지
    const handleOffline = () => useStore.getState().actions.setOffline(true);
    const handleOnline = () => useStore.getState().actions.setOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return <StoreContext.Provider value={true}>{children}</StoreContext.Provider>;
}

/**
 * 스토어 초기화 여부 확인 훅
 */
export function useStoreInitialized(): boolean {
  const initialized = useContext(StoreContext);
  if (!initialized) {
    console.warn('useStoreInitialized must be used within a StoreProvider');
  }
  return initialized;
}
