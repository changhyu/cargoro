'use client';

import { SignUp } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import Image from 'next/image';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="relative h-20 w-20">
            <Image
              src="/logo-white.svg"
              alt="카고로 로고"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
          관리자 계정 생성
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          카고로 플랫폼 관리를 위한 어드민 계정을 만드세요
          <br />
          <span className="font-semibold text-purple-400">*관리자 계정은 승인 후 활성화됩니다</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="border border-gray-700 bg-gray-800 px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            redirectUrl="/dashboard"
            appearance={{
              baseTheme: dark,
              elements: {
                formButtonPrimary:
                  'bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800',
                card: 'rounded-md shadow-none bg-transparent',
                headerTitle: 'text-2xl font-bold text-center text-white',
                headerSubtitle: 'text-center text-gray-400',
                socialButtonsProviderIcon: 'w-6 h-6',
                socialButtons: 'gap-2',
                dividerText: 'text-gray-500',
                formFieldLabel: 'block text-sm font-medium text-gray-300',
                formFieldInput:
                  'mt-1 block w-full rounded-md border-gray-600 bg-gray-700 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-white',
                footerActionText: 'text-sm text-gray-400',
                footerActionLink: 'text-purple-400 hover:text-purple-300',
              },
            }}
          />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gray-800 px-2 text-gray-400">또는</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                href="/sign-in"
                className="inline-flex w-full justify-center rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                로그인하기
              </Link>
              <Link
                href="/support"
                className="inline-flex w-full justify-center rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                기술 지원
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
