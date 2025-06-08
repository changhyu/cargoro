'use client';

import { useEffect } from 'react';
// import { usePathname, useSearchParams } from '@/app/utils/router';

// 간단한 임시 구현
const usePathname = () => {
  return window.location.pathname;
};

const useSearchParams = () => {
  return new URLSearchParams(window.location.search);
};

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * 사용자 행동 분석을 위한 분석 제공자 컴포넌트
 * 사용자의 페이지 방문과 경로 변경을 추적합니다.
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 페이지 URL 구성 (디버깅 용도로 변수 생성만 하고 사용하지 않음)
    // const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    // 페이지 조회 이벤트 트래킹
    // TODO: 프로덕션 환경에서 실제 분석 도구로 교체
    // 실제 프로덕션 환경에서는 아래와 같은 코드를 사용
    // analytics.trackPageView({
    //   url: pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''),
    //   referrer: document.referrer,
    // });
  }, [pathname, searchParams]);

  return <>{children}</>;
}
