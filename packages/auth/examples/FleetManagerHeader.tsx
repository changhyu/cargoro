import { UserButton } from '@cargoro/auth/web';
import { useUser, useOrganization } from '@cargoro/auth/web';
import Link from 'next/link';
import { useState } from 'react';

export function FleetManagerHeader() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 & 조직 정보 */}
          <div className="flex items-center space-x-4">
            <Link href="/fleet/dashboard" className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">플릿 매니저</span>
                {organization && (
                  <span className="block text-xs text-gray-500">{organization.name}</span>
                )}
              </div>
            </Link>
          </div>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden space-x-6 md:flex">
            <Link
              href="/fleet/dashboard"
              className="font-medium text-gray-700 transition-colors hover:text-emerald-600"
            >
              대시보드
            </Link>
            <Link
              href="/fleet/vehicles"
              className="font-medium text-gray-700 transition-colors hover:text-emerald-600"
            >
              차량 관리
            </Link>
            <Link
              href="/fleet/drivers"
              className="font-medium text-gray-700 transition-colors hover:text-emerald-600"
            >
              운전자 관리
            </Link>
            <Link
              href="/fleet/tracking"
              className="flex items-center font-medium text-gray-700 transition-colors hover:text-emerald-600"
            >
              실시간 추적
              <span className="ml-1 flex h-2 w-2">
                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
            </Link>
            <Link
              href="/fleet/analytics"
              className="font-medium text-gray-700 transition-colors hover:text-emerald-600"
            >
              분석
            </Link>
          </nav>

          {/* 사용자 메뉴 & 알림 */}
          <div className="flex items-center space-x-4">
            {/* 알림 버튼 */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute right-0 top-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>

            {/* 사용자 정보 */}
            <div className="hidden items-center space-x-3 md:flex">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">플릿 매니저</p>
              </div>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'h-10 w-10 border-2 border-emerald-200',
                    userButtonPopoverCard: 'mt-3 shadow-lg',
                    userButtonPopoverActionButton: 'hover:bg-emerald-50 hover:text-emerald-700',
                  },
                }}
              />
            </div>

            {/* 모바일 메뉴 토글 */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 md:hidden"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={showMobileMenu ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {showMobileMenu && (
        <div className="border-t border-gray-200 md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            <Link
              href="/fleet/dashboard"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
            >
              대시보드
            </Link>
            <Link
              href="/fleet/vehicles"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
            >
              차량 관리
            </Link>
            <Link
              href="/fleet/drivers"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
            >
              운전자 관리
            </Link>
            <Link
              href="/fleet/tracking"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
            >
              실시간 추적
            </Link>
            <Link
              href="/fleet/analytics"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600"
            >
              분석
            </Link>
          </div>
          <div className="border-t border-gray-200 pb-3 pt-4">
            <div className="flex items-center px-5">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'h-10 w-10',
                  },
                }}
              />
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user?.fullName}</div>
                <div className="text-sm font-medium text-gray-500">
                  {user?.emailAddresses[0]?.emailAddress}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
