'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { AuthProvider } from './auth-provider';
import { clerkPublishableKey } from '../clerk';
import { koKR } from '@clerk/localizations';

interface UnifiedAuthProviderProps {
  children: React.ReactNode;
}

export function UnifiedAuthProvider({ children }: UnifiedAuthProviderProps) {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey} localization={koKR}>
      <AuthProvider>{children}</AuthProvider>
    </ClerkProvider>
  );
}
