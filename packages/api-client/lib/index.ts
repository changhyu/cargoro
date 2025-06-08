// 이 파일은 더 이상 사용되지 않습니다.
// api-client.ts와 provider.tsx를 직접 사용하세요.

import { ApiClient, ApiClientConfig } from './api-client';
import { ApiResponse } from '@cargoro/types/schema/api';

// 이전 코드와의 호환성을 위해 사용되는 export
export { ApiClient };
export type { ApiClientConfig, ApiResponse };
export { ApiProvider, useApiClient } from './provider';
