'use client';

/**
 * 사용자 서버 액션
 *
 * 클라이언트 컴포넌트에서 사용할 수 있는 서버 액션 래퍼
 */
import { auth, getAuthenticatedUser, checkUserRole } from '@cargoro/auth/server';

export { auth, getAuthenticatedUser, checkUserRole };

export default auth;
