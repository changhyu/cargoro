'use client';

import { Button } from '@cargoro/ui';

interface AuthResetButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

/**
 * Clerk 인증 상태를 초기화합니다.
 *
 * 로컬 스토리지와 쿠키에서 Clerk 관련 데이터를 삭제합니다.
 *
 * @param reload 초기화 후 페이지를 새로고침할지 여부 (기본값: false)
 */
function clearClerkAuthState(reload = false): void {
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
  } catch (_e) {
    // 에러 무시
  }

  // Clerk 관련 쿠키 삭제
  try {
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=').map(c => c.trim());
      if (name && (name.startsWith('__clerk') || name.startsWith('__session'))) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  } catch (_e) {
    // 에러 무시
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
        } catch (_dbError) {
          // 에러 무시
        }
      });
    }
  } catch (_e) {
    // 에러 무시
  }

  // 세션 스토리지에서 Clerk 관련 데이터 삭제
  try {
    Object.keys(window.sessionStorage)
      .filter(key => key.startsWith('clerk.') || key.includes('clerk'))
      .forEach(key => {
        window.sessionStorage.removeItem(key);
      });
  } catch (_e) {
    // 에러 무시
  }

  // 페이지 새로고침 (선택 사항)
  if (reload) {
    window.location.reload();
  }
}

/**
 * 인증 상태 초기화 버튼
 *
 * Clerk 인증 관련 오류가 발생했을 때 수동으로 상태를 초기화할 수 있는 버튼입니다.
 * 로그인 페이지나 오류 페이지에 이 버튼을 추가하면 유용합니다.
 */
export default function AuthResetButton({
  variant = 'outline',
  size = 'sm',
  className = '',
}: AuthResetButtonProps) {
  const handleReset = () => {
    if (typeof window !== 'undefined') {
      if (window.confirm('인증 상태를 초기화하고 페이지를 새로고침하시겠습니까?')) {
        clearClerkAuthState(true); // true = 초기화 후 페이지 새로고침
      }
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleReset} className={className}>
      인증 상태 초기화
    </Button>
  );
}
