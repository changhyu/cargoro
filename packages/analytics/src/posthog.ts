/**
 * CarGoro PostHog 통합 모듈
 * 사용자 행동 분석 및 제품 개선을 위한 PostHog 설정
 */

import posthog from 'posthog-js';

export interface PostHogConfig {
  apiKey: string;
  apiHost?: string;
  enabled?: boolean;
  debug?: boolean;
  capturePageview?: boolean;
  disableSessionRecording?: boolean;
  secureCookie?: boolean;
  cookie_domain?: string;
  persistence?: 'localStorage' | 'cookie' | 'memory';
}

/**
 * PostHog 초기화 함수
 * @param config PostHog 설정 객체
 */
export const initPostHog = (config: PostHogConfig): void => {
  const {
    apiKey,
    apiHost = 'https://app.posthog.com',
    enabled = true,
    debug = false,
    capturePageview = true,
    disableSessionRecording = false,
    secureCookie = true,
    cookie_domain = undefined,
    persistence = 'localStorage',
  } = config;

  if (!enabled || !apiKey) {
    console.warn('PostHog가 비활성화되었거나 API 키가 제공되지 않았습니다.');
    return;
  }

  try {
    posthog.init(apiKey, {
      api_host: apiHost,
      loaded: posthogInstance => {
        if (debug) posthogInstance.debug();
      },
      capture_pageview: capturePageview,
      disable_session_recording: disableSessionRecording,
      secure_cookie: secureCookie,
      ...(cookie_domain && { cookie_domain }),
      persistence: persistence,
      // 개인 정보 보호를 위한 프로퍼티 마스킹
      property_blacklist: [
        'email',
        'name',
        'phone',
        'address',
        '$initial_referring_domain',
        '$current_url',
      ],
    });

    console.log('PostHog가 초기화되었습니다.');
  } catch (error) {
    console.error('PostHog 초기화 중 오류가 발생했습니다:', error);
  }
};

/**
 * 이벤트 캡처 함수
 * @param eventName 이벤트 이름
 * @param properties 이벤트 속성
 */
export const captureEvent = (eventName: string, properties?: Record<string, unknown>): void => {
  posthog.capture(eventName, properties);
};

/**
 * 사용자 식별 함수
 * @param userId 사용자 고유 ID
 * @param properties 사용자 속성
 */
export const identify = (userId: string, properties?: Record<string, unknown>): void => {
  posthog.identify(userId, properties);
};

/**
 * 사용자 속성 설정 함수
 * @param properties 사용자 속성
 */
export const setUserProperties = (properties: Record<string, unknown>): void => {
  posthog.people.set(properties);
};

/**
 * 한 번만 설정되는 사용자 속성 설정 함수
 * @param properties 사용자 속성
 */
export const setUserPropertiesOnce = (properties: Record<string, unknown>): void => {
  posthog.people.set_once(properties);
};

/**
 * 페이지 뷰 캡처 함수
 * @param url 페이지 URL (미지정 시 현재 URL)
 * @param properties 추가 속성
 */
export const capturePageview = (url?: string, properties?: Record<string, unknown>): void => {
  if (typeof window !== 'undefined') {
    posthog.capture('$pageview', {
      ...properties,
      url: url || window.location.href,
    });
  }
};

/**
 * A/B 테스트 기능 플래그 확인 함수
 * @param key 기능 플래그 키
 * @param defaultValue 기본값
 * @returns 기능 플래그 값
 */
export const getFeatureFlag = <T = unknown>(
  key: string,
  defaultValue?: T
): T | boolean | string | undefined => {
  // PostHog의 getFeatureFlag는 특정 타입을 요구하므로 타입 단언 사용
  return posthog.getFeatureFlag(key, defaultValue as { send_event?: boolean } | undefined) as
    | T
    | boolean
    | string
    | undefined;
};

/**
 * 그룹 식별 함수 (엔터프라이즈 기능)
 * @param groupType 그룹 유형 (예: 'company', 'team')
 * @param groupKey 그룹 고유 키
 * @param groupProperties 그룹 속성
 */
export const identifyGroup = (
  groupType: string,
  groupKey: string,
  groupProperties?: Record<string, unknown>
): void => {
  posthog.group(groupType, groupKey, groupProperties);
};

/**
 * PostHog 비활성화 함수
 */
export const disablePostHog = (): void => {
  posthog.opt_out_capturing();
};

export default {
  initPostHog,
  captureEvent,
  identify,
  setUserProperties,
  setUserPropertiesOnce,
  capturePageview,
  getFeatureFlag,
  identifyGroup,
  disablePostHog,
};
