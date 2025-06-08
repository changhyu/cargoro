'use client';

import React, { ReactNode, createContext, useState, useEffect } from 'react';

import { vehicleService } from '../services/api';
import { useVehicleStore } from '../state/vehicle-store';

interface AppProviderProps {
  children: ReactNode;
}

interface AppContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  initializeApp: () => Promise<void>;
}

export const AppContext = createContext<AppContextType>({
  isLoading: false,
  setIsLoading: () => {},
  error: null,
  setError: () => {},
  initializeApp: async () => {},
});

export function AppProvider({ children }: AppProviderProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setVehicles, setLoading, setError: setStoreError } = useVehicleStore();

  // 앱 초기 데이터 로드
  const initializeApp = async () => {
    setIsLoading(true);
    setError(null);
    setStoreError(null);

    try {
      // 차량 데이터 로드
      const vehiclesResponse = await vehicleService.getVehicles();
      setVehicles(vehiclesResponse.vehicles || []); // vehicles 배열만 전달

      // 여기에 필요한 다른 초기 데이터 로드 로직 추가
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '앱 초기화 중 오류가 발생했습니다.';
      setError(errorMessage);
      setStoreError(errorMessage);
      // eslint-disable-next-line no-console
      console.error('앱 초기화 에러:', err);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  // 앱 마운트 시 초기화
  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <AppContext.Provider
      value={{
        isLoading,
        setIsLoading,
        error,
        setError,
        initializeApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
