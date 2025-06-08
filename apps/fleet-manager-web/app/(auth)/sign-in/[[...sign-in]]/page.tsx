import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      {/* 왼쪽: 브랜딩 영역 */}
      <div className="relative hidden bg-emerald-600 lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-800" />
        <div className="relative z-10 flex w-full flex-col items-center justify-center px-12">
          <div className="text-center text-white">
            <h1 className="mb-4 text-5xl font-bold">카고로 플릿 매니저</h1>
            <p className="mb-8 text-xl">스마트한 차량 관리 시스템</p>
            <div className="max-w-md space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <svg className="mt-0.5 h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold">실시간 차량 추적</h3>
                  <p className="text-emerald-100">모든 차량의 위치를 한눈에 확인</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="mt-0.5 h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold">운전자 관리</h3>
                  <p className="text-emerald-100">운전 습관 분석 및 안전 관리</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="mt-0.5 h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold">유지보수 관리</h3>
                  <p className="text-emerald-100">예방 정비 및 비용 절감</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽: 로그인 폼 */}
      <div className="flex w-full items-center justify-center px-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">카고로 플릿 매니저</h1>
            <p className="text-gray-600">로그인하여 시작하세요</p>
          </div>

          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none p-0',
                headerTitle: 'hidden lg:block',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'border-2 border-gray-300 hover:border-gray-400',
                dividerRow: 'my-6',
                formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white py-3',
                footerActionLink: 'text-emerald-600 hover:text-emerald-700 font-medium',
              },
              layout: {
                socialButtonsPlacement: 'top',
                socialButtonsVariant: 'iconButton',
              },
            }}
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
          />
        </div>
      </div>
    </div>
  );
}
