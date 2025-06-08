import React from 'react';
import { RepairJobDetails } from '@/app/features/repair-management/components/repair-job-details';

export default function RepairJobDetailPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">정비 작업 상세 정보</h1>
        <p className="text-muted-foreground">정비 작업의 세부 정보를 확인합니다.</p>
      </div>

      <RepairJobDetails />
    </div>
  );
}
