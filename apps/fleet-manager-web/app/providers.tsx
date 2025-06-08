'use client';

import { ClerkProvider } from '@clerk/nextjs';
import dynamic from 'next/dynamic';

import { SafeContextProvider } from '../components/providers/safe-context';

import ApiErrorHandler from './components/api-error-handler';

// ClerkProvider를 동적으로 로드하여 SSR 중에 실행되지 않도록 함
const DynamicClerkProvider = dynamic(() => Promise.resolve(ClerkProvider), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

// 동적으로 로드되는 클라이언트 전용 프로바이더
function ClientOnlyProviders({ children }: { children: React.ReactNode }) {
  return (
    <DynamicClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <SafeContextProvider>
        <ApiErrorHandler>{children}</ApiErrorHandler>
      </SafeContextProvider>
    </DynamicClerkProvider>
  );
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <ClientOnlyProviders>{children}</ClientOnlyProviders>;
}
