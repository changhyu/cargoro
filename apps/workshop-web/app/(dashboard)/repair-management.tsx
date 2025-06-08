/**
 * 정비 작업 관리 페이지
 */
import { Home, Wrench } from 'lucide-react';
import dynamic from 'next/dynamic';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/app/components/ui/breadcrumb';

// 동적 임포트를 사용하여 모듈 로드 지연
const RepairJobList = dynamic(
  () =>
    import('@/app/features/repair-management/components/repair-job-list').then(mod => ({
      default: mod.RepairJobList,
    })),
  {
    loading: () => (
      <div className="flex h-32 items-center justify-center">정비 작업 목록을 불러오는 중...</div>
    ),
    ssr: false,
  }
);

export default function RepairManagementPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">
            <Home className="mr-1 h-4 w-4" />
            대시보드
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard/repair-management">
            <Wrench className="mr-1 h-4 w-4" />
            정비 작업 관리
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <RepairJobList />
    </div>
  );
}
