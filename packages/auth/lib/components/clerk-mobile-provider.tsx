import React from 'react';
import { ClerkProvider } from '@clerk/clerk-expo';
import { clerkPublishableKey } from '../clerk';

interface ClerkMobileProviderProps {
  children: React.ReactNode;
  tokenCache?: any;
}

export function ClerkMobileProvider({ children, tokenCache }: ClerkMobileProviderProps) {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      {children}
    </ClerkProvider>
  );
}
