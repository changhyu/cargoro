'use client';

// import { SignUp } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
// import ClerkErrorHandler from '../../../components/clerk-error-handler';
// import AuthResetButton from '../../../components/auth-reset-button';

/**
 * 차량 관리자 웹 회원가입 페이지
 * 임시로 Clerk 비활성화
 */
export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="relative h-20 w-20">
            <Image src="/logo.svg" alt="카고로 로고" fill className="object-contain" priority />
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          차량 관리자 계정 생성
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          차량 관리를 위한 새 계정을 만드세요
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {/* 임시 회원가입 폼 */}
          <div className="text-center">
            <p className="text-gray-500">현재 회원가입 기능이 준비 중입니다.</p>
            <Link href="/sign-in" className="mt-4 inline-block text-blue-600 hover:text-blue-500">
              로그인 페이지로 이동
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
