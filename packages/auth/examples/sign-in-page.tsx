import { SignIn } from '@cargoro/auth/web';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-xl border-0',
            headerTitle: 'text-2xl font-bold',
            headerSubtitle: 'text-gray-600',
            socialButtonsBlockButton: 'border border-gray-300',
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
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
  );
}
