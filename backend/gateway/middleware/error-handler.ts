import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// 에러 처리 미들웨어 타입 정의
interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
  code?: string;
}

/**
 * 중앙집중식 에러 처리 미들웨어
 * - 모든 에러를 잡아서 일관된 형식으로 응답
 * - 에러 로깅
 * - 에러 유형에 따라 적절한 HTTP 상태 코드 결정
 */
export function errorHandler(
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 에러 정보 추출
  const status = err.status || err.statusCode || 500;
  const message = err.message || '서버 내부 오류가 발생했습니다.';
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  // 에러 로깅 (심각도 설정)
  if (status >= 500) {
    logger.error({
      msg: `서버 오류: ${message}`,
      err,
      reqId: req.id,
      path: req.path,
      method: req.method,
      stack: err.stack,
    });
  } else {
    logger.warn({
      msg: `클라이언트 오류: ${message}`,
      err,
      reqId: req.id,
      path: req.path,
      method: req.method,
    });
  }

  // 클라이언트에게 보낼 응답
  const errorResponse = {
    error: {
      status,
      code: errorCode,
      message,
    },
    requestId: req.id,
    timestamp: new Date().toISOString(),
  };

  // 개발 환경에서는 스택 트레이스 포함
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    (errorResponse.error as any).stack = err.stack;
  }

  res.status(status).json(errorResponse);
}
