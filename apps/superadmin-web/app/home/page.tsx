import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function HomePage() {
  // 이미 인증된 사용자는 대시보드로 리디렉션
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 히어로 섹션 */}
      <div className="bg-admin-primary relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              CarGoro 관리자 시스템
            </h1>
            <p className="mt-6 text-xl text-indigo-100">
              플랫폼 전체를 관리하고 모니터링하는 통합 어드민 솔루션
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="/login"
                className="rounded-md bg-white px-8 py-3 text-base font-medium text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                로그인
              </Link>
              <Link
                href="/sign-up"
                className="rounded-md bg-transparent px-8 py-3 text-base font-medium text-white ring-1 ring-white hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                문의하기
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 보안 알림 */}
      <div className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">접근 제한</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    본 시스템은 CarGoro 관리자에게만 접근이 허용됩니다. 승인되지 않은 사용자의 접속
                    시도는 기록되며 법적 조치를 받을 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 기능 소개 섹션 */}
      <div className="px-6 py-16 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            관리자 시스템 기능
          </h2>
          <p className="mt-4 text-center text-lg text-gray-600">
            CarGoro 플랫폼의 모든 시스템을 한 곳에서 관리하고 모니터링 하세요.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* 기능 1 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900">사용자 관리</h3>
              <p className="mt-2 text-gray-600">
                모든 사용자 계정을 관리하고, 권한을 설정하며, 활동을 모니터링합니다.
              </p>
            </div>

            {/* 기능 2 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900">시스템 모니터링</h3>
              <p className="mt-2 text-gray-600">
                플랫폼의 모든 서비스와 인프라 상태를 실시간으로 모니터링합니다.
              </p>
            </div>

            {/* 기능 3 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900">통계 및 분석</h3>
              <p className="mt-2 text-gray-600">
                플랫폼 전반의 주요 지표와 사용 통계를 분석합니다.
              </p>
            </div>

            {/* 기능 4 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900">설정 관리</h3>
              <p className="mt-2 text-gray-600">시스템 설정과 구성을 중앙에서 관리합니다.</p>
            </div>

            {/* 기능 5 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900">결제 관리</h3>
              <p className="mt-2 text-gray-600">
                구독, 결제, 청구서 등 모든 금융 활동을 추적하고 관리합니다.
              </p>
            </div>

            {/* 기능 6 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900">API 관리</h3>
              <p className="mt-2 text-gray-600">
                API 키를 생성하고, 사용량을 모니터링하며, 접근을 제어합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-sm text-gray-500">
              &copy; 2025 CarGoro. 모든 권리 보유. | 관리자 전용 시스템
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
