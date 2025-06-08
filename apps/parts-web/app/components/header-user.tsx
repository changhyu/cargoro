'use client';

import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs';
import React from 'react';
import { cn } from '../utils';

export function HeaderUser() {
  const { isSignedIn } = useAuth();

  return (
    <div className={cn('flex items-center gap-4')}>
      {!isSignedIn ? (
        <>
          <SignInButton mode="modal">
            <button
              className={cn(
                'rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100'
              )}
            >
              로그인
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button
              className={cn(
                'rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'
              )}
            >
              회원가입
            </button>
          </SignUpButton>
        </>
      ) : (
        <UserButton />
      )}
    </div>
  );
}
