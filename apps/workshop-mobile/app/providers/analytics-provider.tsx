import React, { createContext, ReactNode, useContext, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';

// Record<string, any> 대신 구체적인 타입으로 변경
type EventParams = Record<string, string | number | boolean | null>;
type UserProperties = Record<string, string | number | boolean | null>;

// 실제 환경에서는 @cargoro/analytics 패키지에서 가져올 예정
// 테스트를 위한 간단한 구현
const analyticsService = {
  // eslint-disable-next-line no-console
  initialize: () => console.log('Analytics initialized'),
  // eslint-disable-next-line no-console
  trackScreen: (screenName: string) => console.log(`Screen viewed: ${screenName}`),
  trackEvent: (eventName: string, params?: EventParams) =>
    // eslint-disable-next-line no-console
    console.log(`Event tracked: ${eventName}`, params),
  setUserProperties: (properties: UserProperties) =>
    // eslint-disable-next-line no-console
    console.log('User properties set:', properties),
};

interface AnalyticsContextValue {
  trackScreen: (screenName: string) => void;
  trackEvent: (eventName: string, params?: EventParams) => void;
  setUserProperties: (properties: UserProperties) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: ReactNode;
}

const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  // 컴포넌트 마운트 시 분석 서비스 초기화
  useEffect(() => {
    // 분석 서비스 초기화 설정
    analyticsService.initialize();

    // 디바이스 정보 설정
    analyticsService.setUserProperties({
      platform: Platform.OS,
      platformVersion: Platform.Version,
      appVersion: '1.0.0', // 실제로는 앱 버전 정보 사용
    });
  }, []);

  const trackScreen = (screenName: string) => {
    analyticsService.trackScreen(screenName);
  };

  const trackEvent = (eventName: string, params?: EventParams) => {
    analyticsService.trackEvent(eventName, params);
  };

  const setUserProperties = (properties: UserProperties) => {
    analyticsService.setUserProperties(properties);
  };

  // useMemo로 감싸서 불필요한 렌더링 방지
  const value = useMemo(
    () => ({
      trackScreen,
      trackEvent,
      setUserProperties,
    }),
    []
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
};

export default AnalyticsProvider;
