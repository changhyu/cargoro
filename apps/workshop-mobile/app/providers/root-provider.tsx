import React, { ReactNode } from 'react';

import AnalyticsProvider from './analytics-provider';
import { ApiProvider } from './api-provider';
import { AuthProvider } from './auth-provider';

// API 기본 URL (Expo 환경 변수 사용)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.cargoro.com';

interface RootProviderProps {
  children: ReactNode;
}

const RootProvider: React.FC<RootProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <ApiProvider baseURL={API_URL}>
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </ApiProvider>
    </AuthProvider>
  );
};

export default RootProvider;
