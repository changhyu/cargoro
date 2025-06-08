import { Response } from 'express';
import { ApiResponse } from '../types';

/**
 * 성공 응답 생성
 * @param res Express 응답 객체
 * @param data 응답 데이터
 * @param status HTTP 상태 코드 (기본값: 200)
 */
export function createSuccessResponse<T>(res: Response, data: T, status = 200): Response {
  const response: ApiResponse<T> = {
    status: 'success',
    data,
    timestamp: new Date().toISOString(),
  };

  return res.status(status).json(response);
}

/**
 * 오류 응답 생성
 * @param res Express 응답 객체
 * @param status HTTP 상태 코드
 * @param code 오류 코드
 * @param message 오류 메시지
 * @param details 추가 상세 정보 (선택 사항)
 */
export function createErrorResponse(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: Record<string, any>
): Response {
  const errorResponse: ApiResponse<null> = {
    status: 'error',
    error: {
      code,
      message,
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
  };

  return res.status(status).json(errorResponse);
}

/**
 * 404 Not Found 응답 생성 함수
 */
export function createNotFoundResponse(
  res: Response,
  resourceType: string,
  resourceId?: string
): Response {
  const message = resourceId
    ? `${resourceType}(ID: ${resourceId})를 찾을 수 없습니다.`
    : `요청한 ${resourceType}를 찾을 수 없습니다.`;

  return createErrorResponse(res, 404, 'RESOURCE_NOT_FOUND', message);
}

/**
 * 400 Bad Request 응답 생성 함수
 */
export function createBadRequestResponse(
  res: Response,
  message: string = '유효하지 않은 요청입니다.',
  details?: Record<string, any>
): Response {
  return createErrorResponse(res, 400, 'BAD_REQUEST', message, details);
}

/**
 * 401 Unauthorized 응답 생성 함수
 */
export function createUnauthorizedResponse(
  res: Response,
  message: string = '인증이 필요합니다.'
): Response {
  return createErrorResponse(res, 401, 'UNAUTHORIZED', message);
}

/**
 * 403 Forbidden 응답 생성 함수
 */
export function createForbiddenResponse(
  res: Response,
  message: string = '이 작업을 수행할 권한이 없습니다.'
): Response {
  return createErrorResponse(res, 403, 'FORBIDDEN', message);
}

/**
 * 500 Internal Server Error 응답 생성 함수
 */
export function createServerErrorResponse(
  res: Response,
  message: string = '서버 오류가 발생했습니다.',
  details?: Record<string, any>
): Response {
  return createErrorResponse(res, 500, 'INTERNAL_SERVER_ERROR', message, details);
}

/**
 * 409 Conflict 응답 생성 함수
 */
export function createConflictResponse(
  res: Response,
  message: string = '리소스 충돌이 발생했습니다.',
  details?: Record<string, any>
): Response {
  return createErrorResponse(res, 409, 'CONFLICT', message, details);
}

/**
 * 페이지네이션 응답 생성
 * @param res Express 응답 객체
 * @param items 항목 배열
 * @param total 총 항목 수
 * @param page 현재 페이지
 * @param limit 페이지당 항목 수
 */
export function createPaginatedResponse(
  res: Response,
  items: any[],
  total: number,
  page: number,
  limit: number
): Response {
  return res.json({
    status: 'success',
    data: {
      items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    },
    timestamp: new Date().toISOString(),
  });
}
