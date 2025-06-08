# @cargoro/auth - Clerk 인증 패키지

모노레포의 모든 앱에서 사용할 수 있는 중앙화된 Clerk 인증 설정입니다.

## 설치

이 패키지는 이미 모노레포에 포함되어 있으므로 별도 설치가 필요 없습니다.

## 빠른 시작

### 1. 환경 변수 설정

루트 `.env` 파일에 다음을 추가하세요:

```bash
CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 2. 미들웨어 설정

앱 루트에 `middleware.ts` 파일을 생성하세요:

```typescript
import { createClerkMiddleware } from '@cargoro/auth/server';

export default createClerkMiddleware({
  protected: ['/dashboard(.*)'],
  public: ['/', '/api/public(.*)'],
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### 3. Layout 설정

`app/layout.tsx`에 ClerkProvider를 추가하세요:

```typescript
import { ClerkProvider } from '@cargoro/auth/web';
import { getAuthConfig } from '@cargoro/auth/config/auth-config';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider {...getAuthConfig('your-app-name')}>
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

## 사용 예제

### 인증 상태 확인 (클라이언트)

```typescript
import { useAuth, useUser } from '@cargoro/auth/web';

export function Dashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return <div>로딩 중...</div>;
  }

  if (!isSignedIn) {
    return <div>로그인이 필요합니다.</div>;
  }

  return <div>안녕하세요, {user?.firstName}님!</div>;
}
```

### 인증 상태 확인 (서버)

```typescript
import { auth, currentUser } from '@cargoro/auth/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const user = await currentUser();
  return Response.json({ user });
}
```

### 로그인/회원가입 페이지

```typescript
import { SignIn } from '@cargoro/auth/web';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
```

### UserButton 컴포넌트

```typescript
import { UserButton } from '@cargoro/auth/web';

export function Header() {
  return (
    <header>
      <nav>
        {/* 다른 네비게이션 항목들 */}
        <UserButton afterSignOutUrl="/" />
      </nav>
    </header>
  );
}
```

## 모바일 앱 (Expo) 설정

### 1. 환경 변수

`.env`에 추가:

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 2. App Layout

```typescript
import { ClerkProvider } from '@cargoro/auth/mobile';
import { useClerkTokenCache } from '@cargoro/auth/hooks/useClerkTokenCache';

export default function RootLayout() {
  const tokenCache = useClerkTokenCache();

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      {/* 앱 내용 */}
    </ClerkProvider>
  );
}
```

### 3. 인증 가드

```typescript
import { MobileAuthGuard } from '@cargoro/auth/mobile';

export default function ProtectedScreen() {
  return (
    <MobileAuthGuard fallbackPath="/sign-in">
      <View>
        <Text>보호된 콘텐츠</Text>
      </View>
    </MobileAuthGuard>
  );
}
```

## 고급 기능

### 사용자 역할 관리

```typescript
import { checkUserRole, updateUserMetadata } from '@cargoro/auth/server';

// 역할 확인
await checkUserRole('admin');

// 메타데이터 업데이트
await updateUserMetadata(userId, {
  public: { role: 'manager' },
  private: { internalId: '12345' },
});
```

### Webhook 처리

```typescript
import { handleClerkWebhook } from '@cargoro/auth/server';

export async function POST(request: Request) {
  const event = await handleClerkWebhook(request);

  switch (event.type) {
    case 'user.created':
      // 새 사용자 처리
      break;
    case 'user.updated':
      // 사용자 업데이트 처리
      break;
  }

  return Response.json({ received: true });
}
```

### 조직 관리

```typescript
import { getOrganizationMembers, inviteUserToOrganization } from '@cargoro/auth/server';

// 조직 멤버 조회
const members = await getOrganizationMembers(orgId);

// 사용자 초대
await inviteUserToOrganization(orgId, 'user@example.com', 'member');
```

## 앱별 설정

각 앱은 `getAuthConfig()`를 통해 커스텀 설정을 가질 수 있습니다:

- `workshop-web`: 워크샵 대시보드로 리다이렉트
- `fleet-manager-web`: 플릿 대시보드로 리다이렉트
- `superadmin-web`: 어드민 대시보드로 리다이렉트
- `parts-web`: 부품 대시보드로 리다이렉트

## 문제 해결

### 환경 변수가 인식되지 않음

1. `turbo.json`의 `globalEnv`에 추가했는지 확인
2. `.env` 파일이 루트에 있는지 확인
3. 개발 서버를 재시작

### 미들웨어가 작동하지 않음

1. `middleware.ts`가 앱 루트에 있는지 확인
2. `matcher` 설정이 올바른지 확인
3. 보호된 경로와 공개 경로 설정 확인

### 타입 에러

1. 모든 앱에서 동일한 `@clerk/nextjs` 버전 사용
2. `tsconfig.json`의 경로 매핑 확인

## 추가 리소스

- [Clerk 공식 문서](https://clerk.com/docs)
- [환경 변수 설정 가이드](./CLERK_ENV_SETUP.md)
- [예제 코드](./examples/)
