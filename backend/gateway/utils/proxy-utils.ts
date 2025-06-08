import { Request, Response, NextFunction } from 'express';
import axios, { AxiosRequestConfig, AxiosResponse, Method, AxiosError } from 'axios';
import { loggerTyped as logger } from './logger';
import { createSuccessResponse, createErrorResponse } from './response-utils';
import { config } from '../config';

/**
 * 요청 헤더 전달 함수
 *
 * 클라이언트 요청의 중요 헤더를 백엔드 서비스로 전달합니다.
 */
export function forwardHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = {};

  // 인증 헤더 전달
  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization as string;
  }

  // Content-Type 헤더 전달
  if (req.headers['content-type']) {
    headers['Content-Type'] = req.headers['content-type'] as string;
  }

  // Accept 헤더 전달
  if (req.headers.accept) {
    headers['Accept'] = req.headers.accept as string;
  }

  // 요청 ID 전달 (백엔드 서비스 간 추적용)
  if (req.id) {
    headers['X-Request-ID'] = String(req.id);
  }

  // 사용자 ID 전달 (인증된 요청의 경우)
  if (req.userId) {
    headers['X-User-ID'] = req.userId;
  }

  return headers;
}

/**
 * 백엔드 마이크로서비스 호출 함수
 *
 * 지정된 서비스 엔드포인트로 HTTP 요청을 전송합니다.
 */
export async function callService<T = any>(
  serviceUrl: string,
  method: Method,
  req: Request,
  params?: Record<string, any>,
  data?: any,
  options: Partial<AxiosRequestConfig> = {}
): Promise<AxiosResponse<T>> {
  // 요청 시작 시간 기록 (성능 모니터링용)
  const startTime = Date.now();

  const headers = forwardHeaders(req);
  const config: AxiosRequestConfig = {
    method,
    url: serviceUrl,
    headers,
    params: params || req.query,
    data: data || req.body,
    ...options,
  };

  try {
    // 요청 로깅
    logger.debug({
      requestId: req.id,
      message: '백엔드 서비스 호출',
      service: serviceUrl,
      method,
      params: config.params,
    });

    const response = await axios(config);

    // 응답 시간 계산
    const responseTime = Date.now() - startTime;

    // 응답 로깅
    logger.debug({
      requestId: req.id,
      message: '백엔드 서비스 응답 수신',
      service: serviceUrl,
      method,
      statusCode: response.status,
      responseTime,
    });

    return response;
  } catch (error) {
    // 오류 응답 시간 계산
    const responseTime = Date.now() - startTime;

    // 오류 로깅
    logger.error({
      requestId: req.id,
      message: '백엔드 서비스 호출 오류',
      service: serviceUrl,
      method,
      responseTime,
      error,
    });

    throw error;
  }
}

/**
 * 요청 프록시 함수
 *
 * 클라이언트 요청을 백엔드 마이크로서비스로 프록시합니다.
 */
export async function proxyRequest(
  req: Request,
  res: Response,
  next: NextFunction,
  service: string,
  path: string,
  method: Method = 'get',
  options: Partial<AxiosRequestConfig> = {}
): Promise<void> {
  try {
    const url = `${service}${path}`;
    const response = await callService(url, method, req, undefined, undefined, options);

    // 헤더 복사
    const contentType = response.headers['content-type'];
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // CORS 헤더가 있는 경우 전달
    if (response.headers['access-control-allow-origin']) {
      res.setHeader('Access-Control-Allow-Origin', response.headers['access-control-allow-origin']);
    }

    // 데이터 형식에 따라 다른 응답 방식 사용
    if (contentType && contentType.includes('application/json')) {
      // JSON 응답의 경우 표준 응답 형식 사용
      createSuccessResponse(res, response.data, response.status);
    } else {
      // 그 외 응답 타입 (이미지, 파일 등)은 그대로 전달
      res.status(response.status).send(response.data);
    }
  } catch (error) {
    next(error);
  }
}

/**
 * 페이지네이션 파라미터 표준화 함수
 *
 * 클라이언트 요청의 페이지네이션 파라미터를 백엔드 서비스에 맞게 변환합니다.
 */
export function normalizePaginationParams(req: Request): Record<string, any> {
  const { page = '1', limit = '10' } = req.query;
  return {
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10),
  };
}

/**
 * 검색 파라미터 표준화 함수
 *
 * 클라이언트 요청의 검색 파라미터를 백엔드 서비스에 맞게 변환합니다.
 */
export function normalizeSearchParams(req: Request): Record<string, any> {
  const { search, sort, order, status, from, to } = req.query;

  const params: Record<string, any> = {};

  if (search) params.search = search;
  if (sort) params.sort = sort;
  if (order) params.order = order;
  if (status) params.status = status;
  if (from) params.from = from;
  if (to) params.to = to;

  // 필터 파라미터 추출 (filter_xxx 형식)
  Object.keys(req.query).forEach(key => {
    if (key.startsWith('filter_')) {
      params[key] = req.query[key];
    }
  });

  return params;
}

/**
 * 요청을 마이크로서비스로 프록시
 */
export function proxyToService(
  req: Request,
  res: Response,
  serviceName: keyof typeof config.services,
  path: string,
  method: Method = 'get'
): void {
  const serviceUrl = config.services[serviceName];

  if (!serviceUrl) {
    logger.error({
      msg: `존재하지 않는 서비스로 프록시 시도`,
      service: serviceName,
      reqId: req.id,
    });

    createErrorResponse(res, 502, 'SERVICE_NOT_FOUND', `${serviceName} 서비스를 찾을 수 없습니다.`);
    return;
  }

  try {
    // 헤더 설정
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': req.id ? req.id.toString() : '',
      'X-User-ID': req.userId || '',
      'X-User-Role': req.role || '',
    };

    // 사용자 인증 정보 전달
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    // 요청 정보 로깅
    logger.info({
      msg: `${serviceName} 서비스로 요청 프록시`,
      path,
      method,
      reqId: req.id,
    });

    // 요청 보내기
    axios({
      method,
      url: `${serviceUrl}${path}`,
      data: method !== 'get' ? req.body : undefined,
      params: method === 'get' ? req.query : undefined,
      headers,
      timeout: 30000, // 30초 타임아웃
    })
      .then(response => {
        // 응답 전달
        res.status(response.status).json(response.data);
      })
      .catch((error: AxiosError) => {
        logger.error({
          msg: `${serviceName} 서비스 요청 오류`,
          path,
          reqId: req.id,
          error: error.message,
          status: error.response?.status,
        });

        if (error.response) {
          // 서비스에서 응답을 반환한 경우
          res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
          // 요청은 보냈지만 응답을 받지 못한 경우
          createErrorResponse(
            res,
            503,
            'SERVICE_UNAVAILABLE',
            `${serviceName} 서비스에 연결할 수 없습니다.`
          );
        } else {
          // 요청 전송 중 오류가 발생한 경우
          createErrorResponse(res, 500, 'PROXY_ERROR', '요청을 처리하는 중 오류가 발생했습니다.');
        }
      });
  } catch (error) {
    logger.error({
      msg: '프록시 처리 중 예외 발생',
      service: serviceName,
      path,
      reqId: req.id,
      error,
    });
    createErrorResponse(res, 500, 'PROXY_ERROR', '요청을 처리하는 중 오류가 발생했습니다.');
  }
}
