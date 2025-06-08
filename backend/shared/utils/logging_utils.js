/**
 * JavaScript 로깅 유틸리티
 */

/**
 * 로거 설정 함수
 * @param {string} module - 모듈명
 * @returns {object} 로거 객체
 */
export function setupLogger(module) {
  const prefix = `[${module}]`;

  return {
    info: (message, ...args) => {
      console.log(`${prefix} INFO:`, message, ...args);
    },
    error: (message, ...args) => {
      console.error(`${prefix} ERROR:`, message, ...args);
    },
    warn: (message, ...args) => {
      console.warn(`${prefix} WARN:`, message, ...args);
    },
    debug: (message, ...args) => {
      console.debug(`${prefix} DEBUG:`, message, ...args);
    },
  };
}

export default setupLogger;
