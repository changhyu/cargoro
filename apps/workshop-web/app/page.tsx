'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@cargoro/ui';
import { ArrowRight, Calendar, Car, ClipboardCheck, Settings, Users } from 'lucide-react';

export default function HomePage() {
  const { isSignedIn } = useAuth();

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white"
      style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}
    >
      {/* 네비게이션 바 */}
      <nav
        className="sticky top-0 z-40 w-full bg-white/95 shadow backdrop-blur"
        style={{
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Image
                  src="/logo.svg"
                  alt="카고로 로고"
                  width={48}
                  height={48}
                  className="object-contain"
                />
                <span className="ml-2 text-xl font-bold text-gray-900">카고로 워크샵</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/"
                  className="inline-flex items-center border-b-2 border-blue-500 px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  홈
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
                >
                  서비스
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
                >
                  가격
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
                >
                  문의하기
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {isSignedIn ? (
                <div className="flex items-center">
                  <Button asChild variant="default" className="mr-4">
                    <Link href="/dashboard">대시보드</Link>
                  </Button>
                  <Link
                    href="/profile"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 p-1"
                  >
                    <span className="text-xs font-bold text-blue-700">내 정보</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button asChild variant="ghost">
                    <Link href="/sign-in">로그인</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/sign-up">시작하기</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-200 to-blue-400 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="mx-auto max-w-3xl py-24 sm:py-32 lg:py-40">
          <div className="text-center">
            <h1 className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-4xl font-bold tracking-tight text-gray-900 text-transparent sm:text-6xl">
              효율적인 워크샵 관리 시스템
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              카고로 워크샵 관리 시스템으로 정비소 업무를 간편하게 관리하세요. 예약, 작업 할당, 부품
              주문, 청구서 발행까지 한 곳에서 처리할 수 있습니다.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg">
                <Link href="/sign-up">
                  무료로 시작하기 <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/services">더 알아보기</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 주요 기능 섹션 */}
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-gray-900">
            워크샵을 위한 특별한 기능
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* 기능 카드 1 */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 p-3">
                <Calendar className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">일정 관리</h3>
              <p className="mt-2 text-gray-600">
                예약 시스템으로 일정을 효율적으로 관리하고 고객에게 자동으로 알림을 보냅니다.
              </p>
            </div>

            {/* 기능 카드 2 */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 p-3">
                <Car className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">차량 관리</h3>
              <p className="mt-2 text-gray-600">
                고객 차량 정보와 정비 이력을 한눈에 확인하고 효율적인 서비스를 제공합니다.
              </p>
            </div>

            {/* 기능 카드 3 */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 p-3">
                <ClipboardCheck className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">정비 작업 관리</h3>
              <p className="mt-2 text-gray-600">
                작업 상태를 실시간으로 추적하고, 완료된 작업에 대한 상세 보고서를 생성합니다.
              </p>
            </div>

            {/* 기능 카드 4 */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 p-3">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">고객 관리</h3>
              <p className="mt-2 text-gray-600">
                고객 정보, 선호도, 소통 이력을 체계적으로 관리하며 고객 충성도를 높입니다.
              </p>
            </div>

            {/* 기능 카드 5 */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 p-3">
                <Settings className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">부품 관리</h3>
              <p className="mt-2 text-gray-600">
                재고 관리, 부품 주문 및 공급업체 관계를 효율적으로 관리합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="bg-gray-900 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h3 className="mb-4 text-xl font-bold">카고로 워크샵</h3>
              <p className="text-gray-400">효율적인 정비소 관리를 위한 최고의 솔루션</p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">서비스</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/services"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    서비스 소개
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    가격 안내
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    고객 지원
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">문의</h3>
              <p className="text-gray-400">이메일: info@cargoro.com</p>
              <p className="text-gray-400">전화: 1588-1234</p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} 카고로. 모든 권리 보유.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
