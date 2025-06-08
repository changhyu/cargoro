/**
 * Clerk 인증 상태 초기화 스크립트
 *
 * "Unable to complete action at this time" 오류 발생 시
 * 브라우저에서 직접 실행할 수 있는 스크립트입니다.
 *
 * 콘솔에서 다음과 같이 실행하세요:
 * fetch('/clerk-reset.js').then(response => {
 *   const scriptEl = document.createElement('script');
 *   scriptEl.src = '/clerk-reset.js';
 *   document.head.appendChild(scriptEl);
 * });
 */

/**
 * Clerk 인증 상태 초기화 스크립트
 *
 * 이 스크립트는 Clerk 인증 오류 발생 시 수동으로 초기화할 수 있는 방법을 제공합니다.
 * CSP 정책과 호환되도록 eval() 사용을 피하고 IIFE 방식으로 구현되었습니다.
 */
(function () {
  // 전역 클리어 함수 정의
  window.clearClerkAuth = function (reload) {
    console.log('Clerk 인증 상태 초기화 중...');

    // 로컬 스토리지 클리어
    try {
      Object.keys(localStorage)
        .filter(function (key) {
          return key.startsWith('clerk.');
        })
        .forEach(function (key) {
          console.log('로컬 스토리지 항목 삭제: ' + key);
          localStorage.removeItem(key);
        });
    } catch (e) {
      console.error('로컬 스토리지 삭제 오류:', e);
    }

    // 쿠키 클리어
    try {
      document.cookie.split(';').forEach(function (cookie) {
        var name = cookie.split('=')[0].trim();
        if (name.startsWith('__clerk') || name.startsWith('__session')) {
          console.log('쿠키 삭제: ' + name);
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
      });
    } catch (e) {
      console.error('쿠키 삭제 오류:', e);
    }

    // IndexedDB 클리어
    try {
      if ('indexedDB' in window) {
        var databases = [
          'clerk',
          'clerk_js_session_cache',
          'clerk_js_device_id',
          'clerk_js_token_cache',
        ];

        databases.forEach(function (dbName) {
          try {
            console.log('IndexedDB 데이터베이스 삭제 시도: ' + dbName);
            indexedDB.deleteDatabase(dbName);
          } catch (dbError) {
            console.error(dbName + ' 데이터베이스 삭제 오류:', dbError);
          }
        });
      }
    } catch (e) {
      console.error('IndexedDB 삭제 오류:', e);
    }

    // 세션 스토리지 클리어
    try {
      Object.keys(sessionStorage)
        .filter(function (key) {
          return key.startsWith('clerk.') || key.includes('clerk');
        })
        .forEach(function (key) {
          console.log('세션 스토리지 항목 삭제: ' + key);
          sessionStorage.removeItem(key);
        });
    } catch (e) {
      console.error('세션 스토리지 삭제 오류:', e);
    }

    console.log('Clerk 인증 상태가 초기화되었습니다.');

    // 페이지 새로고침 (선택 사항)
    if (reload !== false) {
      console.log('페이지를 새로고침합니다...');
      window.location.reload();
    }
  };

  // 콘솔에 도움말 출력
  console.info(
    'Clerk 인증 문제가 발생한 경우 clearClerkAuth() 함수를 호출하여 인증 상태를 초기화할 수 있습니다.'
  );
})();
