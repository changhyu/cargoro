// 모바일 전용 export
export { ClerkMobileProvider } from './components/clerk-mobile-provider';
export { UnifiedMobileAuthProvider } from './components/unified-mobile-auth-provider';

// 모바일용 훅 (기존 useAuth 사용)
export { useAuth } from './hooks/useAuth';

// 모바일 앱용 클라이언트 인증 유틸리티 (AsyncStorage 기반)
export {
  clearClientAuth,
  getClientAuthToken,
  getClientUserData,
  getClientUserRole,
  isClientAuthenticated,
  setClientAuth,
} from '../utils';
