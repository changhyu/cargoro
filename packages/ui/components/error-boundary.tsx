import { AlertTriangle, RefreshCcw } from 'lucide-react';
import * as React from 'react';
import { cn } from '../utils';
import { Button } from './button';

export interface ErrorBoundaryProps extends React.PropsWithChildren {
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: unknown[];
  className?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary 컴포넌트
 * 자식 컴포넌트 트리에서 발생하는 JavaScript 오류를 캐치하고
 * 오류 대신 fallback UI를 표시하는 컴포넌트입니다.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 에러 로깅 (예: 서버 API 또는 모니터링 서비스에 보고)
    console.error('ErrorBoundary 오류 발생:', error, errorInfo);
  }

  override componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // resetKeys가 변경되면 컴포넌트 상태 초기화
    if (this.state.hasError && this.props.resetKeys) {
      const hasKeysChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );

      if (hasKeysChanged) {
        this.reset();
      }
    }
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  override render(): React.ReactNode {
    if (this.state.hasError) {
      // 커스텀 fallback이 제공된 경우 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 오류 UI
      return (
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/50',
            this.props.className
          )}
        >
          <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/50 dark:text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">
              오류가 발생했습니다
            </h3>
            <p className="text-sm text-red-600 dark:text-red-300">
              {this.state.error?.message || '알 수 없는 오류가 발생했습니다'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 bg-white hover:bg-red-100 hover:text-red-700 dark:border-red-900/50 dark:bg-transparent dark:hover:bg-red-900/50 dark:hover:text-red-300"
            onClick={this.reset}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            다시 시도
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * useErrorBoundary 훅
 * 함수형 컴포넌트에서 ErrorBoundary의 상태와 메서드에 접근하기 위한 훅
 */
export function useErrorBoundary(): {
  showBoundary: (error: Error) => void;
} {
  const [error, setError] = React.useState<Error | null>(null);

  if (error) {
    throw error;
  }

  return {
    showBoundary: (error: Error) => setError(error),
  };
}

/**
 * ErrorMessage 컴포넌트
 * 간단한 인라인 오류 메시지를 표시하는 컴포넌트
 */
export interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: string | null;
  icon?: boolean;
}

export const ErrorMessage = React.forwardRef<HTMLDivElement, ErrorMessageProps>(
  ({ className, error, icon = true, ...props }, ref) => {
    if (!error) return null;

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2 text-sm text-red-600 dark:text-red-400', className)}
        {...props}
      >
        {icon && <AlertTriangle className="h-4 w-4" />}
        <span>{error}</span>
      </div>
    );
  }
);

ErrorMessage.displayName = 'ErrorMessage';
