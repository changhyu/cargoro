'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

import { Navbar } from './navbar';
import { Sidebar } from './sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();

  // 클라이언트 사이드에서만 렌더링되도록 보장
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 모바일에서 사이드바 열면 스크롤 방지
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add('overflow-hidden', 'lg:overflow-auto');
    } else {
      document.body.classList.remove('overflow-hidden', 'lg:overflow-auto');
    }

    return () => {
      document.body.classList.remove('overflow-hidden', 'lg:overflow-auto');
    };
  }, [isSidebarOpen]);

  // 마운트되지 않았거나 인증이 로드되지 않았으면 로딩 상태
  if (!isMounted || !isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우 리다이렉트 (실제로는 middleware에서 처리됨)
  if (!isSignedIn) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">인증이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col lg:flex-row">
      <Sidebar isOpen={isSidebarOpen} />

      {/* 모바일 오버레이 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[5] bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex flex-1 flex-col overflow-x-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
