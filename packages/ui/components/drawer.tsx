import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '../utils';

const drawerVariants = cva(
  'fixed inset-y-0 flex flex-col bg-white shadow-lg transition-all duration-300 ease-in-out dark:bg-gray-950 z-50',
  {
    variants: {
      side: {
        left: 'left-0 border-r',
        right: 'right-0 border-l',
      },
      size: {
        sm: 'w-64',
        md: 'w-80',
        lg: 'w-96',
        xl: 'w-[30rem]',
        full: 'w-screen',
      },
    },
    defaultVariants: {
      side: 'right',
      size: 'md',
    },
  }
);

export interface DrawerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof drawerVariants> {
  open: boolean;
  onClose: () => void;
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEsc?: boolean;
  overlay?: boolean;
  overlayClassName?: string;
  closeButtonClassName?: string;
}

const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({
    className,
    children,
    side,
    size,
    open,
    onClose,
    showCloseButton = true,
    closeOnOutsideClick = true,
    closeOnEsc = true,
    overlay = true,
    overlayClassName,
    closeButtonClassName,
    ...props
  }) => {
    const drawerRef = React.useRef<HTMLDivElement>(null);

    // 키보드 ESC 핸들링
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (closeOnEsc && e.key === 'Escape' && open) {
          onClose();
        }
      };

      if (open) {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden'; // 스크롤 방지
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = ''; // 스크롤 복구
      };
    }, [closeOnEsc, onClose, open]);

    // 외부 클릭 핸들링
    const handleOverlayClick = (e: React.MouseEvent) => {
      if (
        closeOnOutsideClick &&
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    if (!open) return null;

    const translateValue = side === 'left' ? '-translate-x-full' : 'translate-x-full';

    return (
      <>
        {overlay && (
          <div
            className={cn(
              'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300',
              overlayClassName
            )}
            onClick={handleOverlayClick}
          />
        )}
        <div
          ref={drawerRef}
          className={cn(
            drawerVariants({ side, size }),
            open ? 'translate-x-0' : translateValue,
            className
          )}
          {...props}
        >
          {showCloseButton && (
            <button
              onClick={onClose}
              className={cn(
                'absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300',
                closeButtonClassName
              )}
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          {children}
        </div>
      </>
    );
  }
);

Drawer.displayName = 'Drawer';

const DrawerHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('border-b px-6 pb-2 pt-6', className)} {...props} />
  )
);

DrawerHeader.displayName = 'DrawerHeader';

const DrawerTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn('text-xl font-semibold tracking-tight', className)} {...props} />
  )
);

DrawerTitle.displayName = 'DrawerTitle';

const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-gray-500 dark:text-gray-400', className)} {...props} />
));

DrawerDescription.displayName = 'DrawerDescription';

const DrawerContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex-1 overflow-auto p-6', className)} {...props} />
  )
);

DrawerContent.displayName = 'DrawerContent';

const DrawerFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('border-t p-6', className)} {...props} />
  )
);

DrawerFooter.displayName = 'DrawerFooter';

export { Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerContent, DrawerFooter };
