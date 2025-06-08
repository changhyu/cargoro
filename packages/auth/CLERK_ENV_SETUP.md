# Clerk 환경 변수 설정 가이드

## 1. 루트 .env 파일 설정

모노레포 루트에 `.env` 파일을 만들고 다음 변수들을 설정하세요:

```bash
# Clerk 인증 키
CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here

# Clerk URL 설정
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Expo 앱용
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

## 2. 각 앱별 .env.local 설정

### workshop-web/.env.local

```bash
# 워크샵 웹 전용 리다이렉트 URL
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/workshop/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/workshop/onboarding
```

### fleet-manager-web/.env.local

```bash
# 플릿 매니저 전용 리다이렉트 URL
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/fleet/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/fleet/setup
```

### superadmin-web/.env.local

```bash
# 슈퍼어드민 전용 리다이렉트 URL
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/admin/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/admin/setup
```

### parts-web/.env.local

```bash
# 부품 웹 전용 리다이렉트 URL
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/parts/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/parts/welcome
```

## 3. Turbo.json 업데이트

```json
{
  "globalEnv": [
    "NODE_ENV",
    "ENVIRONMENT",
    "NEXT_PUBLIC_*",
    "VITE_*",
    "EXPO_*",
    "CLERK_SECRET_KEY",
    "CLERK_PUBLISHABLE_KEY"
  ]
}
```

## 4. Vercel 배포 설정

Vercel 프로젝트 설정에서 다음 환경 변수들을 추가하세요:

### Production

- `CLERK_SECRET_KEY`: sk_live_your_production_key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: pk_live_your_production_key

### Preview

- `CLERK_SECRET_KEY`: sk_test_your_test_key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: pk_test_your_test_key

## 5. OAuth 리다이렉트 URL 설정

Clerk 대시보드에서 각 앱에 맞는 OAuth 리다이렉트 URL을 설정하세요:

### 웹 앱들

- https://workshop.cargoro.com/sso-callback
- https://fleet.cargoro.com/sso-callback
- https://admin.cargoro.com/sso-callback
- https://parts.cargoro.com/sso-callback

### 모바일 앱

- cargoro-workshop://oauth-native-callback
- cargoro-delivery://oauth-native-callback

## 6. Webhook 설정 (선택사항)

Webhook을 사용하는 경우:

```bash
# 루트 .env
CLERK_WEBHOOK_SIGNING_SECRET=whsec_your_webhook_secret
```

Clerk 대시보드에서 Webhook endpoint 설정:

- https://api.cargoro.com/api/webhooks/clerk
