'use client';

import { useUser } from '@clerk/nextjs';
import { Button, Skeleton } from '@cargoro/ui';

/**
 * 사용자 프로필 요약 컴포넌트
 * 2025년 6월 기준 최신 Clerk 사용 예제
 */
export function UserProfileSummary() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="rounded-lg border p-4 shadow-sm">
        <Skeleton className="mb-4 h-8 w-[200px]" />
        <Skeleton className="mb-2 h-4 w-[150px]" />
        <Skeleton className="h-4 w-[180px]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border bg-yellow-50 p-4 shadow-sm">
        <p className="text-yellow-700">로그인이 필요합니다</p>
        <Button variant="outline" className="mt-2" asChild>
          <a href="/sign-in">로그인 하기</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
          {user.firstName?.charAt(0) || ''}
          {user.lastName?.charAt(0) || ''}
        </div>
        <div>
          <h3 className="text-lg font-medium">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-sm text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <h4 className="mb-2 text-sm font-medium text-gray-700">계정 정보</h4>
        <div className="grid gap-1 text-sm">
          <p className="text-gray-600">
            마지막 로그인:{' '}
            {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString('ko-KR') : '기록 없음'}
          </p>
          <p className="text-gray-600">
            계정 생성일:{' '}
            {user.createdAt ? new Date(user.createdAt).toLocaleString('ko-KR') : '알 수 없음'}
          </p>
        </div>
      </div>
    </div>
  );
}
