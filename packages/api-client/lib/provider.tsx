'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { ApiClient } from './api-client';

// API 컨텍스트 타입
interface ApiContextType {
  client: ApiClient;
}

// API 컨텍스트 생성
const ApiContext = createContext<ApiContextType | null>(null);

// API 프로바이더 Props
interface ApiProviderProps {
  children: ReactNode;
  baseURL: string;
  graphqlURL?: string;
  initialToken?: string;
  showDevtools?: boolean;
  queryClientOptions?: Record<string, any>;
}

/**
 * API 클라이언트 프로바이더 컴포넌트
 */
export const ApiProvider: React.FC<ApiProviderProps> = ({ children, baseURL, initialToken }) => {
  const client = new ApiClient(baseURL);

  // 초기 토큰이 있으면 설정
  if (initialToken) {
    client.setAuthToken(initialToken);
  }

  return <ApiContext.Provider value={{ client }}>{children}</ApiContext.Provider>;
};

/**
 * API 클라이언트 사용 훅
 */
export const useApiClient = (): ApiClient => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApiClient must be used within an ApiProvider');
  }
  return context.client;
};
