/**
 * CarGoro Sentry 통합 모듈
 * 프론트엔드 애플리케이션의 오류 추적 및 모니터링을 위한 Sentry 설정
 */

export interface SentryConfig {
  dsn: string;
  environment?: 'development' | 'staging' | 'production';
  debug?: boolean;
  tracesSampleRate?: number;
  profilesSampleRate?: number;
  enabled?: boolean;
}

// Type definitions for Sentry functions
type SeverityLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

// Optional Sentry import - graceful fallback if not available
interface SentryModuleType {
  init: (config: Record<string, unknown>) => void;
  captureException: (error: Error, options?: Record<string, unknown>) => void;
  captureMessage: (message: string, options?: Record<string, unknown>) => void;
  setUser: (user: Record<string, unknown>) => void;
  setTag: (key: string, value: string) => void;
  startTransaction: (options: Record<string, unknown>) => unknown;
  browserTracingIntegration?: () => unknown;
  replayIntegration?: (config: Record<string, unknown>) => unknown;
}

let SentryModule: SentryModuleType | null = null;

// Simple fallback approach for optional dependency
const initSentryModule = () => {
  try {
    // This will be replaced by bundler if available
    return eval('require("@sentry/nextjs")');
  } catch {
    return null;
  }
};

SentryModule = initSentryModule();

/**
 * Sentry 초기화 함수
 * @param config Sentry 설정 객체
 */
export const initSentry = (config: SentryConfig): void => {
  const {
    dsn,
    environment = 'development',
    debug = false,
    tracesSampleRate = 1.0,
    profilesSampleRate = 1.0,
    enabled = true,
  } = config;

  if (!enabled || !dsn || !SentryModule) {
    console.warn('Sentry가 비활성화되었거나 DSN이 제공되지 않았습니다.');
    return;
  }

  try {
    SentryModule.init({
      dsn,
      environment,
      debug,
      tracesSampleRate,
      profilesSampleRate,
      integrations: [
        SentryModule.browserTracingIntegration?.() || null,
        SentryModule.replayIntegration?.({
          maskAllText: true,
          blockAllMedia: true,
        }) || null,
      ].filter(Boolean),
      beforeSend(event: Record<string, unknown>) {
        // 민감 정보 제거 또는 수정
        const eventObj = event as {
          request?: {
            headers?: Record<string, string>;
          };
        };
        if (eventObj.request?.headers) {
          delete eventObj.request.headers['Authorization'];
          delete eventObj.request.headers['Cookie'];
        }
        return event;
      },
    });

    console.log(`Sentry가 초기화되었습니다. 환경: ${environment}`);
  } catch (error) {
    console.error('Sentry 초기화 중 오류가 발생했습니다:', error);
  }
};

/**
 * Sentry에 오류 보고
 * @param error 오류 객체
 * @param context 추가 컨텍스트 정보
 */
export const captureException = (error: Error, context?: Record<string, unknown>): void => {
  if (!SentryModule) {
    console.error('Analytics Error:', error, context);
    return;
  }

  SentryModule.captureException(error, {
    extra: context,
  });
};

/**
 * Sentry에 메시지 보고
 * @param message 메시지 내용
 * @param level 로그 레벨
 * @param context 추가 컨텍스트 정보
 */
export const captureMessage = (
  message: string,
  level: SeverityLevel = 'info',
  context?: Record<string, unknown>
): void => {
  if (!SentryModule) {
    console.log(`Analytics Message [${level}]:`, message, context);
    return;
  }

  SentryModule.captureMessage(message, {
    level,
    extra: context,
  });
};

/**
 * Sentry 사용자 정보 설정
 * @param user 사용자 정보
 */
export const setUser = (user: { id: string; email?: string; username?: string }): void => {
  if (!SentryModule) return;
  SentryModule.setUser(user);
};

/**
 * Sentry 태그 설정
 * @param key 태그 키
 * @param value 태그 값
 */
export const setTag = (key: string, value: string): void => {
  if (!SentryModule) return;
  SentryModule.setTag(key, value);
};

/**
 * 현재 Sentry 트랜잭션 시작
 * @param name 트랜잭션 이름
 * @param options 트랜잭션 옵션
 */
export const startTransaction = (name: string, options?: Record<string, unknown>): unknown => {
  if (!SentryModule) return null;
  return SentryModule.startTransaction({ name, ...options });
};

export default {
  initSentry,
  captureException,
  captureMessage,
  setUser,
  setTag,
  startTransaction,
};
