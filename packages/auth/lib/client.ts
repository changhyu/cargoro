// 클라이언트 측에서만 사용하는 컴포넌트와 훅을 내보냅니다
// 서버 측 코드(middleware 등)를 포함하지 않습니다

// 컴포넌트
export { AuthProvider, useAuthContext } from './components/auth-provider';

// 훅
export { useAuth } from './hooks/useAuth';
