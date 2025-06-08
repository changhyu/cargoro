'use client';

import { RefreshCcw } from 'lucide-react';
import { Button } from '@cargoro/ui';

/**
 * Clerk 인증 상태를 초기화합니다.
 *
 * 로컬 스토리지와 쿠키에서 Clerk 관련 데이터를 삭제합니다.
 */
function clearClerkAuthState(): void {
  if (typeof window === 'undefined') {
    return; // 서버 사이드에서는 실행하지 않음
  }

  // 로컬 스토리지에서 Clerk 관련 데이터 삭제
  try {
    Object.keys(window.localStorage)
      .filter(key => key.startsWith('clerk.'))
      .forEach(key => {
        window.localStorage.removeItem(key);
      });
  } catch {
    // 오류 무시
  }

  // Clerk 관련 쿠키 삭제
  try {
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=').map(c => c.trim());
      if (name && (name.startsWith('__clerk') || name.startsWith('__session'))) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  } catch {
    // 오류 무시
  }

  // IndexedDB에서 Clerk 관련 데이터베이스 삭제 시도
  try {
    if ('indexedDB' in window) {
      // 알려진 Clerk 관련 IndexedDB 데이터베이스 목록
      const clerkDatabases = [
        'clerk',
        'clerk_js_session_cache',
        'clerk_js_device_id',
        'clerk_js_token_cache',
      ];

      clerkDatabases.forEach(dbName => {
        try {
          window.indexedDB.deleteDatabase(dbName);
        } catch {
          // 오류 무시
        }
      });
    }
  } catch {
    // 오류 무시
  }

  // 세션 스토리지에서 Clerk 관련 데이터 삭제
  try {
    Object.keys(window.sessionStorage)
      .filter(key => key.startsWith('clerk.') || key.includes('clerk'))
      .forEach(key => {
        window.sessionStorage.removeItem(key);
      });
  } catch {
    // 오류 무시
  }

  // 페이지 새로고침
  window.location.reload();
}

/**
 * 인증 상태 초기화 버튼 컴포넌트
 *
 * 인증 문제가 발생했을 때 사용자가 직접 인증 상태를 초기화할 수 있는 버튼을 제공합니다.
 */
export default function AuthResetButton() {
  return (
    <div className="mt-4 flex justify-center">
      <Button variant="outline" size="sm" className="text-xs" onClick={() => clearClerkAuthState()}>
        <RefreshCcw className="mr-2 h-3 w-3" />
        인증 상태 초기화
      </Button>
    </div>
  );
}
