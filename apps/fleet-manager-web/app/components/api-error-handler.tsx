/**
 * 전역 API 오류 처리 컴포넌트
 *
 * API 호출에서 발생하는 오류를 중앙에서 처리하고, 필요한 경우 사용자에게 알림을 표시합니다.
 */

'use client';

import React, { ReactNode, useEffect } from 'react';

import errorUtils, { AppError, ErrorType } from '../services/utils/error-utils';
import logger from '../services/utils/logger';

import { useToast } from './ui/use-toast';

// 글로벌 오류 핸들러 타입
type GlobalErrorHandler = (error: Error) => void;

// 전역 오류 핸들러 등록을 위한 컨텍스트
const globalErrorHandlers: GlobalErrorHandler[] = [];

/**
 * 전역 오류 핸들러 등록 함수
 * @param handler 등록할 오류 핸들러 함수
 * @returns 핸들러 제거 함수
 */
export function registerGlobalErrorHandler(handler: GlobalErrorHandler): () => void {
  globalErrorHandlers.push(handler);

  // 정리 함수 반환 (제거용)
  return () => {
    const index = globalErrorHandlers.indexOf(handler);
    if (index !== -1) {
      globalErrorHandlers.splice(index, 1);
    }
  };
}

/**
 * 전역 오류 발생 함수
 * @param error 발생한 오류 객체
 */
export function reportGlobalError(error: Error): void {
  logger.error('전역 오류 발생:', error);

  // 모든 등록된 핸들러에 오류 전파
  globalErrorHandlers.forEach(handler => {
    try {
      handler(error);
    } catch (handlerError) {
      logger.error('오류 핸들러 실행 중 예외 발생:', handlerError);
    }
  });
}

// API 오류 처리 컴포넌트 Props
interface ApiErrorHandlerProps {
  children: ReactNode;
}

/**
 * API 오류 처리 컴포넌트
 *
 * 모든 API 요청의 오류를 중앙에서 처리하고 적절한 사용자 피드백을 제공합니다.
 */
export default function ApiErrorHandler({ children }: ApiErrorHandlerProps): React.ReactElement {
  const { toast } = useToast();

  useEffect(() => {
    // 전역 오류 핸들러 등록
    const removeHandler = registerGlobalErrorHandler((error: Error) => {
      // AppError 타입의 오류인 경우 타입별로 처리
      if (error instanceof AppError) {
        const userMessage = errorUtils.getUserFriendlyErrorMessage(error);

        // 오류 타입별 처리
        switch (error.type) {
          case ErrorType.AUTH:
            toast({
              title: '인증 오류',
              description: userMessage,
              variant: 'destructive',
            });
            break;

          case ErrorType.PERMISSION:
            toast({
              title: '권한 오류',
              description: userMessage,
              variant: 'destructive',
            });
            break;

          case ErrorType.NETWORK:
            toast({
              title: '네트워크 오류',
              description: userMessage,
              variant: 'destructive',
            });
            break;

          case ErrorType.SERVER:
            toast({
              title: '서버 오류',
              description: userMessage,
              variant: 'destructive',
            });
            break;

          default:
            toast({
              title: '오류 발생',
              description: userMessage,
              variant: 'destructive',
            });
        }
      } else {
        // 일반 오류인 경우
        toast({
          title: '오류 발생',
          description: '요청을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
          variant: 'destructive',
        });
      }
    });

    // 정리 함수
    return () => {
      removeHandler();
    };
  }, [toast]);

  // 자식 컴포넌트 렌더링
  return <>{children}</>;
}
