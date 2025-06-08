/**
 * 서버 전용 인증 유틸리티
 *
 * 이 파일은 서버 컴포넌트에서만 사용해야 합니다.
 * 클라이언트 컴포넌트에서는 사용하지 마세요.
 */

// 서버 전용 유틸리티 export
export {
  getServerAuthToken,
  getServerUserData,
  getServerUserRole,
  isServerAuthenticated,
} from './lib/utils/server-auth-utils';

// 미들웨어 exports
export { middleware, handleAfterAuth } from './lib/middleware';
