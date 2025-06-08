'use client';

import { posthog } from '@cargoro/analytics';

/**
 * PostHog 이벤트 추적을 위한 유틸리티 함수
 */
export const trackCustomEvent = (eventName: string, properties?: Record<string, unknown>): void => {
  posthog.capture(eventName, {
    app: 'parts-web',
    ...properties,
  });
};

export default {
  trackCustomEvent,
};
