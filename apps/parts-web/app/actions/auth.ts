'use server';

/**
 * 사용자 서버 액션
 *
 * 클라이언트 컴포넌트에서 사용할 수 있는 서버 액션 래퍼
 */

// 임시 인증 함수
export const auth = async () => {
  return {
    userId: 'temp-user-id',
    isSignedIn: true,
    user: {
      id: 'temp-user-id',
      email: 'temp@example.com',
      name: '임시 사용자',
      role: 'admin',
    },
  };
};

// 인증 필요 래퍼
export const requireAuth = async () => {
  const authData = await auth();
  if (!authData.isSignedIn) {
    throw new Error('인증이 필요합니다');
  }
  return authData;
};

// 관리자 권한 필요 래퍼
export const requireAdmin = async () => {
  const authData = await auth();
  if (!authData.isSignedIn || authData.user.role !== 'admin') {
    throw new Error('관리자 권한이 필요합니다');
  }
  return authData;
};

export default auth;
