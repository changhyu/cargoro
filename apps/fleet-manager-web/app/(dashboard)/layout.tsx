'use client';

import { usePathname } from 'next/navigation';

import { AuthGuard } from '@/components/auth-guard';

import DashboardClient from './dashboard-client';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 로그인 페이지는 AuthGuard 제외
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <DashboardClient>{children}</DashboardClient>
    </AuthGuard>
  );
}
