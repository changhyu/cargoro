/**
 * 보호된 페이지 예제
 *
 * 이 예제는 Next.js 앱에서 RequireAuth 컴포넌트를 사용하여 페이지를 보호하는 방법을 보여줍니다.
 * 이 파일을 앱의 app/dashboard/page.tsx 파일로 저장하세요.
 */

'use client';

import React from 'react';
import { RequireAuth, useAuth } from '@cargoro/auth';

/**
 * 대시보드 페이지
 *
 * 인증된 사용자만 접근할 수 있는 대시보드 페이지입니다.
 */
export default function DashboardPage() {
  // 인증 정보 가져오기
  const { profile, isLoaded } = useAuth();

  // 로딩 상태 처리
  if (!isLoaded) {
    return (
      <div className="p-6">
        <div className="mb-4 h-8 w-48 animate-pulse rounded bg-gray-200"></div>
        <div className="mb-2 h-4 w-full animate-pulse rounded bg-gray-200"></div>
        <div className="mb-2 h-4 w-full animate-pulse rounded bg-gray-200"></div>
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
      </div>
    );
  }

  return (
    <RequireAuth
      // 특정 역할만 접근 허용 (선택 사항)
      roles={['admin', 'workshop_manager', 'workshop_staff']}
      // 특정 권한 필요 (선택 사항)
      permissions={['dashboard:view']}
      // 인증 실패 시 표시할 대체 컴포넌트 (선택 사항)
      fallback={
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <h2 className="mb-2 text-xl font-bold text-yellow-700">로그인 필요</h2>
          <p className="text-yellow-600">이 페이지를 보려면 로그인이 필요합니다.</p>
        </div>
      }
    >
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-bold">대시보드</h1>

        {profile && (
          <div className="mb-6">
            <p className="mb-2">
              안녕하세요, <span className="font-medium">{profile.fullName}</span>님!
            </p>
            <p className="text-sm text-gray-600">역할: {profile.role}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* 대시보드 콘텐츠 */}
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="mb-2 font-bold">최근 활동</h2>
            {/* 내용 */}
          </div>

          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="mb-2 font-bold">통계</h2>
            {/* 내용 */}
          </div>

          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="mb-2 font-bold">알림</h2>
            {/* 내용 */}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
