'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { ReactNode, useEffect } from 'react';

// PostHog 설정
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

export default function ClientAnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // PostHog 초기화
  useEffect(() => {
    if (POSTHOG_KEY && typeof window !== 'undefined') {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: false, // 수동으로 페이지뷰 추적
      });
    }

    return () => {
      if (POSTHOG_KEY) {
        posthog.reset();
      }
    };
  }, []);

  // 경로 변경 시 페이지뷰 이벤트 추적
  useEffect(() => {
    if (POSTHOG_KEY && pathname) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
