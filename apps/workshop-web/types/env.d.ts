declare namespace NodeJS {
  interface ProcessEnv {
    // Clerk 환경변수
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
    CLERK_SECRET_KEY: string;
    NEXT_PUBLIC_CLERK_SIGN_IN_URL?: string;
    NEXT_PUBLIC_CLERK_SIGN_UP_URL?: string;
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL?: string;
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL?: string;
    CLERK_WEBHOOK_SIGNING_SECRET?: string;

    // 앱 환경변수
    NEXT_PUBLIC_APP_URL?: string;
    NEXT_PUBLIC_API_URL?: string;
    NEXT_PUBLIC_WEBSOCKET_URL?: string;

    // 결제 환경변수
    NEXT_PUBLIC_TOSS_CLIENT_KEY?: string;
    TOSS_SECRET_KEY?: string;

    // 분석 환경변수
    NEXT_PUBLIC_SENTRY_DSN?: string;
    NEXT_PUBLIC_POSTHOG_KEY?: string;
    NEXT_PUBLIC_POSTHOG_HOST?: string;

    // 기타
    NODE_ENV: 'development' | 'test' | 'production';
    GENERATE_SOURCEMAP?: string;
    NEXT_TELEMETRY_DISABLED?: string;
    SKIP_LINT?: string;
    SKIP_TYPE_CHECK?: string;
  }
}
