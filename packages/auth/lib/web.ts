// 웹 전용 export
export { AuthProvider, useAuthContext } from './components/auth-provider';
export { default as ProtectedRoute } from './components/ProtectedRoute';
export { UnifiedAuthProvider } from './components/unified-auth-provider';

// 웹용 훅
export { useAuth } from './hooks/useAuth';

// 웹 앱용 클라이언트 인증 유틸리티 (쿠키 기반)
export {
  clearClientAuth,
  getClientAuthToken,
  getClientUserData,
  getClientUserRole,
  isClientAuthenticated,
  setClientAuth,
} from '../utils';
