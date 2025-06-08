# 클러크(Clerk) 인증 설정 가이드

모노레포 내 각 앱에 대한 Clerk 인증 설정 가이드입니다. 각 앱별로 커스터마이징된 인증 화면과 인증 흐름을 구현했습니다.

## 설치 방법

각 앱에 필요한 Clerk 패키지를 설치하려면 다음 스크립트를 실행하세요:

```bash
chmod +x ./update-clerk.sh
./update-clerk.sh
```

## 환경 변수 설정

각 앱에는 이미 다음과 같은 환경 변수 파일이 생성되어 있습니다:

### Next.js 앱 (.env.local)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZHJpdmluZy1raWQtMzYuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_IqEFUX9OiBA1UsQZg8lvXS9tIc0OP7lhb96jYQe6iz
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### React Native/Expo 앱 (.env)

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZHJpdmluZy1raWQtMzYuY2xlcmsuYWNjb3VudHMuZGV2JA
```

## 앱별 설정 파일 구조

### 1. 웹 앱 (Next.js)

각 웹 앱에는 다음과 같은 파일들이 설정되어 있습니다:

- **middleware.ts**: 앱별 인증 경로 및 공개 경로 설정
- **app/layout.tsx**: WebClerkProvider를 통한 인증 제공자 설정
- **app/page.tsx**: 앱 홈페이지 (로그인/회원가입 링크 포함)
- **app/sign-in/page.tsx**: 커스터마이징된 로그인 페이지
- **app/sign-up/page.tsx**: 커스터마이징된 회원가입 페이지
- **app/dashboard/page.tsx**: 보호된 대시보드 페이지

### 2. 모바일 앱 (React Native/Expo)

각 모바일 앱에는 다음과 같은 파일들이 설정되어 있습니다:

- **.env**: 환경 변수 설정
- **App.tsx**: MobileClerkProvider 및 인증 기반 네비게이션 설정

## 앱별 테마 및 스타일링

각 앱은 고유한 테마 및 스타일링을 적용하여 사용자 경험을 차별화했습니다:

1. **워크샵 웹 (workshop-web)**: 파란색 테마
2. **법인 차량 관리 웹 (fleet-manager-web)**: 인디고 테마
3. **부품 관리 웹 (parts-web)**: 청록색 테마
4. **슈퍼 관리자 웹 (superadmin-web)**: 다크 모드 & 보라색 테마
5. **탁송 기사 앱 (delivery-driver)**: 인디고 테마
6. **스마트카 어시스턴트 앱 (smart-car-assistant)**: 녹색 테마
7. **워크샵 모바일 앱 (workshop-mobile)**: 파란색 테마

## 역할 기반 접근 제어

다음 역할을 사용하여 앱 접근을 제한할 수 있습니다:

- **admin**, **super_admin**: 관리자 권한 (superadmin-web 앱)
- **workshop_manager**, **workshop_staff**: 워크샵 관련 권한 (workshop-web, workshop-mobile 앱)
- **fleet_manager**: 법인 차량 관리 권한 (fleet-manager-web 앱)
- **parts_manager**: 부품 관리 권한 (parts-web 앱)
- **delivery_driver**: 탁송 기사 권한 (delivery-driver 앱)
- **customer**: 일반 고객 권한

## 인증 흐름

1. 사용자가 앱 홈페이지 방문
2. "로그인" 또는 "시작하기" 버튼을 클릭하여 인증 페이지로 이동
3. Clerk UI를 통해 로그인 또는 회원가입 진행
4. 인증 성공 시 대시보드로 리다이렉트
5. RequireAuth 컴포넌트가 역할 및 권한 확인
6. 인증된 사용자는 보호된 콘텐츠에 접근 가능

## 개발 환경에서 인증 우회

개발 환경에서 인증을 우회하려면 `.env.local` 또는 `.env` 파일에서 다음 줄의 주석을 해제하세요:

```
# BYPASS_AUTH=true
```

이 설정은 개발 환경에서만 작동하며, 프로덕션 환경에서는 무시됩니다.

## 백엔드 통합

FastAPI 백엔드와 통합하는 방법은 `docs/examples/fastapi-clerk-example.py` 예제를 참조하세요. JWT 토큰 검증을 통해 API 접근을 제어할 수 있습니다.

## 추가 개발 작업

1. **로고 파일 추가**: 각 앱의 `/public` 디렉토리에 로고 파일을 추가하세요 (`logo.svg`, `logo-white.svg`).
2. **지원 페이지 구현**: 각 앱의 `/support` 경로에 지원 페이지를 구현하세요.
3. **사용자 프로필 페이지 구현**: 각 앱에 사용자 프로필 관리 페이지를 추가하세요.
4. **역할 기반 UI 요소**: 사용자 역할에 따라 다른 UI 요소를 표시하도록 구현하세요.
