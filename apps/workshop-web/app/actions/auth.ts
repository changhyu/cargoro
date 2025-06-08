'use server';
/**
 * 인증 관련 서버 액션
 */
import { auth, currentUser } from '@cargoro/auth/server';
import { redirect } from 'next/navigation';

// 서버 인증 정보 가져오기
export const serverAuth = auth;

// 인증이 필요한 함수
export const requireAuth = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }
  return userId;
};

// 관리자 권한이 필요한 함수
export const requireAdmin = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // 사용자 정보 가져오기
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  // 사용자 역할 확인 (Clerk 메타데이터 또는 공용 메타데이터에서 역할 가져오기)
  const userRole = (user.publicMetadata?.role as string) || (user.privateMetadata?.role as string);

  if (!userRole || !['admin', 'super_admin', 'manager'].includes(userRole)) {
    // 관리자 권한이 없는 경우 접근 거부 페이지로 리다이렉트
    redirect('/unauthorized');
  }

  return user;
};
