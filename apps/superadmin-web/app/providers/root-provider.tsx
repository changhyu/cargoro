'use client';

import { ReactNode } from 'react';

import ClientAnalyticsProvider from './analytics-provider';
import ApiProvider from './api-provider';
import AuthProvider from './auth-provider';

// API 기본 URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.cargoro.com';

interface RootProviderProps {
  children: ReactNode;
}

const RootProvider = ({ children }: RootProviderProps): JSX.Element => {
  return (
    <AuthProvider>
      <ApiProvider baseURL={API_URL}>
        <ClientAnalyticsProvider>{children}</ClientAnalyticsProvider>
      </ApiProvider>
    </AuthProvider>
  );
};

export default RootProvider;
