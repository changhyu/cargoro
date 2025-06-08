import React from 'react';
import { RepairJobForm } from '@/app/features/repair-management/components/repair-job-form';

// 동적 렌더링 강제 (Clerk 인증 때문에 SSG 불가능)
export const dynamic = 'force-dynamic';

export default function NewRepairJobPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">새 정비 작업 등록</h1>
        <p className="text-muted-foreground">새로운 정비 작업을 등록합니다.</p>
      </div>

      <RepairJobForm />
    </div>
  );
}
