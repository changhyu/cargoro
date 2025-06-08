import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@cargoro/ui/components/ui/toast';

// 테스트용 QueryClient 생성
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // 테스트에서는 재시도 비활성화
        retry: false,
        // 테스트에서는 캐시 시간 짧게
        cacheTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });

// 모든 Provider를 포함한 Wrapper
interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
};

// 커스텀 render 함수
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  initialRouterEntry?: string;
}

export const render = (ui: React.ReactElement, options?: CustomRenderOptions) => {
  const { queryClient, ...renderOptions } = options || {};

  return rtlRender(ui, {
    wrapper: AllTheProviders,
    ...renderOptions,
  });
};

// 재사용 가능한 테스트 유틸리티들
export * from '@testing-library/react';
export { render };
