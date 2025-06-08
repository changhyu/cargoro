'use client';

import React from 'react';

// 임시 API 컨텍스트
const ApiContext = React.createContext({});

interface PartsApiProviderProps {
  children: React.ReactNode;
  baseURL?: string;
  initialToken?: string;
}

/**
 * 부품 관리 앱을 위한 임시 API 제공자
 */
export function PartsApiProvider({ children }: PartsApiProviderProps) {
  // 실제 API 기능은 React Query에서 직접 구현
  return <ApiContext.Provider value={{}}>{children}</ApiContext.Provider>;
}
