'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

/**
 * 인증이 필요한 페이지에 대한 보호 래퍼 컴포넌트
 */
export default function ProtectedPage({ children }: { readonly children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 로딩이 완료되고 인증되지 않은 경우 로그인 페이지로 리디렉션
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn, isLoaded, router]);

  // 로딩 중이거나 인증되지 않은 경우 로딩 UI 표시
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  // 인증된 경우에만 자식 컴포넌트 렌더링
  return isSignedIn ? <>{children}</> : null;
}
