'use client';

import { cn } from '@cargoro/ui';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@cargoro/ui/button';
import { Package, Layers, ShoppingCart, BarChart2, Settings, LogOut } from 'lucide-react';

const navItems = [
  {
    href: '/dashboard',
    title: '대시보드',
    icon: <BarChart2 className="h-5 w-5" />,
  },
  {
    href: '/parts',
    title: '부품 관리',
    icon: <Package className="h-5 w-5" />,
  },
  {
    href: '/inventory',
    title: '재고 관리',
    icon: <Layers className="h-5 w-5" />,
  },
  {
    href: '/orders',
    title: '주문 관리',
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    href: '/settings',
    title: '설정',
    icon: <Settings className="h-5 w-5" />,
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  const handleLogout = () => {
    // 임시 로그아웃 처리
    window.location.href = '/';
  };

  return (
    <div className={cn('pb-12', className)}>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">부품 관리 시스템</h2>
        <div className="space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                pathname === item.href ? 'bg-accent text-accent-foreground' : 'transparent'
              )}
            >
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </div>
  );
}
