'use client';

import { SignIn } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center">
          <h1 className="text-admin-primary text-2xl font-bold">관리자 시스템</h1>
          <p className="mt-2 text-gray-500">관리자 계정으로 로그인하세요</p>
        </div>

        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: 'bg-admin-primary hover:bg-admin-secondary text-sm normal-case',
              footerActionLink: 'text-admin-primary hover:text-admin-secondary',
            },
          }}
          redirectUrl={redirectUrl}
        />

        <div className="mt-6 rounded bg-gray-50 p-4 text-sm text-gray-500">
          <p className="mb-2 font-medium">보안 알림:</p>
          <p>관리자 접근 권한이 필요합니다. 접속 시도는 보안 로그에 기록됩니다.</p>
        </div>
      </div>
    </div>
  );
}
