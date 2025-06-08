'use client';

import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@cargoro/ui';

/**
 * 사용자 상세 정보 클라이언트 컴포넌트
 */
export function UserDetails() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>사용자 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">정보를 불러오는 중...</p>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>사용자 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-600">인증된 사용자 정보를 찾을 수 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>사용자 상세 정보</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">이름</h3>
              <p className="mt-1">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">이메일</h3>
              <p className="mt-1">{user.emailAddresses?.[0]?.emailAddress}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">사용자 ID</h3>
            <p className="mt-1 rounded bg-gray-100 p-2 font-mono text-sm">{user.id}</p>
          </div>

          {user.phoneNumbers && user.phoneNumbers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">전화번호</h3>
              <p className="mt-1">{user.phoneNumbers[0]?.phoneNumber}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">생성일</h3>
              <p className="mt-1">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('ko-KR')
                  : '알 수 없음'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">마지막 업데이트</h3>
              <p className="mt-1">
                {user.updatedAt
                  ? new Date(user.updatedAt).toLocaleDateString('ko-KR')
                  : '알 수 없음'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
