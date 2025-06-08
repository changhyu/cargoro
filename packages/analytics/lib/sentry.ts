import * as Sentry from '@sentry/nextjs';

// Sentry 초기화 함수
export function initSentry() {
  // 환경에 따라 Sentry 활성화 여부 결정
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const environment = process.env.NODE_ENV;

  // DSN이 없거나 개발 환경이면 초기화하지 않음
  if (!dsn || environment === 'development') {
    console.log('Sentry not initialized: Missing DSN or development environment');
    return;
  }

  // 기본 설정 객체
  type SentryConfigExtended = Sentry.NodeOptions & {
    replaysSessionSampleRate?: number;
    replaysOnErrorSampleRate?: number;
    // Sentry 타입 시스템에 맞는 정확한 타입을 사용할 수 없어 unknown 사용
    integrations?: unknown[];
  };

  const sentryConfig: SentryConfigExtended = {
    dsn,
    environment,
    // 성능 모니터링 샘플링 비율 (0.1 = 10%)
    tracesSampleRate: 0.1,
  };

  // Replay 기능이 존재하는지 확인하고 조건부로 설정 추가
  if ('Replay' in Sentry) {
    // Sentry 타입 정의에서 누락된 속성들을 추가
    sentryConfig.replaysSessionSampleRate = 0.1;
    sentryConfig.replaysOnErrorSampleRate = 1.0;

    // integrations 배열에 Replay 추가
    // Sentry 타입 시스템 제한으로 unknown 타입 사용
    // @ts-expect-error: Sentry 타입 정의와 호환되지 않는 문제
    sentryConfig.integrations = [
      new (
        Sentry as {
          Replay: new (options: { maskAllText: boolean; blockAllMedia: boolean }) => unknown;
        }
      ).Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ];
  }

  // Sentry 초기화
  Sentry.init(sentryConfig);
}

// 사용자 정보 설정
export function setUserInfo(
  userInfo: {
    id?: string;
    email?: string;
    username?: string;
    role?: string;
  } | null
) {
  if (userInfo) {
    Sentry.setUser(userInfo);
  } else {
    Sentry.setUser(null);
  }
}

// 커스텀 태그 설정
export function setTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

// 커스텀 컨텍스트 설정
export function setContext(name: string, context: Record<string, unknown>) {
  Sentry.setContext(name, context);
}

// 명시적 에러 캡처
export function captureError(error: unknown, context?: Record<string, unknown>) {
  Sentry.captureException(error, { extra: context });
}

// 메시지 캡처
export function captureMessage(message: string, level?: Sentry.SeverityLevel) {
  Sentry.captureMessage(message, level);
}

// 트랜잭션 생성 및 추적
export function startTransaction(options: { name: string; op: string }) {
  return Sentry.startTransaction(options);
}

export { Sentry };

// Next.js에서 Sentry 설정을 위한 헬퍼 함수
interface NextJsSentryConfig {
  nextConfig?: Record<string, unknown>;
  sentryWebpackPluginOptions?: Record<string, unknown>;
  customErrorHandler?: (error: Error) => void;
}

export function initNextJsSentry(config: NextJsSentryConfig) {
  try {
    // 타입 단언으로 withSentryConfig 함수 호출
    type SentryWithConfig = {
      withSentryConfig: (
        nextConfig: Record<string, unknown>,
        sentryWebpackPluginOptions: Record<string, unknown>
      ) => unknown;
      setErrorHandler?: (handler: (error: Error) => void) => void;
    };

    const withSentryConfig = (Sentry as SentryWithConfig).withSentryConfig;
    if (typeof withSentryConfig === 'function') {
      withSentryConfig(config.nextConfig || {}, config.sentryWebpackPluginOptions || {});
    }

    initSentry();

    const sentryWithConfig = Sentry as SentryWithConfig;
    if (
      config.customErrorHandler &&
      sentryWithConfig.setErrorHandler &&
      typeof sentryWithConfig.setErrorHandler === 'function'
    ) {
      sentryWithConfig.setErrorHandler(config.customErrorHandler);
    }

    return true;
  } catch (error) {
    console.error('Sentry 초기화 오류:', error);
    return false;
  }
}
