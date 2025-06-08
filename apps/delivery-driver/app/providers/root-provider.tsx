import { ReactNode } from 'react';
import { AuthProviderWithClerk } from './auth-provider';
import { ApiProvider } from './api-provider';
import AnalyticsProvider from './analytics-provider';

// API 기본 URL
const API_URL = process.env.API_URL || 'https://api.cargoro.com';

interface RootProviderProps {
  children: ReactNode;
}

const RootProvider = ({ children }: RootProviderProps) => {
  return (
    <AuthProviderWithClerk>
      <ApiProvider baseURL={API_URL}>
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </ApiProvider>
    </AuthProviderWithClerk>
  );
};

export default RootProvider;
