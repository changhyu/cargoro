import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { randomUUID } from 'crypto';
import { rateLimit } from 'express-rate-limit';

import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/error-handler';
import { logger } from './utils/logger';

// 애플리케이션 초기화
const app = express();

// 공통 미들웨어
app.use(
  cors({
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Total-Count', 'X-Token-Expires-Soon', 'X-Token-Expires-In'],
    credentials: true,
    maxAge: 86400, // 24시간
  })
);

// 보안 헤더 설정
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'https:'],
        connectSrc: ["'self'", ...config.corsOrigins],
      },
    },
    hsts: {
      maxAge: 31536000, // 1년
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// JSON 및 URL 인코딩 파싱
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 요청 로깅
app.use(
  pinoHttp({
    logger,
    customProps: _req => ({
      environment: config.nodeEnv,
    }),
    customLogLevel: (res, err) => {
      if (err) return 'error';
      if (res.statusCode && res.statusCode >= 400 && res.statusCode < 500) return 'warn';
      if (res.statusCode && res.statusCode >= 500) return 'error';
      return 'info';
    },
    // 요청 ID 생성 및 설정
    genReqId: req => {
      const existingId = req.headers['x-request-id'];
      if (existingId) return existingId.toString();
      return randomUUID();
    },
    customSuccessMessage: req => `${req.method} ${req.url} completed`,
    customErrorMessage: (req, res) =>
      `${req.method} ${req.url} failed with status ${res.statusCode || 500}`,
    serializers: {
      req: req => ({
        id: req.id,
        method: req.method,
        url: req.url,
        query: req.query,
        params: req.params,
        headers: {
          'user-agent': req.headers['user-agent'],
          'content-type': req.headers['content-type'],
          'x-request-id': req.headers['x-request-id'],
        },
      }),
      res: res => ({
        statusCode: res.statusCode,
        headers: {
          'content-type': res.getHeader('content-type'),
          'content-length': res.getHeader('content-length'),
        },
      }),
      err: err => ({
        type: err.constructor.name,
        message: err.message,
        stack: config.nodeEnv === 'development' ? err.stack : undefined,
        code: err.code,
        statusCode: err.statusCode,
      }),
    },
  })
);

// 요청 ID 미들웨어 - req.id로 모든 로그에서 요청 추적 가능
app.use((req: Request, _res: Response, next: NextFunction) => {
  const requestId = req.id;
  logger.debug({
    reqId: requestId,
    msg: `요청 시작: ${req.method} ${req.url}`,
  });
  next();
});

// Rate limiting - API 속도 제한
app.use(
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'error',
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
      },
    },
    keyGenerator: req => {
      // IP 주소 + 사용자 ID(있는 경우)로 제한
      const userId = req.userId || '';
      return `${req.ip}-${userId}`;
    },
  })
);

// API 문서 엔드포인트
app.use('/api-docs', (_, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>CarGoro API Gateway - API 문서</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          .endpoint { background: #f4f4f4; padding: 10px; margin-bottom: 10px; border-left: 3px solid #007bff; }
          .method { display: inline-block; padding: 3px 8px; border-radius: 3px; color: white; font-weight: bold; margin-right: 10px; }
          .get { background-color: #61affe; }
          .post { background-color: #49cc90; }
          .put { background-color: #fca130; }
          .delete { background-color: #f93e3e; }
          .url { font-family: monospace; }
          .description { margin-top: 5px; color: #555; }
        </style>
      </head>
      <body>
        <h1>CarGoro API Gateway</h1>
        <p>이 페이지는 CarGoro API Gateway의 주요 엔드포인트를 설명합니다.</p>

        <h2>인증</h2>
        <div class="endpoint">
          <span class="method post">POST</span> <span class="url">/api/auth/login</span>
          <div class="description">사용자 로그인</div>
        </div>
        <div class="endpoint">
          <span class="method post">POST</span> <span class="url">/api/auth/register</span>
          <div class="description">사용자 회원가입</div>
        </div>

        <h2>사용자</h2>
        <div class="endpoint">
          <span class="method get">GET</span> <span class="url">/api/users/me</span>
          <div class="description">현재 사용자 정보 조회</div>
        </div>

        <h2>차량</h2>
        <div class="endpoint">
          <span class="method get">GET</span> <span class="url">/api/vehicles</span>
          <div class="description">차량 목록 조회</div>
        </div>

        <h2>정비소</h2>
        <div class="endpoint">
          <span class="method get">GET</span> <span class="url">/api/workshops</span>
          <div class="description">정비소 목록 조회</div>
        </div>

        <h2>부품</h2>
        <div class="endpoint">
          <span class="method get">GET</span> <span class="url">/api/parts</span>
          <div class="description">부품 목록 조회</div>
        </div>

        <h2>예약</h2>
        <div class="endpoint">
          <span class="method get">GET</span> <span class="url">/api/bookings</span>
          <div class="description">예약 목록 조회</div>
        </div>
        <div class="endpoint">
          <span class="method get">GET</span> <span class="url">/api/bookings/:id</span>
          <div class="description">특정 예약 상세 조회</div>
        </div>

        <h2>시스템</h2>
        <div class="endpoint">
          <span class="method get">GET</span> <span class="url">/health</span>
          <div class="description">API 상태 확인</div>
        </div>
      </body>
    </html>
  `);
});

// 라우트 설정
app.use('/api', routes);

// 상태 확인 엔드포인트
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: config.nodeEnv,
    uptime: process.uptime(),
  });
});

// 404 처리
app.use((req: Request, _res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  (error as any).statusCode = 404;
  next(error);
});

// 오류 처리 미들웨어
app.use(errorHandler);

export { app };
