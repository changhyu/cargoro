'use client';

import { useEffect } from 'react';
import { useClerk } from '@clerk/nextjs';

// 로깅 유틸리티
const logger = {
  log: (message: string) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(message);
    }
  },
  warn: (message: string, error?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(message, error);
    }
  },
  error: (message: string, error?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error(message, error);
    }
  },
  info: (message: string) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.info(message);
    }
  },
};

/**
 * Clerk 오류 처리 컴포넌트
 */
export default function ClerkErrorHandler() {
  const clerk = useClerk();

  useEffect(() => {
    // Clerk 인스턴스가 없으면 경고를 출력하고 추가 작업을 수행하지 않음
    if (!clerk) {
      logger.warn('Clerk 클라이언트가 초기화되지 않았습니다.');
      return;
    }

    // 정리 함수
    return () => {
      // 이벤트 리스너 정리 코드 (필요시 구현)
    };
  }, [clerk]);

  // 콘솔에 도움말 출력
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logger.info('ClerkErrorHandler가 마운트되었습니다.');
    }
  }, []);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
}
