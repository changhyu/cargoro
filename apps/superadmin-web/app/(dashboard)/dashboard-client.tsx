'use client';

import { useState, useEffect } from 'react';

import { UserButton, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();

  // 클라이언트 사이드에서만 렌더링되도록 보장
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 마운트되지 않았거나 인증이 로드되지 않았으면 로딩 상태
  if (!isMounted || !isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우 메시지 표시
  if (!isSignedIn) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">인증이 필요합니다.</p>
        </div>
      </div>
    );
  }

  // 네비게이션 항목 설정
  const navigation = [
    { name: '대시보드', href: '/dashboard', icon: '📊' },
    { name: '사용자 관리', href: '/users', icon: '👥' },
    { name: '서비스 현황', href: '/dashboard/services', icon: '🔍' },
    { name: '시스템 모니터링', href: '/dashboard/monitoring', icon: '📈' },
    { name: '시스템 감사', href: '/dashboard/system-audit', icon: '🛡️' },
    { name: '설정', href: '/dashboard/settings', icon: '⚙️' },
    { name: '결제 관리', href: '/dashboard/payments', icon: '💰' },
    { name: 'API 키 관리', href: '/dashboard/api-keys', icon: '🔑' },
    { name: '로그', href: '/dashboard/logs', icon: '📝' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 모바일 사이드바 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={e => e.key === 'Escape' && setSidebarOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="사이드바 닫기"
        />
      )}

      {/* 사이드바 */}
      <div
        className={`bg-admin-primary fixed inset-y-0 left-0 z-50 w-64 transform text-white transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-center border-b border-indigo-700">
          <h2 className="text-xl font-bold">CarGoro 관리자</h2>
        </div>

        <nav className="mt-6">
          <div className="space-y-1 px-2">
            {navigation.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'bg-admin-secondary text-white'
                      : 'text-indigo-100 hover:bg-indigo-700'
                  } group flex items-center rounded-md px-4 py-3 text-base font-medium`}
                  aria-current={isActive ? 'page' : undefined}
                  role="menuitem"
                >
                  <span className="mr-3" aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 md:ml-64">
        {/* 상단 헤더 */}
        <header className="bg-white shadow">
          <div className="flex h-16 items-center justify-between px-4">
            {/* 모바일 메뉴 버튼 */}
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">메뉴 열기</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* 환경 인디케이터 */}
            <div className="ml-4 flex items-center">
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                라이브 환경
              </span>
            </div>

            {/* 검색창 (데스크톱) */}
            <div className="ml-4 hidden max-w-md flex-1 md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="검색..."
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 leading-5 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* 사용자 프로필 */}
            <div className="ml-4 flex items-center">
              <UserButton />
            </div>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
