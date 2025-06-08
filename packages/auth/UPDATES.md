# 주요 업데이트: 인증 관련 문제 해결 (2025-06-03)

Clerk 인증과 관련된 여러 문제가 수정되었습니다. 주요 변경 사항은 다음과 같습니다:

## 1. 클라이언트 컴포넌트 문제 해결

- `@clerk/clerk-react` 대신 `@clerk/nextjs`에서 직접 훅 가져오기
- ClerkProvider 컴포넌트 수정하여 내부 오류 수정
- 환경 감지 로직 Next.js 환경으로 고정

## 2. SWR 기본 내보내기 문제 해결

- `SWRProvider` 컴포넌트 추가하여 SWR 문제 해결
- 앱 레이아웃에 SWRProvider 적용

## 3. 서버 액션 관련 수정

- 서버 액션은 반드시 비동기 함수여야 함
- `lib/clerk.ts`에서 'use server' 지시어 제거
- 별도의 서버 액션 파일 생성 (`server-actions.ts`)

## 사용 방법

### 1. 클라이언트 컴포넌트에서 인증 사용

```tsx
'use client';
import { useAuth } from '@cargoro/auth/web';

export default function ProfileButton() {
  const { profile, logout } = useAuth();

  return <button onClick={logout}>{profile?.fullName} 로그아웃</button>;
}
```

### 2. 서버 액션 사용

```tsx
'use client';
import { auth, requireAuth } from '../actions/auth';

export default function ClientComponent() {
  const handleAuth = async () => {
    const { userId } = await auth();
    console.log(userId);
  };

  return <button onClick={handleAuth}>인증 확인</button>;
}
```

### 3. 서버 컴포넌트에서 인증 상태 확인

```tsx
import { auth } from '@cargoro/auth/server';

export default async function ServerComponent() {
  const { userId } = await auth();

  return <div>{userId ? <p>인증된 사용자: {userId}</p> : <p>로그인이 필요합니다</p>}</div>;
}
```

## 주의사항

1. 모든 인증 관련 컴포넌트는 반드시 `'use client';` 지시어로 시작해야 합니다.
2. 서버 액션은 항상 비동기 함수여야 합니다.
3. 클라이언트와 서버 간 모듈 충돌을 피하기 위해 정확한 경로로 가져오세요.
