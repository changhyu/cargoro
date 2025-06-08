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
      <div className="bg-parts-primary relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              CarGoro 부품 관리 시스템
            </h1>
            <p className="mt-6 text-xl text-green-100">
              효율적인 자동차 부품 재고 및 공급망 관리 솔루션
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="/login"
                className="rounded-md bg-white px-8 py-3 text-base font-medium text-green-600 shadow-sm hover:bg-green-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                로그인
              </Link>
              <Link
                href="/sign-up"
                className="rounded-md bg-transparent px-8 py-3 text-base font-medium text-white ring-1 ring-white hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400"
              >
                회원가입
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 기능 소개 섹션 */}
      <div className="px-6 py-16 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            부품 관리의 모든 것
          </h2>
          <p className="mt-4 text-center text-lg text-gray-600">
            재고 관리부터 발주, 공급망 관리까지 모든 부품 관련 업무를 한 곳에서 관리하세요.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* 기능 1 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900">실시간 재고 추적</h3>
              <p className="mt-2 text-gray-600">
                모든 부품의 재고 상태를 실시간으로 확인하고 관리하세요.
              </p>
            </div>

            {/* 기능 2 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900">지능형 발주 시스템</h3>
              <p className="mt-2 text-gray-600">
                재고 수준에 따라 자동으로 발주 제안을 받고 효율적으로 관리하세요.
              </p>
            </div>

            {/* 기능 3 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900">공급업체 관리</h3>
              <p className="mt-2 text-gray-600">
                다양한 공급업체 정보와 계약 조건을 체계적으로 관리하세요.
              </p>
            </div>

            {/* 기능 4 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900">가격 최적화</h3>
              <p className="mt-2 text-gray-600">
                부품 가격을 분석하고 최적의 구매 전략을 수립하세요.
              </p>
            </div>

            {/* 기능 5 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900">품질 관리</h3>
              <p className="mt-2 text-gray-600">
                부품의 품질을 지속적으로 모니터링하고 관리하세요.
              </p>
            </div>

            {/* 기능 6 */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900">통합 보고서</h3>
              <p className="mt-2 text-gray-600">
                부품 재고와 사용 패턴에 대한 포괄적인 보고서를 확인하세요.
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
              &copy; 2025 CarGoro. 모든 권리 보유.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
