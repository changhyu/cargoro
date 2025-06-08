'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트 사이드에서만 렌더링되도록 보장
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 마운트되지 않았으면 로딩 상태
  if (!isMounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-green-600"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 네비게이션 항목 설정
  const navigation = [
    { name: '대시보드', href: '/dashboard', icon: '📊' },
    { name: '재고 관리', href: '/dashboard/inventory', icon: '📦' },
    { name: '발주 관리', href: '/dashboard/orders', icon: '📝' },
    { name: '공급업체 관리', href: '/dashboard/suppliers', icon: '🏭' },
    { name: '가격 분석', href: '/dashboard/pricing', icon: '💰' },
    { name: '품질 관리', href: '/dashboard/quality', icon: '🔍' },
    { name: '리포트', href: '/dashboard/reports', icon: '📈' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 모바일 사이드바 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <div
        className={`bg-parts-primary fixed inset-y-0 left-0 z-50 w-64 transform text-white transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-center border-b border-green-700">
          <h2 className="text-xl font-bold">CarGoro 부품 관리</h2>
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
                    isActive ? 'bg-parts-secondary text-white' : 'text-green-100 hover:bg-green-700'
                  } group flex items-center rounded-md px-4 py-3 text-base font-medium`}
                >
                  <span className="mr-3">{item.icon}</span>
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

            {/* 검색창 (데스크톱) */}
            <div className="ml-4 hidden max-w-md flex-1 md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="부품 검색..."
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 leading-5 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
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

            {/* 사용자 프로필 - 임시로 버튼만 유지 */}
            <div className="ml-4 flex items-center">
              <button className="rounded-full bg-gray-200 p-1">
                <span className="text-sm">👤</span>
              </button>
            </div>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
