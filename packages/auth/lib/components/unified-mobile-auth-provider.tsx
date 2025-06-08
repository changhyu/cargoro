import React from 'react';
import { ClerkMobileProvider } from './clerk-mobile-provider';
import { AuthProvider } from './auth-provider';

interface UnifiedMobileAuthProviderProps {
  children: React.ReactNode;
  tokenCache?: any;
}

export function UnifiedMobileAuthProvider({
  children,
  tokenCache,
}: UnifiedMobileAuthProviderProps) {
  return (
    <ClerkMobileProvider tokenCache={tokenCache}>
      <AuthProvider>{children}</AuthProvider>
    </ClerkMobileProvider>
  );
}
