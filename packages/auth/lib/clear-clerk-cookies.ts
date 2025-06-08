/**
 * Clerk 인증 상태 초기화 유틸리티
 *
 * 인증 오류 발생 시 Clerk 관련 상태를 초기화하는 함수입니다.
 */

/**
 * Clerk 인증 상태를 초기화합니다.
 *
 * 로컬 스토리지와 쿠키에서 Clerk 관련 데이터를 삭제합니다.
 *
 * @param reload 초기화 후 페이지를 새로고침할지 여부 (기본값: false)
 */
export function clearClerkAuthState(reload = false): void {
  if (typeof window === 'undefined') {
    return; // 서버 사이드에서는 실행하지 않음
  }

  // eslint-disable-next-line no-console
  console.log('Clerk 인증 상태 초기화 중...');

  // 로컬 스토리지에서 Clerk 관련 데이터 삭제
  try {
    Object.keys(window.localStorage)
      .filter(key => key.startsWith('clerk.'))
      .forEach(key => {
        // eslint-disable-next-line no-console
        console.log(`로컬 스토리지 항목 삭제: ${key}`);
        window.localStorage.removeItem(key);
      });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('로컬 스토리지 삭제 오류:', e);
  }

  // Clerk 관련 쿠키 삭제
  try {
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=').map(c => c.trim());
      if (name && (name.startsWith('__clerk') || name.startsWith('__session'))) {
        // eslint-disable-next-line no-console
        console.log(`쿠키 삭제: ${name}`);
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('쿠키 삭제 오류:', e);
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
          // eslint-disable-next-line no-console
          console.log(`IndexedDB 데이터베이스 삭제 시도: ${dbName}`);
          window.indexedDB.deleteDatabase(dbName);
        } catch (dbError) {
          // eslint-disable-next-line no-console
          console.error(`${dbName} 데이터베이스 삭제 오류:`, dbError);
        }
      });
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('IndexedDB 삭제 오류:', e);
  }

  // 세션 스토리지에서 Clerk 관련 데이터 삭제
  try {
    Object.keys(window.sessionStorage)
      .filter(key => key.startsWith('clerk.') || key.includes('clerk'))
      .forEach(key => {
        // eslint-disable-next-line no-console
        console.log(`세션 스토리지 항목 삭제: ${key}`);
        window.sessionStorage.removeItem(key);
      });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('세션 스토리지 삭제 오류:', e);
  }

  // eslint-disable-next-line no-console
  console.log('Clerk 인증 상태가 초기화되었습니다.');

  // 페이지 새로고침 (선택 사항)
  if (reload) {
    // eslint-disable-next-line no-console
    console.log('페이지를 새로고침합니다...');
    window.location.reload();
  }
}

/**
 * 인증 오류 발생 시 자동으로 상태를 초기화합니다.
 *
 * @param error 발생한 오류 객체
 * @param reload 초기화 후 페이지 새로고침 여부 (기본값: true)
 * @returns 오류 객체를 그대로 반환 (체이닝 가능)
 */
export function handleClerkAuthError(error: Error, reload = true): Error {
  // 알려진 Clerk 오류 패턴
  const errorPatterns = [
    'Unable to complete action at this time',
    "auth() was called but it looks like you aren't using",
    'Session not found',
    'Invalid session token',
    'Session expired',
    'could not be authenticated',
    'Failed to fetch',
    'Network error',
  ];

  // 오류 메시지가 알려진 패턴과 일치하는지 확인
  const isClerkError = errorPatterns.some(
    pattern => error.message && error.message.includes(pattern)
  );

  if (isClerkError) {
    // eslint-disable-next-line no-console
    console.warn('Clerk 인증 오류 감지:', error.message);
    clearClerkAuthState(reload);
  }

  return error; // 원본 오류 반환
}

/**
 * 브라우저 개발자 콘솔에서 수동으로 인증 상태를 초기화하는 함수
 */
export function setupDevConsoleHelper(): void {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // @ts-expect-error window 객체에 개발용 헬퍼 추가
    window.__clearClerkAuth = clearClerkAuthState;
    // eslint-disable-next-line no-console
    console.info(
      '개발자 콘솔에서 window.__clearClerkAuth() 함수로 Clerk 인증 상태를 초기화할 수 있습니다.'
    );
  }
}

// 개발 환경에서 콘솔 헬퍼 설정
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setupDevConsoleHelper();
}

export default clearClerkAuthState;
