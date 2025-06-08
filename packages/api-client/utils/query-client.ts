import { QueryClient } from '@tanstack/react-query';
import { defaultQueryOptions } from './query-defaults';

/**
 * 앱 전체에서 공유할 수 있는 QueryClient 인스턴스
 * - 단일 인스턴스로 관리하여 캐시의 일관성 유지
 * - 기본 옵션이 적용된 상태
 */
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});

/**
 * QueryClient 초기화 함수
 * - 필요한 경우 커스텀 설정으로 QueryClient 재생성
 */
export function createQueryClient(options = defaultQueryOptions) {
  return new QueryClient({
    defaultOptions: options,
  });
}
