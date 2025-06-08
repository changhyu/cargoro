/**
 * 로깅 유틸리티
 *
 * 서버 및 클라이언트 측 로깅을 위한 일관된 인터페이스를 제공합니다.
 * 실제 프로덕션 환경에서는 Sentry, CloudWatch 등 외부 로깅 서비스로 연결될 수 있습니다.
 */

/**
 * 로그 레벨
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// 개발 환경인지 확인하는 안전한 방식
const isDevelopment =
  typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development';

/**
 * 로깅 유틸리티
 */
export const logger = {
  /**
   * 디버그 로그
   */
  debug: (_message: string, ..._args: unknown[]) => {
    if (isDevelopment) {
      // 개발 환경에서만 디버그 로그 기록
      // 실제 프로덕션에서는 로깅 서비스로 전송
    }
  },

  /**
   * 정보 로그
   */
  info: (_message: string, ..._args: unknown[]) => {
    if (isDevelopment) {
      // 개발 환경에서만 정보 로그 기록
      // 실제 프로덕션에서는 로깅 서비스로 전송
    }
  },

  /**
   * 경고 로그
   */
  warn: (_message: string, ..._args: unknown[]) => {
    if (isDevelopment) {
      // 개발 환경에서만 경고 로그 기록
      // 실제 프로덕션에서는 로깅 서비스로 전송
    }
  },

  /**
   * 오류 로그
   */
  error: (_message: string, ..._args: unknown[]) => {
    if (isDevelopment) {
      // 개발 환경에서만 오류 로그 기록
      // 실제 프로덕션에서는 로깅 서비스로 전송
    }
  },
};

export default logger;
