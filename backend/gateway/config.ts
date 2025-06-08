/**
 * 애플리케이션 구성 관리
 *
 * 개발, 테스트, 프로덕션 환경별 설정을 관리합니다.
 */

// 환경 변수에서 값 로드 (기본값 설정)
const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const REQUEST_TIMEOUT = process.env.REQUEST_TIMEOUT ? parseInt(process.env.REQUEST_TIMEOUT) : 30000; // 30초

// 마이크로서비스 기본 URL 설정
const DEFAULT_SERVICE_URL_PREFIX = process.env.SERVICE_URL_PREFIX || 'http://localhost';
const DEFAULT_SERVICE_PORTS = {
  auth: 8001,
  users: 8002,
  vehicle: 8003,
  workshop: 8004,
  parts: 8005,
  delivery: 8006,
  fleet: 8007,
  repair: 8008,
  core_api: 8009,
  booking: 8010,
};

// 환경 변수에서 서비스 URL 오버라이드 가능
const SERVICE_URLS = {
  auth:
    process.env.AUTH_SERVICE_URL || `${DEFAULT_SERVICE_URL_PREFIX}:${DEFAULT_SERVICE_PORTS.auth}`,
  users:
    process.env.USERS_SERVICE_URL || `${DEFAULT_SERVICE_URL_PREFIX}:${DEFAULT_SERVICE_PORTS.users}`,
  vehicle:
    process.env.VEHICLE_SERVICE_URL ||
    `${DEFAULT_SERVICE_URL_PREFIX}:${DEFAULT_SERVICE_PORTS.vehicle}`,
  workshop:
    process.env.WORKSHOP_SERVICE_URL ||
    `${DEFAULT_SERVICE_URL_PREFIX}:${DEFAULT_SERVICE_PORTS.workshop}`,
  parts:
    process.env.PARTS_SERVICE_URL || `${DEFAULT_SERVICE_URL_PREFIX}:${DEFAULT_SERVICE_PORTS.parts}`,
  delivery:
    process.env.DELIVERY_SERVICE_URL ||
    `${DEFAULT_SERVICE_URL_PREFIX}:${DEFAULT_SERVICE_PORTS.delivery}`,
  fleet:
    process.env.FLEET_SERVICE_URL || `${DEFAULT_SERVICE_URL_PREFIX}:${DEFAULT_SERVICE_PORTS.fleet}`,
  repair:
    process.env.REPAIR_SERVICE_URL ||
    `${DEFAULT_SERVICE_URL_PREFIX}:${DEFAULT_SERVICE_PORTS.repair}`,
  core_api:
    process.env.CORE_API_SERVICE_URL ||
    `${DEFAULT_SERVICE_URL_PREFIX}:${DEFAULT_SERVICE_PORTS.core_api}`,
  booking:
    process.env.BOOKING_SERVICE_URL ||
    `${DEFAULT_SERVICE_URL_PREFIX}:${DEFAULT_SERVICE_PORTS.booking}`,
};

// 애플리케이션 설정 객체
export const config = {
  // 서버 설정
  port: PORT,
  nodeEnv: NODE_ENV,

  // CORS 설정
  corsOrigins: CORS_ORIGIN.split(','),

  // 마이크로서비스 URL
  services: SERVICE_URLS,

  // JWT 설정
  jwt: {
    secret: JWT_SECRET,
    expiresIn: JWT_EXPIRES_IN,
  },

  // 로깅 설정
  logging: {
    level: LOG_LEVEL,
    prettyPrint: NODE_ENV === 'development',
  },

  // 속도 제한 설정
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15분
    maxRequests: 100, // 15분당 최대 요청 수
  },

  // 요청 타임아웃 (밀리초)
  requestTimeout: REQUEST_TIMEOUT,
};

// 환경별 설정 오버라이드
if (NODE_ENV === 'development') {
  // 개발 환경 특화 설정
  config.logging.level = 'debug';
} else if (NODE_ENV === 'test') {
  // 테스트 환경 특화 설정
  config.logging.level = 'error';
  config.rateLimit.maxRequests = 1000; // 테스트에서는 제한 완화
} else if (NODE_ENV === 'production') {
  // 프로덕션 환경 특화 설정
  config.logging.prettyPrint = false;
}

export default config;
