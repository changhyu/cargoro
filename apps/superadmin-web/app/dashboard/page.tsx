'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { Button } from '@cargoro/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@cargoro/ui';

/**
 * 슈퍼 관리자 대시보드 페이지
 * 관리자와 슈퍼 관리자만 접근 가능
 */
export default function DashboardPage() {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  const profile = user
    ? {
        fullName: user.fullName || '',
        role: (user.publicMetadata?.role as string) || 'admin',
      }
    : null;

  const logout = async () => {
    await signOut();
  };

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h2 className="mb-2 text-xl font-bold text-gray-700">로딩 중...</h2>
        <p className="text-gray-600">사용자 정보를 불러오는 중입니다.</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="mb-2 text-xl font-bold text-red-700">로그인이 필요합니다</h2>
        <p className="text-red-600">이 페이지에 접근하려면 로그인이 필요합니다.</p>
      </div>
    );
  }

  // 역할 검사
  const userRole = (user?.publicMetadata?.role as string) || '';
  const hasAccess = userRole === 'admin' || userRole === 'super_admin';

  if (!hasAccess) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="mb-2 text-xl font-bold text-red-700">접근 권한 없음</h2>
        <p className="text-red-600">이 페이지는 관리자만 접근할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen bg-gray-50 p-6 dark:bg-gray-800">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">관리자 대시보드</h1>
        <Button variant="outline" onClick={logout}>
          로그아웃
        </Button>
      </div>

      {profile && (
        <Card className="mb-6 dark:bg-gray-700 dark:text-white">
          <CardHeader>
            <CardTitle>환영합니다, {profile.fullName}님!</CardTitle>
            <CardDescription className="dark:text-gray-300">역할: {profile.role}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>시스템 전체 상태를 관리하세요.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="dark:bg-gray-700 dark:text-white">
          <CardHeader>
            <CardTitle>사용자 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <p>총 사용자: 542명</p>
            <p>활성 사용자: 412명</p>
            <p>신규 가입(30일): 48명</p>
            <p>정지된 계정: 5개</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-700 dark:text-white">
          <CardHeader>
            <CardTitle>시스템 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <p>서버 상태: 정상</p>
            <p>API 성능: 좋음</p>
            <p>오류 발생률: 0.05%</p>
            <p>평균 응답 시간: 121ms</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-700 dark:text-white">
          <CardHeader>
            <CardTitle>알림</CardTitle>
          </CardHeader>
          <CardContent>
            <p>중요: 2건</p>
            <p>경고: 5건</p>
            <p>정보: 12건</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-700 dark:text-white">
          <CardHeader>
            <CardTitle>플랫폼 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <p>워크샵 앱: 125명 활성</p>
            <p>법인 차량 앱: 45명 활성</p>
            <p>부품 관리 앱: 32명 활성</p>
            <p>모바일 앱: 210명 활성</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-700 dark:text-white">
          <CardHeader>
            <CardTitle>최근 이벤트</CardTitle>
          </CardHeader>
          <CardContent>
            <p>시스템 업데이트: 2시간 전</p>
            <p>보안 경고: 5시간 전</p>
            <p>서버 재시작: 2일 전</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-700 dark:text-white">
          <CardHeader>
            <CardTitle>보안</CardTitle>
          </CardHeader>
          <CardContent>
            <p>로그인 시도: 452건 (24시간)</p>
            <p>실패한 로그인: 23건</p>
            <p>의심스러운 활동: 2건</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
