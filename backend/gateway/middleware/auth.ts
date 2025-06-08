import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/logger';
import { createErrorResponse } from '../utils/response-utils';

// Express Request 인터페이스 확장
// @typescript-eslint/no-namespace 규칙 비활성화
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      role?: string;
      username?: string;
      isAuthenticated?: boolean;
      id?: string; // 요청 ID
      organizationId?: string; // 조직 ID
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

// 사용자 역할 상수
export enum UserRole {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  WORKSHOP_MANAGER = 'WORKSHOP_MANAGER',
  MECHANIC = 'MECHANIC',
  DRIVER = 'DRIVER',
  FLEET_MANAGER = 'FLEET_MANAGER',
  CUSTOMER = 'CUSTOMER',
  GUEST = 'GUEST',
}

// JWT 페이로드 인터페이스
interface JwtPayload {
  userId: string;
  role: string;
  username?: string;
  organizationId?: string;
  exp?: number;
  iat?: number;
}

/**
 * 인증 미들웨어
 * - JWT 토큰을 검증하고 사용자 정보를 요청에 추가
 * - 토큰이 유효하지 않거나 없는 경우 401 Unauthorized 반환
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      createErrorResponse(
        res,
        401,
        'UNAUTHORIZED',
        '인증이 필요합니다. 유효한 Bearer 토큰을 제공해주세요.'
      );
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      createErrorResponse(
        res,
        401,
        'UNAUTHORIZED',
        '인증이 필요합니다. 유효한 Bearer 토큰을 제공해주세요.'
      );
      return;
    }

    // JWT 검증
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // 사용자 정보 요청에 추가
    req.userId = decoded.userId;
    req.role = decoded.role;
    req.username = decoded.username;
    req.organizationId = decoded.organizationId;
    req.isAuthenticated = true;

    // 토큰 만료 임박 시 로깅 (갱신 알림 목적)
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp - now < 60 * 60) {
      // 1시간 이내 만료
      logger.warn({
        msg: '토큰 만료 임박',
        userId: decoded.userId,
        expiresIn: decoded.exp - now,
        reqId: req.id,
      });
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      createErrorResponse(res, 401, 'INVALID_TOKEN', '유효하지 않은 토큰입니다.');
      return;
    } else if (error instanceof jwt.TokenExpiredError) {
      createErrorResponse(res, 401, 'TOKEN_EXPIRED', '토큰이 만료되었습니다. 다시 로그인해주세요.');
      return;
    }

    logger.error({
      msg: '인증 처리 중 오류 발생',
      error,
      reqId: req.id,
    });

    createErrorResponse(res, 500, 'AUTHENTICATION_ERROR', '인증 처리 중 오류가 발생했습니다.');
  }
}

/**
 * 역할 기반 접근 제어 미들웨어
 * - 특정 역할을 가진 사용자만 접근 허용
 * - 권한이 없는 경우 403 Forbidden 반환
 */
export function roleMiddleware(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.isAuthenticated || !req.role) {
      createErrorResponse(res, 401, 'UNAUTHORIZED', '이 리소스에 접근하려면 로그인이 필요합니다.');
      return;
    }

    if (!allowedRoles.includes(req.role as UserRole)) {
      createErrorResponse(res, 403, 'FORBIDDEN', '이 리소스에 접근할 권한이 없습니다.');
      return;
    }

    next();
  };
}

/**
 * 조직 소속 확인 미들웨어
 * - 사용자가 특정 조직에 소속되어 있는지 확인
 * - 조직 소속이 없는 경우 403 Forbidden 반환
 */
export function organizationMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.organizationId) {
    createErrorResponse(res, 403, 'FORBIDDEN', '이 작업을 수행하려면 조직 소속이 필요합니다.');
    return;
  }

  next();
}
