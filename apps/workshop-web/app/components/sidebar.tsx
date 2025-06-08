'use client';

import { Button, ScrollArea, cn } from '@cargoro/ui';
import {
  CalendarIcon,
  CarIcon,
  ClipboardListIcon,
  CogIcon,
  DollarSignIcon,
  FileTextIcon,
  HomeIcon,
  PackageIcon,
  UsersIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
}

const navItems = [
  {
    label: '대시보드',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    label: '고객 관리',
    href: '/customers',
    icon: UsersIcon,
  },
  {
    label: '예약 관리',
    href: '/bookings',
    icon: CalendarIcon,
  },
  {
    label: '정비 작업',
    href: '/repairs',
    icon: ClipboardListIcon,
  },
  {
    label: '차량 관리',
    href: '/vehicles',
    icon: CarIcon,
  },
  {
    label: '부품 관리',
    href: '/parts',
    icon: PackageIcon,
  },
  {
    label: '보고서',
    href: '/reports',
    icon: FileTextIcon,
  },
  {
    label: '직원 관리',
    href: '/staff',
    icon: UsersIcon,
  },
  {
    label: '매출 분석',
    href: '/finance',
    icon: DollarSignIcon,
  },
  {
    label: '설정',
    href: '/settings',
    icon: CogIcon,
  },
];

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-10 w-64 transform overflow-y-auto bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
        {
          'translate-x-0': isOpen,
          '-translate-x-full': !isOpen,
        }
      )}
    >
      <div className="flex h-16 items-center justify-center border-b">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-600">CarGoro</span>
          <span className="text-sm text-gray-500">정비소</span>
        </Link>
      </div>

      <ScrollArea className="h-[calc(100vh-4rem)]">
        <nav className="space-y-1 p-4">
          {navItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Button
                key={item.href}
                variant={isActive ? 'ghost' : 'ghost'}
                size="sm"
                className={cn(
                  'w-full justify-start',
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon
                    className={cn('mr-3 h-5 w-5', {
                      'text-blue-600': isActive,
                      'text-gray-500': !isActive,
                    })}
                  />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
