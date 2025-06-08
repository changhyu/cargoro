import React, { ReactNode } from 'react';
import AnalyticsProvider from './analytics-provider';
import { ApiProvider } from './api-provider';
import { AuthProviderWithClerk } from './auth-provider';

// API 기본 URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.cargoro.com';

interface RootProviderProps {
  children: ReactNode;
}

const RootProvider: React.FC<RootProviderProps> = ({ children }) => {
  return (
    <AuthProviderWithClerk>
      <ApiProvider baseURL={API_URL}>
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </ApiProvider>
    </AuthProviderWithClerk>
  );
};

export default RootProvider;
