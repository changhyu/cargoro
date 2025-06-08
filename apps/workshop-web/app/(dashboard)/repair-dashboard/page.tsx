'use client';

import React from 'react';
import { RepairJobList } from '@/app/features/repair-management/components/repair-job-list';
import Link from 'next/link';
import { Button } from '@cargoro/ui';

// 동적 렌더링 강제 (Clerk 인증 때문에 SSG 불가능)
export const dynamic = 'force-dynamic';

export default function RepairDashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">정비 대시보드</h1>
          <p className="text-muted-foreground">정비소의 모든 정비 작업을 관리합니다.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/repair-dashboard/new">새 정비 작업 등록</Link>
        </Button>
      </div>

      <RepairJobList />
    </div>
  );
}
