'use client';

import React, { Suspense } from 'react';
// import { ClerkProvider } from '@clerk/nextjs';

/**
 * 클라이언트 컴포넌트로 분리된 인증 프로바이더
 * 현재 Clerk와 Next.js 호환성 문제로 임시 비활성화
 */
export default function FleetAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>인증 로딩 중...</div>}>
      {/* <ClerkProvider 
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        signInFallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      >
        {children}
      </ClerkProvider> */}
      {children}
    </Suspense>
  );
}
