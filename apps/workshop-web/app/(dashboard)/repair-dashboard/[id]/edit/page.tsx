import React from 'react';
import { RepairJobForm } from '@/app/features/repair-management/components/repair-job-form';

interface EditRepairJobPageProps {
  params: {
    id: string;
  };
}

export default function EditRepairJobPage({ params }: EditRepairJobPageProps) {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">정비 작업 수정</h1>
        <p className="text-muted-foreground">정비 작업 정보를 수정합니다.</p>
      </div>

      <RepairJobForm repairId={params.id} />
    </div>
  );
}
