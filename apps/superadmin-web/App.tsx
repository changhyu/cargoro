/**
 * 관리자 웹 앱의 메인 컴포넌트
 *
 * 모든 앱은 이 표준 구조를 따릅니다:
 * 1. 필요한 프로바이더 (RootProvider)
 * 2. 글로벌 스타일 및 테마
 * 3. 레이아웃 구조
 */
import React from 'react';
import { useAuth, useGlobalTheme } from '@cargoro/ui';

// 분석 도구 모듈을 직접 import하는 대신 더미 객체 사용
const posthog = {
  capture: (eventName: string, properties?: Record<string, any>) => {
    console.log('Analytics event captured:', eventName, properties);
  },
};

function App(): React.ReactElement {
  const { mode: themeMode } = useGlobalTheme();
  const { isAuthenticated } = useAuth();

  // PostHog 이벤트 추적 예시
  const trackCustomEvent = () => {
    posthog.capture('button_clicked', { app: 'superadmin-web', theme: themeMode });
  };

  return (
    <div className={`app-root ${themeMode}`}>
      <header className="app-header">
        <h1>카고로진 관리자 웹 앱</h1>
        <p>플랫폼 관리용 웹 애플리케이션입니다.</p>

        {/* 사용자 상태 표시 */}
        <div className="user-status">{isAuthenticated ? '로그인됨' : '로그인 필요'}</div>

        {/* 이벤트 추적 버튼 */}
        <button
          onClick={trackCustomEvent}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
        >
          이벤트 추적 테스트
        </button>
      </header>

      <main className="app-main">{/* 앱 콘텐츠 */}</main>

      <footer className="app-footer">
        <p>© 2025 카고로진</p>
      </footer>
    </div>
  );
}

export default App;
