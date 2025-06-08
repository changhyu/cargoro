'use client';

import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AuthResetButton from '../../../components/auth-reset-button';
import { Button } from '@cargoro/ui';

/**
 * 워크샵 웹 로그인 페이지
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
          차량 관리자 계정 로그인
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: 'bg-primary hover:bg-primary/90 text-white',
                formFieldInput:
                  'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 [id=clerk-email-input] [autocomplete=email]',
                card: 'bg-white',
                identityPreviewEditButton: 'text-primary',
                formFieldLabel: 'text-gray-700',
                footerActionLink: 'text-primary hover:text-primary/90',
                formFieldInputPassword:
                  'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 [id=clerk-password-input] [autocomplete=current-password]',
              },
            }}
            fallbackRedirectUrl="/dashboard"
            signUpUrl="/sign-up"
          />

          {/* 인증 초기화 버튼 */}
          <AuthResetButton />
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
