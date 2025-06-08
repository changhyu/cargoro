'use client';

import React, { useEffect, Suspense } from 'react';

import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';

// PostHog 초기화 (클라이언트 측에서만 실행됨)
if (typeof window !== 'undefined') {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  if (apiKey) {
    posthog.init(apiKey, {
      api_host: apiHost,
      // 개발 환경에서는 자동 캡처 비활성화
      autocapture: process.env.NODE_ENV === 'production',
      // 개발 환경에서는 디버그 모드 활성화
      debug: process.env.NODE_ENV !== 'production',
      // 개발 환경에서 로컬 저장소 비활성화
      persistence: process.env.NODE_ENV === 'production' ? 'localStorage' : 'memory',
      // 페이지뷰 자동 캡처 비활성화 (수동으로 캡처)
      capture_pageview: false,
      // 식별된 사용자만 프로필 생성
      person_profiles: 'identified_only',
      // 쿠키 면제 동의 배너 (GDPR)
      loaded: posthog => {
        // 사용자 동의 상태 확인
        if (!localStorage.getItem('posthog_opt_in') && !localStorage.getItem('posthog_opt_out')) {
          // 사용자가 아직 선택하지 않은 경우, 기본적으로 추적 비활성화
          posthog.opt_out_capturing();
        }
      },
    });
  }
}

// 페이지뷰 추적 컴포넌트
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthogClient = usePostHog();

  // 페이지뷰 이벤트 추적
  useEffect(() => {
    if (pathname && posthogClient) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + '?' + searchParams.toString();
      }

      posthogClient.capture('$pageview', { $current_url: url });
    }
  }, [pathname, searchParams, posthogClient]);

  return null;
}

// useSearchParams 사용으로 인한 서버 사이드 렌더링 이슈 방지를 위해 Suspense로 래핑
function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}

// PostHog 래퍼 컴포넌트
export function PostHogAnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
}

// 사용자 옵트인 함수
export function optInAnalytics() {
  posthog.opt_in_capturing();
  localStorage.setItem('posthog_opt_in', 'true');
  localStorage.removeItem('posthog_opt_out');
}

// 사용자 옵트아웃 함수
export function optOutAnalytics() {
  posthog.opt_out_capturing();
  localStorage.setItem('posthog_opt_out', 'true');
  localStorage.removeItem('posthog_opt_in');
}

// 사용자 식별
export function identifyUser(id: string, properties?: Record<string, unknown>) {
  posthog.identify(id, properties);
}

// 이벤트 추적
export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  posthog.capture(eventName, properties);
}

export { posthog };
