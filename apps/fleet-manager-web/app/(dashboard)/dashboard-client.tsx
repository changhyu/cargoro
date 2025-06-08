'use client';

import { useState } from 'react';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { useToast } from '@/app/hooks/use-toast';
import { useAuthStore } from '@/app/state/auth-store';

// 클라이언트 사이드 렌더링이 필요한 대시보드 UI 컴포넌트
export default function DashboardClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast({
      title: '로그아웃 완료',
      description: '안전하게 로그아웃되었습니다.',
    });
    router.push('/login');
  };

  // 네비게이션 항목 설정
  const navigation = [
    { name: '렌터카/리스 대시보드', href: '/features/rental', icon: '🏢' },
    { name: '차량 관리', href: '/vehicles', icon: '🚗' },
    { name: '계약 관리', href: '/features/contracts', icon: '📝' },
    { name: '예약 관리', href: '/features/reservations', icon: '🗓️' },
    { name: '고객 관리', href: '/customers', icon: '👥' },
    { name: '재무 관리', href: '/features/finance', icon: '💰' },
    { name: '결제 관리', href: '/features/payments', icon: '💳' },
    { name: '정비 일정', href: '/dashboard/maintenance', icon: '🔧' },
    { name: '보험 관리', href: '/dashboard/insurance', icon: '🛡️' },
    { name: '보고서', href: '/dashboard/reports', icon: '📈' },
  ];

  // 관리자 전용 메뉴
  const adminNavigation = [
    { name: '사용자 관리', href: '/admin/users', icon: '👤' },
    { name: '시스템 설정', href: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 모바일 사이드바 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              setSidebarOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="닫기"
        />
      )}

      {/* 사이드바 */}
      <div
        className={`bg-fleet-primary fixed inset-y-0 left-0 z-50 w-64 transform text-white transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-center border-b border-blue-700">
          <h2 className="text-xl font-bold">CarGoro 렌터카/리스</h2>
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
                    isActive ? 'bg-fleet-secondary text-white' : 'text-blue-100 hover:bg-blue-700'
                  } group flex items-center rounded-md px-4 py-3 text-base font-medium`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* 관리자 메뉴 */}
          {user?.role === 'ADMIN' && (
            <>
              <div className="mt-6 border-t border-blue-700 pt-6">
                <h3 className="px-6 text-xs font-semibold uppercase tracking-wider text-blue-200">
                  관리자 메뉴
                </h3>
                <div className="mt-3 space-y-1 px-2">
                  {adminNavigation.map(item => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`${
                          isActive
                            ? 'bg-fleet-secondary text-white'
                            : 'text-blue-100 hover:bg-blue-700'
                        } group flex items-center rounded-md px-4 py-3 text-base font-medium`}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          )}
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
                  placeholder="차량, 고객, 계약 검색..."
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 leading-5 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
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
            <div className="ml-4 flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name} (
                {user?.role === 'ADMIN' ? '관리자' : user?.role === 'MANAGER' ? '매니저' : '사용자'}
                )
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/01.png" alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>프로필</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>로그아웃</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
