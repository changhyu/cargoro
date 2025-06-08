// 기본 인증 유틸리티
export * from './auth-utils';

// 서버 전용 유틸리티 (중복 제거를 위해 개별 export)
export {
  getAuthenticatedUser,
  checkUserRole,
  buildAuthHeader,
  handleClerkWebhook,
} from './auth-server-utils';

// 모바일 전용 유틸리티
export * from './mobile-auth-utils';

// 웹 전용 유틸리티 (중복 제거를 위해 개별 export)
export {
  isClientAuthenticated,
  setClientAuth,
  clearClientAuth,
  getClientUserRole,
  getClientUserData,
  getClientAuthToken,
} from './web-auth-utils';
