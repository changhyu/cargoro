/**
 * 정비 서비스 요청 관리 페이지
 */
'use client';

import {
  ServiceRequestList,
  CreateServiceRequestModal,
} from '../../features/service-request-management';

// 동적 렌더링 강제 (Clerk 인증 때문에 SSG 불가능)
export const dynamic = 'force-dynamic';

export default function ServiceRequestsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">서비스 요청 관리</h1>
        <CreateServiceRequestModal />
      </div>
      <ServiceRequestList />
    </div>
  );
}
