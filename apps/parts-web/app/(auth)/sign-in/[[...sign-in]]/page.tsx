'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@cargoro/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * 부품관리 웹 로그인 페이지 (임시)
 */
export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="relative h-20 w-20">
            <Image src="/logo.svg" alt="카고로 로고" fill className="object-contain" priority />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          부품관리 계정 로그인
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <p className="mb-4 text-center">인증 시스템 업데이트 중입니다.</p>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/dashboard">데모 대시보드로 이동</Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button asChild variant="ghost" size="sm">
            <Link href="/" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              홈으로 돌아가기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
