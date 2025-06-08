import { SignIn } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-violet-600">
            <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-100">카고로 관리자</h1>
          <p className="mt-2 text-gray-400">시스템 관리자 로그인</p>
        </div>

        <SignIn
          appearance={{
            baseTheme: dark,
            elements: {
              rootBox: 'w-full',
              card: 'bg-gray-800 border border-gray-700 shadow-2xl',
              headerTitle: 'text-gray-100',
              headerSubtitle: 'text-gray-400',
              socialButtonsBlockButton:
                'bg-gray-700 border border-gray-600 hover:bg-gray-600 text-gray-200',
              dividerRow: 'my-6',
              dividerText: 'text-gray-500',
              formButtonPrimary: 'bg-violet-600 hover:bg-violet-700 text-white',
              formFieldLabel: 'text-gray-300',
              formFieldInput:
                'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-violet-500 focus:ring-violet-500',
              footerActionLink: 'text-violet-400 hover:text-violet-300',
              identityPreviewText: 'text-gray-300',
              identityPreviewEditButton: 'text-violet-400 hover:text-violet-300',
              formFieldInputShowPasswordButton: 'text-gray-400 hover:text-gray-300',
              otpCodeFieldInput: 'bg-gray-700 border-gray-600 text-gray-100',
              formResendCodeLink: 'text-violet-400 hover:text-violet-300',
            },
            layout: {
              socialButtonsPlacement: 'bottom',
              socialButtonsVariant: 'blockButton',
            },
          }}
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            접근 권한이 필요한 경우 시스템 관리자에게 문의하세요
          </p>
        </div>
      </div>
    </div>
  );
}
