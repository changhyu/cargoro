'use client';

import { Suspense } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@cargoro/ui';
import { Home, Shield } from 'lucide-react';
import nextDynamic from 'next/dynamic';

// 컴포넌트 로딩 상태 표시
const Loading = () => (
  <div className="flex h-64 items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
    <span className="ml-3 text-lg">시스템 감사 기능을 불러오는 중...</span>
  </div>
);

// SystemAuditDashboard 컴포넌트를 동적으로 불러옴
const SystemAuditDashboard = nextDynamic(
  () =>
    import('../../features/system-audit/system-audit-dashboard').then(
      mod => mod.SystemAuditDashboard
    ),
  {
    loading: () => <Loading />,
    ssr: false,
  }
);

export const dynamic = 'force-dynamic';

export default function SystemAuditPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">
            <Home className="mr-1 h-4 w-4" />홈
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard/system-audit">
            <Shield className="mr-1 h-4 w-4" />
            시스템 감사
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Suspense fallback={<Loading />}>
        <SystemAuditDashboard />
      </Suspense>
    </div>
  );
}
