import { GraphQLClient, RequestDocument } from 'graphql-request';

import { handleApiError, logApiError } from '../utils/error-utils';

export interface GraphQLClientConfig {
  endpoint: string;
  headers?: Record<string, string>;
}

// GraphQL 클라이언트의 요청 옵션 직접 정의
export type RequestOptions = {
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

/**
 * CarGoro용 GraphQL 클라이언트
 * React Query 5.75.8과 완전 호환되는 GraphQL 클라이언트
 */
export class CargoroGraphQLClient {
  private client: GraphQLClient;

  constructor(config: GraphQLClientConfig) {
    this.client = new GraphQLClient(config.endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      // React Query 5.75.8 호환을 위한 설정
      errorPolicy: 'all',
    });
  }

  // Bearer 토큰 설정
  public setAuthToken(token: string): void {
    this.client.setHeader('Authorization', `Bearer ${token}`);
  }

  // 토큰 제거
  public clearAuthToken(): void {
    this.client.setHeader('Authorization', '');
  }

  // GraphQL 쿼리 실행 (React Query 5.75.8 최적화)
  public async query<
    TData = unknown,
    TVariables extends Record<string, unknown> = Record<string, unknown>,
  >(document: RequestDocument, variables?: TVariables): Promise<TData> {
    try {
      return await this.client.request<TData>(document, variables);
    } catch (error) {
      // 통합된 에러 처리 유틸리티 사용
      logApiError(error, 'GraphQL Query');
      const apiError = handleApiError(error, '쿼리 실행 중 오류가 발생했습니다');
      throw apiError;
    }
  }

  // 사용자 지정 헤더와 함께 GraphQL 쿼리 실행
  public async queryWithHeaders<
    TData = unknown,
    TVariables extends Record<string, unknown> = Record<string, unknown>,
  >(
    document: RequestDocument,
    variables?: TVariables,
    headers?: Record<string, string>
  ): Promise<TData> {
    try {
      return await this.client.request<TData>(document, variables, headers);
    } catch (error) {
      // 통합된 에러 처리 유틸리티 사용
      logApiError(error, 'GraphQL (custom headers)');
      const apiError = handleApiError(error, '사용자 지정 헤더로 쿼리 실행 중 오류가 발생했습니다');
      throw apiError;
    }
  }

  // 배치 쿼리 지원 (성능 최적화)
  public async batchQueries<TData = unknown>(
    queries: Array<{
      document: RequestDocument;
      variables?: Record<string, unknown>;
    }>
  ): Promise<TData[]> {
    try {
      const promises = queries.map(({ document, variables }) =>
        this.client.request<TData>(document, variables)
      );
      return await Promise.all(promises);
    } catch (error) {
      logApiError(error, 'GraphQL Batch');
      throw handleApiError(error, '배치 쿼리 실행 중 오류가 발생했습니다');
    }
  }

  // 구독 지원 (실시간 데이터)
  public subscribe<TData = unknown>(
    _document: RequestDocument,
    _variables?: Record<string, unknown>
  ): AsyncIterable<TData> {
    // WebSocket 기반 구독 구현
    // 향후 subscriptions-transport-ws 또는 graphql-ws 통합 예정
    throw new Error('구독 기능은 현재 개발 중입니다');
  }

  // 클라이언트 상태 확인
  public getEndpoint(): string {
    // GraphQL 클라이언트의 requestConfig 타입 안전성 확보
    const config = this.client.requestConfig as { url?: string };
    return config.url || '';
  }

  // 헤더 업데이트
  public updateHeaders(headers: Record<string, string>): void {
    Object.entries(headers).forEach(([key, value]) => {
      this.client.setHeader(key, value);
    });
  }
}
