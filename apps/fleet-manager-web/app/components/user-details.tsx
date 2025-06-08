'use server';

// Mock auth and user functions
const mockAuth = () => ({
  userId: 'mock-user-id',
  sessionId: 'mock-session-id',
  orgId: null,
  orgRole: null,
  orgSlug: null,
});

const mockCurrentUser = () => ({
  id: 'mock-user-id',
  firstName: 'Mock',
  lastName: 'User',
  emailAddresses: [{ emailAddress: 'mock@example.com' }],
  phoneNumbers: [{ phoneNumber: '+82-10-1234-5678' }],
  imageUrl: '',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date(),
});

import { Card, CardContent, CardHeader, CardTitle } from '@cargoro/ui';

/**
 * 사용자 상세 정보 서버 컴포넌트
 * 2025년 6월 기준 최신 Clerk 서버 컴포넌트 활용 예제
 */
export async function UserDetails() {
  const { userId } = mockAuth();
  const user = mockCurrentUser();

  if (!userId || !user) {
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
              <p className="mt-1">{user.emailAddresses[0]?.emailAddress}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">사용자 ID</h3>
            <p className="mt-1 rounded bg-gray-100 p-2 font-mono text-sm">{userId}</p>
          </div>

          {user.phoneNumbers && user.phoneNumbers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">전화번호</h3>
              <p className="mt-1">{user.phoneNumbers[0].phoneNumber}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">생성일</h3>
              <p className="mt-1">{new Date(user.createdAt).toLocaleDateString('ko-KR')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">마지막 업데이트</h3>
              <p className="mt-1">{new Date(user.updatedAt).toLocaleDateString('ko-KR')}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
