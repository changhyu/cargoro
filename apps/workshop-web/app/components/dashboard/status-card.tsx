'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Card } from '@/app/components/ui/card';

interface StatusCardProps {
  title: string;
  count: number;
  icon: ReactNode;
  bgColor: string;
  iconBgColor: string;
  href: string;
}

export function StatusCard({ title, count, icon, bgColor, iconBgColor, href }: StatusCardProps) {
  return (
    <Link href={href} className="block">
      <Card
        className={`${bgColor} cursor-pointer p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg`}
      >
        <div className="flex items-center">
          <div className={`${iconBgColor} rounded-full p-3`}>{icon}</div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{count}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
