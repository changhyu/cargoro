import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import { cn } from '../utils';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'bg-background border-border',
        success:
          'border-green-200 bg-green-50 text-green-900 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-300',
        error:
          'border-red-200 bg-red-50 text-red-900 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300',
        warning:
          'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-900/30 dark:bg-yellow-900/20 dark:text-yellow-300',
        info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-300',
        destructive:
          'border-red-200 bg-red-50 text-red-900 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300',
      },
      size: {
        sm: 'text-xs px-3 py-2',
        md: 'text-sm px-4 py-3',
        lg: 'text-base px-5 py-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// HTMLAttributes<HTMLDivElement>에서 title 속성을 제외하고 확장
export interface ToastProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof toastVariants> {
  onClose?: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  duration?: number;
  autoDismiss?: boolean;
  showCloseButton?: boolean;
}

/**
 * Toast 컴포넌트
 * 사용자에게 일시적인 알림을 표시하는 컴포넌트
 */
export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      className,
      variant,
      size,
      onClose,
      title,
      description,
      icon,
      action,
      autoDismiss = true,
      duration = 5000,
      showCloseButton = true,
      ...props
    },
    ref
  ) => {
    const timerRef = React.useRef<number>();

    // 자동 제거 타이머 설정
    React.useEffect(() => {
      if (autoDismiss && onClose) {
        timerRef.current = window.setTimeout(() => {
          onClose();
        }, duration);
      }

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, [autoDismiss, duration, onClose]);

    // 마우스 올렸을 때 타이머 정지
    const handleMouseEnter = React.useCallback(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    // 마우스 벗어났을 때 타이머 재시작
    const handleMouseLeave = React.useCallback(() => {
      if (autoDismiss && onClose) {
        timerRef.current = window.setTimeout(() => {
          onClose();
        }, duration);
      }
    }, [autoDismiss, duration, onClose]);

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant, size }), className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <div className="flex w-full items-start gap-3">
          {/* 아이콘 */}
          {icon && <div className="shrink-0">{icon}</div>}

          {/* 내용 */}
          <div className="flex-1 space-y-1.5">
            {title && <div className="font-semibold">{title}</div>}
            {description && <div className="text-sm opacity-90">{description}</div>}
            {action && <div className="mt-2.5">{action}</div>}
          </div>
        </div>

        {/* 닫기 버튼 */}
        {showCloseButton && onClose && (
          <button
            type="button"
            className="shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={onClose}
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Toast.displayName = 'Toast';

interface ToastProviderProps {
  children: React.ReactNode;
}

interface ToastContextValue {
  toasts: ToastInstance[];
  addToast: (toast: ToastProps) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  toast: (props: ToastProps) => string; // toast 함수 추가
}

interface ToastInstance extends ToastProps {
  id: string;
  createdAt: Date;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

/**
 * ToastProvider 컴포넌트
 * Toast 컴포넌트를 사용하기 위한 Context Provider
 */
export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = React.useState<ToastInstance[]>([]);

  // 고유 ID 생성
  const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  // 토스트 추가
  const addToast = React.useCallback((toast: ToastProps) => {
    const id = generateId();
    const newToast: ToastInstance = {
      ...toast,
      id,
      createdAt: new Date(),
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  // 토스트 제거
  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // 모든 토스트 제거
  const clearToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  // toast 함수 - 더 간단한 사용을 위한 wrapper
  const toast = React.useCallback(
    (props: ToastProps) => {
      return addToast(props);
    },
    [addToast]
  );

  const value = React.useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      clearToasts,
      toast, // toast 함수 추가
    }),
    [toasts, addToast, removeToast, clearToasts, toast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-sm">
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              {...toast}
              onClose={() => removeToast(toast.id)}
              className="animate-slide-up"
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

/**
 * useToast 훅
 * 토스트 메시지를 추가/제거하는 기능을 제공하는 훅
 */
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * Toaster 컴포넌트
 * ToastProvider의 alias로 호환성을 위해 제공
 */
export const Toaster = ToastProvider;

export { toastVariants };
