import React from 'react';
import { ScheduleCalendar } from '@/app/features/schedule-management/components/ScheduleCalendar';

// 동적 렌더링 강제 (Clerk 인증 때문에 SSG 불가능)
export const dynamic = 'force-dynamic';

export default function SchedulePage() {
  // 정비사 목록 (실제로는 API에서 가져와야 함)
  const technicians = [
    { id: '1', name: '김정비' },
    { id: '2', name: '이수리' },
    { id: '3', name: '박기술' },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">일정 관리</h1>
        <p className="text-muted-foreground">정비소의 모든 일정을 관리합니다.</p>
      </div>

      <ScheduleCalendar technicians={technicians} />
    </div>
  );
}

export const metadata = {
  title: '일정 관리 | CarGoro 정비소 관리 시스템',
  description: '정비소 일정 관리 시스템',
};
