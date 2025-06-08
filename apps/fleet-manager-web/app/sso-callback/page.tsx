'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SSOCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Mock SSO callback처리 - 실제로는 Clerk에서 처리
    const timer = setTimeout(() => {
      // 인증 성공 시 대시보드로 리다이렉트
      router.push('/dashboard');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">SSO 인증 처리 중...</h2>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}
