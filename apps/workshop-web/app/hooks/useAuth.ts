'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 인증 관련 커스텀 훅
 *
 * Clerk 기반의 인증 기능을 제공합니다.
 */
export function useAuth() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      router.push('/sign-in');
    } catch (error) {
      // TODO: 에러 처리 및 로깅 구현
    }
  }, [signOut, router]);

  const getUserProfile = useCallback(() => {
    if (!isLoaded || !isSignedIn) {
      return null;
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.primaryEmailAddress?.emailAddress,
      imageUrl: user.imageUrl,
    };
  }, [isLoaded, isSignedIn, user]);

  return {
    isLoaded,
    isSignedIn,
    user,
    signOut: handleSignOut,
    getUserProfile,
  };
}
