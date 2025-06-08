/**
 * 애플리케이션 전체에서 사용되는 토스트 메시지 컨테이너
 * useAppState 훅과 연동하여 전역 상태의 토스트를 표시합니다.
 */
import { ReactNode, useEffect } from 'react';
import { useAppState } from '../../hooks';
import { Toast } from '../toast';

// 토스트 컨테이너 프롭스 인터페이스
interface ToastContainerProps {
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
  autoClose?: number;
  hideProgressBar?: boolean;
}

// 토스트 컨테이너 컴포넌트
export function ToastContainer({
  position = 'top-right',
  autoClose = 3000,
  hideProgressBar = false,
}: ToastContainerProps): ReactNode {
  const { toasts, removeToast } = useAppState();

  // 자동 제거 처리
  useEffect(() => {
    if (autoClose <= 0 || toasts.length === 0) return;

    const timers = toasts.map(toast => {
      return setTimeout(() => {
        removeToast(toast.id);
      }, autoClose);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts, autoClose, removeToast]);

  // 토스트가 없으면 렌더링하지 않음
  if (toasts.length === 0) {
    return null;
  }

  // 위치에 따른 클래스 설정
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={`fixed z-50 flex flex-col gap-2 ${positionClasses[position]}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.message}
          variant={toast.type}
          onClose={() => removeToast(toast.id)}
          showCloseButton={!hideProgressBar}
          duration={autoClose}
        />
      ))}
    </div>
  );
}
