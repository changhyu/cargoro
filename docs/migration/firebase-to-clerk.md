# Firebase에서 Clerk으로 인증 시스템 마이그레이션 가이드

## 개요

CarGoro 플랫폼은 Firebase Authentication에서 Clerk으로 인증 시스템을 마이그레이션했습니다. 이 문서는 마이그레이션 과정과 개발자가 알아야 할 변경 사항을 설명합니다.

## 주요 변경 사항

### 1. 인증 훅 사용

**이전 (Firebase)**:

```tsx
import { useFirebaseAuth } from '@cargoro/auth';

function MyComponent() {
  const { user, isLoading, isAuthenticated } = useFirebaseAuth();
  // ...
}
```

**현재 (Clerk)**:

```tsx
import { useAuth } from '@cargoro/auth';

function MyComponent() {
  const { user, isLoading, isAuthenticated } = useAuth();
  // ...
}
```

### 2. 보호된 라우트 컴포넌트

**이전 (Firebase)**:

```tsx
import { FirebaseProtectedRoute } from '@cargoro/auth';

function MyPage() {
  return (
    <FirebaseProtectedRoute allowedRoles={['ADMIN']}>
      <AdminDashboard />
    </FirebaseProtectedRoute>
  );
}
```

**현재 (Clerk)**:

```tsx
import { ProtectedRoute } from '@cargoro/auth';

function MyPage() {
  return (
    <ProtectedRoute requiredPermission="admin.access">
      <AdminDashboard />
    </ProtectedRoute>
  );
}
```

### 3. 인증 관련 함수

**이전 (Firebase)**:

```tsx
import { loginWithEmailPassword, logout } from '@cargoro/auth';

// 로그인
await loginWithEmailPassword(email, password);

// 로그아웃
await logout();
```

**현재 (Clerk)**:

```tsx
import { useAuth } from '@cargoro/auth';

function LoginComponent() {
  const { signIn, signOut } = useAuth();

  // 로그인
  await signIn(email, password);

  // 로그아웃
  await signOut();
}
```

### 4. 모바일 앱 인증

**이전 (Firebase)**:

```tsx
import {
  loginWithEmailPassword,
  logout as firebaseLogout,
  getMobileAuthToken,
  setMobileAuthToken,
} from '@cargoro/auth';

// 로그인 후 토큰 저장
const result = await loginWithEmailPassword(email, password);
const token = await result.user.getIdToken();
await setMobileAuthToken(token);

// 로그아웃
await firebaseLogout();
```

**현재 (Clerk)**:

```tsx
import { useClerkAuth, setMobileAuthToken, clearMobileAuthState } from '@cargoro/auth';

function AuthComponent() {
  const clerkAuth = useClerkAuth();

  // 로그인 후 토큰 저장
  await clerkAuth.signIn(email, password);
  const token = await clerkAuth.getToken();
  await setMobileAuthToken(token);

  // 로그아웃
  await clerkAuth.signOut();
  await clearMobileAuthState();
}
```

## 마이그레이션 체크리스트

- [x] useAuth 훅으로 전환 (useFirebaseAuth 대신)
- [x] ProtectedRoute 컴포넌트 사용 (FirebaseProtectedRoute 대신)
- [x] Clerk의 signIn/signOut 메서드 사용
- [x] 토큰 저장/처리 방식 업데이트
- [x] 백엔드 API 인증 헤더 설정 확인
- [x] 사용자 역할 및 권한 처리 확인

## 주의 사항

1. Clerk은 세션 기반 인증을 사용하므로 토큰 관리가 Firebase와 다릅니다.
2. 사용자 메타데이터 관리 방식이 변경되었습니다. Clerk의 publicMetadata 필드를 사용합니다.
3. 백엔드 API 호출 시 인증 헤더 설정 방식을 검토하세요.

## 삭제된 레거시 파일

마이그레이션 완료 후 다음 파일들이 제거되었습니다:

- `packages/auth/firebase.ts`
- `packages/auth/hooks/use-firebase-auth.ts`
- `packages/auth/components/firebase-protected-route.tsx`

## 문제 해결

마이그레이션 관련 문제가 발생하면 개발 팀에 문의하세요.
