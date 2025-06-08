'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSafeAuth } from '@cargoro/auth/web';

export default function HomePage() {
  const { isSignedIn } = useSafeAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 네비게이션 바 */}
      <nav className="border-b border-gray-700 bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <div className="relative h-12 w-12">
                  <Image src="/logo-white.svg" alt="카고로 로고" fill className="object-contain" />
                </div>
                <span className="ml-2 text-xl font-bold text-white">카고로 어드민</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/"
                  className="inline-flex items-center border-b-2 border-purple-500 px-1 pt-1 text-sm font-medium text-white"
                >
                  홈
                </Link>
                <Link
                  href="/system-status"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-300 hover:border-gray-400 hover:text-gray-200"
                >
                  시스템 상태
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-300 hover:border-gray-400 hover:text-gray-200"
                >
                  문서
                </Link>
                <Link
                  href="/support"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-300 hover:border-gray-400 hover:text-gray-200"
                >
                  지원
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {isSignedIn ? (
                <div className="flex items-center">
                  <Link
                    href="/dashboard"
                    className="mr-4 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white"
                  >
                    관리자 패널
                  </Link>
                  {/* UserButton은 ClerkProvider 내부에서만 사용가능하지만, 여기서는 로그인 상태만 확인하기 때문에 간단한 버튼으로 대체 */}
                  <Link
                    href="/profile"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 p-1"
                  >
                    <span className="text-xs font-bold text-white">프로필</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/sign-in"
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/sign-up"
                    className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500"
                  >
                    계정 요청
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-purple-800 to-purple-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              카고로 관리자 시스템
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              카고로 플랫폼의 모든 서비스를 한 곳에서 관리하세요. 사용자 계정, 서비스 상태, 시스템
              설정을 중앙에서 제어할 수 있습니다.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/sign-in"
                className="rounded-md bg-purple-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
              >
                관리자 로그인
              </Link>
              <Link
                href="/system-status"
                className="text-base font-semibold leading-6 text-gray-300 hover:text-white"
              >
                시스템 상태 확인 <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
