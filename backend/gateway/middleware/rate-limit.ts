import rateLimit from 'express-rate-limit';

export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 윈도우 당 최대 요청 수
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// 더 엄격한 rate limiting (인증 관련)
export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 인증 시도는 더 제한적으로
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API별 커스텀 rate limiting
export const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 30, // 분당 30개 요청
  message: {
    error: 'API rate limit exceeded, please slow down.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export { rateLimitMiddleware as rateLimit };
