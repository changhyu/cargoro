/**
 * 통합 로깅 시스템
 *
 * 개발 및 운영 환경에서 일관된 로깅을 제공하는 유틸리티 모듈입니다.
 * 환경 변수를 통해 로그 레벨을 제어할 수 있습니다.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

// 기본 로그 레벨 설정 (환경 변수에서 가져오거나 기본값 사용)
const DEFAULT_LOG_LEVEL =
  process.env.NODE_ENV === 'production'
    ? LogLevel.ERROR // 운영 환경에서는 에러 로그만 출력
    : LogLevel.DEBUG; // 개발 환경에서는 모든 로그 출력

// 현재 로그 레벨 (환경 변수에서 설정 가능)
let currentLogLevel = DEFAULT_LOG_LEVEL;

// 애플리케이션 이름 (로그 접두사로 사용)
const APP_NAME = 'FleetManager';

/**
 * 로그 레벨 설정
 * @param level 설정할 로그 레벨
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

/**
 * 현재 로그 레벨 반환
 */
export function getLogLevel(): LogLevel {
  return currentLogLevel;
}

/**
 * 로그 레벨 이름 반환
 */
function getLogLevelName(level: LogLevel): string {
  switch (level) {
    case LogLevel.DEBUG:
      return 'DEBUG';
    case LogLevel.INFO:
      return 'INFO';
    case LogLevel.WARN:
      return 'WARN';
    case LogLevel.ERROR:
      return 'ERROR';
    default:
      return 'UNKNOWN';
  }
}

/**
 * 로그 메시지 포맷팅
 */
function formatLogMessage(level: LogLevel, message: string): string {
  const timestamp = new Date().toISOString();
  const levelName = getLogLevelName(level);
  return `[${timestamp}] [${APP_NAME}] [${levelName}] ${message}`;
}

/**
 * 디버그 로그 출력
 * @param message 로그 메시지
 * @param data 추가 데이터 (선택 사항)
 */
export function logDebug(message: string, data?: unknown): void {
  if (currentLogLevel <= LogLevel.DEBUG) {
    const formattedMessage = formatLogMessage(LogLevel.DEBUG, message);
    if (data) {
      // eslint-disable-next-line no-console
      console.log(formattedMessage, data);
    } else {
      // eslint-disable-next-line no-console
      console.log(formattedMessage);
    }
  }
}

/**
 * 정보 로그 출력
 * @param message 로그 메시지
 * @param data 추가 데이터 (선택 사항)
 */
export function logInfo(message: string, data?: unknown): void {
  if (currentLogLevel <= LogLevel.INFO) {
    const formattedMessage = formatLogMessage(LogLevel.INFO, message);
    if (data) {
      // eslint-disable-next-line no-console
      console.info(formattedMessage, data);
    } else {
      // eslint-disable-next-line no-console
      console.info(formattedMessage);
    }
  }
}

/**
 * 경고 로그 출력
 * @param message 로그 메시지
 * @param data 추가 데이터 (선택 사항)
 */
export function logWarn(message: string, data?: unknown): void {
  if (currentLogLevel <= LogLevel.WARN) {
    const formattedMessage = formatLogMessage(LogLevel.WARN, message);
    if (data) {
      // eslint-disable-next-line no-console
      console.warn(formattedMessage, data);
    } else {
      // eslint-disable-next-line no-console
      console.warn(formattedMessage);
    }
  }
}

/**
 * 에러 로그 출력
 * @param message 로그 메시지
 * @param error 에러 객체 (선택 사항)
 */
export function logError(message: string, error?: unknown): void {
  if (currentLogLevel <= LogLevel.ERROR) {
    const formattedMessage = formatLogMessage(LogLevel.ERROR, message);
    if (error) {
      // eslint-disable-next-line no-console
      console.error(formattedMessage, error);
    } else {
      // eslint-disable-next-line no-console
      console.error(formattedMessage);
    }
  }
}

/**
 * 로거 객체 (모든 로그 함수를 포함)
 */
export const logger = {
  debug: logDebug,
  info: logInfo,
  warn: logWarn,
  error: logError,
  setLevel: setLogLevel,
  getLevel: getLogLevel,
};

export default logger;
