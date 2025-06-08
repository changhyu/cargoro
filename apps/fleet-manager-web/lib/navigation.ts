import { useEffect, useState } from 'react';

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { ReadonlyURLSearchParams } from 'next/navigation';

// 동적으로 next/navigation을 import하는 함수들
export const useClientRouter = (): AppRouterInstance | null => {
  const [router, setRouter] = useState<AppRouterInstance | null>(null);

  useEffect(() => {
    const loadRouter = async (): Promise<void> => {
      try {
        const navigation = await import('next/navigation');
        const routerInstance = navigation.useRouter();
        setRouter(routerInstance);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load navigation:', error);
      }
    };

    void loadRouter();
  }, []);

  return router;
};

export const useClientParams = (): Record<string, string | string[]> | null => {
  const [params, setParams] = useState<Record<string, string | string[]> | null>(null);

  useEffect(() => {
    const loadParams = async (): Promise<void> => {
      try {
        const navigation = await import('next/navigation');
        const rawParams = navigation.useParams();
        if (rawParams) {
          // string[]을 string으로 변환
          const processedParams: Record<string, string | string[]> = {};
          for (const [key, value] of Object.entries(rawParams)) {
            processedParams[key] = value;
          }
          setParams(processedParams);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load params:', error);
      }
    };

    void loadParams();
  }, []);

  return params;
};

export const useClientSearchParams = (): ReadonlyURLSearchParams | null => {
  const [searchParams, setSearchParams] = useState<ReadonlyURLSearchParams | null>(null);

  useEffect(() => {
    const loadSearchParams = async (): Promise<void> => {
      try {
        const navigation = await import('next/navigation');
        const params = navigation.useSearchParams();
        setSearchParams(params);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load search params:', error);
      }
    };

    void loadSearchParams();
  }, []);

  return searchParams;
};

export const safeRedirect = (url: string): void => {
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
};

export const safePush = (url: string): void => {
  if (typeof window !== 'undefined') {
    window.history.pushState({}, '', url);
    window.location.reload();
  }
};
