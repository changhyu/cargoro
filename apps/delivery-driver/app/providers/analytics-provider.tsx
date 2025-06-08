import { createContext, FC, ReactNode, useContext, useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { useAuth } from './auth-provider';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 분석 이벤트 유형
export enum AnalyticsEventType {
  // 앱 라이프사이클 이벤트
  APP_OPEN = 'app_open',
  APP_CLOSE = 'app_close',
  APP_CRASH = 'app_crash',

  // 사용자 인증 이벤트
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_REGISTER = 'user_register',

  // 배송 관련 이벤트
  DELIVERY_ACCEPTED = 'delivery_accepted',
  DELIVERY_STARTED = 'delivery_started',
  DELIVERY_COMPLETED = 'delivery_completed',
  DELIVERY_FAILED = 'delivery_failed',
  DELIVERY_DELAYED = 'delivery_delayed',

  // 위치 관련 이벤트
  LOCATION_UPDATED = 'location_updated',
  LOCATION_PERMISSION_GRANTED = 'location_permission_granted',
  LOCATION_PERMISSION_DENIED = 'location_permission_denied',

  // 기타 앱 이벤트
  NOTIFICATION_RECEIVED = 'notification_received',
  NOTIFICATION_OPENED = 'notification_opened',
  ERROR_OCCURRED = 'error_occurred',
  FEATURE_USED = 'feature_used',
}

// 분석 데이터 타입
interface AnalyticsEvent {
  eventName: string;
  params?: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

// 분석 컨텍스트 타입
interface AnalyticsContextType {
  trackEvent: (eventName: string, params?: Record<string, unknown>) => void;
  trackScreen: (screenName: string, params?: Record<string, unknown>) => void;
  logError: (error: Error, context?: Record<string, unknown>) => void;
}

// 기본 분석 컨텍스트 값
const defaultAnalyticsContext: AnalyticsContextType = {
  trackEvent: () => {},
  trackScreen: () => {},
  logError: () => {},
};

// 분석 컨텍스트 생성
const AnalyticsContext = createContext<AnalyticsContextType>(defaultAnalyticsContext);

// 분석 컨텍스트 훅
export const useAnalytics = () => useContext(AnalyticsContext);

interface AnalyticsProviderProps {
  children: ReactNode;
}

// 세션 ID 생성
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
};

/**
 * 탁송 기사 앱을 위한 분석 제공자 컴포넌트
 * 이벤트 트래킹 및 화면 조회 분석을 제공
 */
const AnalyticsProvider: FC<AnalyticsProviderProps> = ({ children }) => {
  const { session } = useAuth();
  const sessionIdRef = useRef<string>(generateSessionId());
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const eventsQueueRef = useRef<AnalyticsEvent[]>([]);
  const API_ENDPOINT = 'https://api.cargoro.co.kr/analytics';

  // 앱 상태 변경 처리 (백그라운드/포그라운드)
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appStateRef.current === 'active' && nextAppState.match(/inactive|background/)) {
      // 앱이 백그라운드로 이동
      trackEvent(AnalyticsEventType.APP_CLOSE);
      // 큐에 있는 이벤트 전송
      flushEvents();
    } else if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      // 앱이 포그라운드로 이동
      trackEvent(AnalyticsEventType.APP_OPEN);
    }

    appStateRef.current = nextAppState;
  };

  // 이벤트 큐 비우기 및 서버로 전송
  const flushEvents = async () => {
    if (eventsQueueRef.current.length === 0) return;

    const events = [...eventsQueueRef.current];
    eventsQueueRef.current = [];

    try {
      // 오프라인 저장을 위해 AsyncStorage에 저장
      const storedEvents = await AsyncStorage.getItem('analytics_events');
      const allEvents = storedEvents ? [...JSON.parse(storedEvents), ...events] : events;

      await AsyncStorage.setItem('analytics_events', JSON.stringify(allEvents));

      // 서버로 전송 시도
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: allEvents }),
      });

      if (response.ok) {
        // 성공적으로 전송되면 저장된 이벤트 삭제
        await AsyncStorage.removeItem('analytics_events');
      }
    } catch (error) {
      console.error('분석 이벤트 전송 실패:', error);
      // 오류가 발생해도 계속 진행, 다음 번에 다시 시도
    }
  };

  // 분석 이벤트 초기화
  useEffect(() => {
    console.log('분석 시스템 초기화 중');

    // 앱 상태 변경 리스너
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // 초기 앱 열기 이벤트
    trackEvent(AnalyticsEventType.APP_OPEN);

    // 미전송 이벤트 확인 및 전송 시도
    const checkPendingEvents = async () => {
      try {
        const storedEvents = await AsyncStorage.getItem('analytics_events');
        if (storedEvents) {
          const events = JSON.parse(storedEvents);
          if (events.length > 0) {
            // 서버로 전송 시도
            const response = await fetch(API_ENDPOINT, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ events }),
            });

            if (response.ok) {
              await AsyncStorage.removeItem('analytics_events');
            }
          }
        }
      } catch (error) {
        console.error('미전송 이벤트 처리 실패:', error);
      }
    };

    checkPendingEvents();

    // 주기적으로 이벤트 전송 (60초마다)
    const flushInterval = setInterval(flushEvents, 60000);

    return () => {
      subscription.remove();
      clearInterval(flushInterval);
      flushEvents(); // 컴포넌트 언마운트 시 남은 이벤트 전송 시도
    };
  }, []);

  // 사용자 로그인/로그아웃 감지하여 이벤트 기록
  useEffect(() => {
    if (session) {
      // 사용자가 로그인한 경우 세션 ID 갱신
      sessionIdRef.current = generateSessionId();
      trackEvent(AnalyticsEventType.USER_LOGIN, { sessionId: session });
    }
  }, [session]);

  // 이벤트 추적 함수
  const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
    const event: AnalyticsEvent = {
      eventName,
      params,
      timestamp: Date.now(),
      userId: session ? 'authenticated' : undefined,
      sessionId: sessionIdRef.current,
    };

    console.log(`분석 이벤트 기록: ${eventName}`, params);
    eventsQueueRef.current.push(event);

    // 즉시 전송이 필요한 중요 이벤트인 경우
    if (
      eventName === AnalyticsEventType.USER_LOGIN ||
      eventName === AnalyticsEventType.USER_LOGOUT ||
      eventName === AnalyticsEventType.APP_CRASH
    ) {
      flushEvents();
    }
  };

  // 화면 추적 함수
  const trackScreen = (screenName: string, params?: Record<string, unknown>) => {
    trackEvent('screen_view', { screen_name: screenName, ...params });
  };

  // 오류 로깅 함수
  const logError = (error: Error, context?: Record<string, unknown>) => {
    trackEvent(AnalyticsEventType.ERROR_OCCURRED, {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  };

  return (
    <AnalyticsContext.Provider value={{ trackEvent, trackScreen, logError }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsProvider;
