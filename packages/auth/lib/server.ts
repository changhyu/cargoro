// 서버 전용 파일
// 이 파일은 서버 컴포넌트에서만 사용해야 합니다.

// 미들웨어 익스포트 - middleware.ts에서 내보낸 함수들과 일치하도록 수정
export { middleware, handleAfterAuth } from './middleware';

// 서버 전용 인증 유틸리티
export { getAuthenticatedUser, checkUserRole, buildAuthHeader, handleClerkWebhook } from '../utils';
