import * as React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { cn } from '../utils';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  icon?: React.ReactNode;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  loading?: boolean;
  children?: React.ReactNode;
  disableCloseButton?: boolean;
  closeOnConfirm?: boolean;
  preventOutsideClick?: boolean;
  confirmButtonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  cancelButtonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

/**
 * ConfirmDialog 컴포넌트
 * 사용자에게 특정 작업을 확인 또는 취소할 수 있는 다이얼로그 창을 제공합니다.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'default',
  icon,
  contentClassName,
  headerClassName,
  footerClassName,
  loading = false,
  children,
  disableCloseButton = false,
  closeOnConfirm = true,
  preventOutsideClick = false,
  confirmButtonVariant = 'default',
  cancelButtonVariant = 'outline',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    if (closeOnConfirm) {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  // 기본 아이콘 선택
  const getDefaultIcon = () => {
    switch (variant) {
      case 'destructive':
        return <AlertCircle className="h-6 w-6 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-500" />;
      default:
        return null;
    }
  };

  const defaultIcon = getDefaultIcon();
  const displayIcon = icon || defaultIcon;

  // 확인 버튼 variant 설정
  const getConfirmButtonVariant = () => {
    if (confirmButtonVariant !== 'default') return confirmButtonVariant;

    switch (variant) {
      case 'destructive':
        return 'destructive';
      case 'success':
        return 'default';
      case 'warning':
        return 'default';
      case 'info':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onOpenChange={preventOutsideClick ? undefined : onOpenChange}>
      <DialogContent className={cn('sm:max-w-[425px]', contentClassName)}>
        {!disableCloseButton && (
          <DialogClose
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">닫기</span>
          </DialogClose>
        )}

        <DialogHeader className={cn('gap-2', headerClassName)}>
          <div className="flex items-center gap-3">
            {displayIcon && <span>{displayIcon}</span>}
            <DialogTitle>{title}</DialogTitle>
          </div>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children && <div className="py-4">{children}</div>}

        <DialogFooter className={cn('gap-2 sm:gap-0', footerClassName)}>
          <Button
            type="button"
            variant={cancelButtonVariant}
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={getConfirmButtonVariant()}
            onClick={handleConfirm}
            disabled={loading}
            className={loading ? 'cursor-not-allowed' : ''}
          >
            {loading ? '처리 중...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface UseConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogProps['variant'];
  icon?: React.ReactNode;
  closeOnConfirm?: boolean;
  preventOutsideClick?: boolean;
}

interface UseConfirmReturn {
  confirm: (options: UseConfirmOptions) => Promise<boolean>;
  ConfirmDialog: React.FC;
}

/**
 * useConfirm 훅
 * Promise 기반으로 확인 다이얼로그를 표시하는 훅
 */
export function useConfirm(): UseConfirmReturn {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<UseConfirmOptions>({
    title: '',
  });
  const [resolveRef, setResolveRef] = React.useState<((value: boolean) => void) | null>(null);

  const confirm = React.useCallback((options: UseConfirmOptions) => {
    return new Promise<boolean>(resolve => {
      setOptions(options);
      setOpen(true);
      setResolveRef(() => resolve);
    });
  }, []);

  const handleConfirm = React.useCallback(() => {
    if (resolveRef) {
      resolveRef(true);
      setResolveRef(null);
    }
  }, [resolveRef]);

  const handleCancel = React.useCallback(() => {
    if (resolveRef) {
      resolveRef(false);
      setResolveRef(null);
    }
  }, [resolveRef]);

  const ConfirmDialogComponent = React.useCallback(() => {
    return (
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title={options.title}
        description={options.description}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
        icon={options.icon}
        closeOnConfirm={options.closeOnConfirm}
        preventOutsideClick={options.preventOutsideClick}
      />
    );
  }, [open, options, handleConfirm, handleCancel]);

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
  };
}
