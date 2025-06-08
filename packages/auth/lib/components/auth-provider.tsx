'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import type { UserResource } from '@clerk/types';

interface AuthContextValue {
  user: UserResource | null | undefined;
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { signOut } = useClerkAuth();
  const { user, isLoaded, isSignedIn } = useUser();

  const value: AuthContextValue = {
    user,
    isLoaded,
    isSignedIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
