'use client';

// 직접적인 import 경로 변경

/**
 * 개발 환경에서 자동 로그인을 처리하는 컴포넌트
 * ClerkProvider 내부에서 사용해야 함
 *
 * 현재 비활성화 상태입니다.
 */
export function DevAutoLogin({
  email: _email,
  password: _password,
}: {
  email: string;
  password: string;
}) {
  // 모든 로직을 비활성화
  // DevAutoLogin이 비활성화 되었습니다.

  return null;
}
