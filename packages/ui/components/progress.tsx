import * as React from 'react';
import { cn } from '../utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indeterminate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'info' | 'warning' | 'danger';
  showValue?: boolean;
  valueFormat?: (value: number, max: number) => string;
}

/**
 * Progress 컴포넌트
 * 진행 상태를 표시하는 프로그레스 바
 */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      indeterminate = false,
      size = 'md',
      variant = 'default',
      showValue = false,
      valueFormat,
      ...props
    },
    ref
  ) => {
    // 값 범위 유효성 검사
    const validValue = Math.max(0, Math.min(value, max));
    const percentage = (validValue / max) * 100;

    // 크기별 높이
    const sizeStyles = {
      sm: 'h-1.5',
      md: 'h-2.5',
      lg: 'h-4',
    };

    // 변형별 색상
    const variantStyles = {
      default: 'bg-primary',
      success: 'bg-green-500',
      info: 'bg-blue-500',
      warning: 'bg-amber-500',
      danger: 'bg-red-500',
    };

    // 값 포맷팅
    const formattedValue = valueFormat
      ? valueFormat(validValue, max)
      : `${Math.round(percentage)}%`;

    return (
      <div className="w-full">
        <div
          ref={ref}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : validValue}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuetext={indeterminate ? undefined : formattedValue}
          data-state={indeterminate ? 'indeterminate' : 'determinate'}
          data-value={validValue}
          data-max={max}
          className={cn(
            'relative w-full overflow-hidden rounded-full bg-secondary',
            sizeStyles[size],
            className
          )}
          {...props}
        >
          <div
            className={cn(
              'h-full w-full flex-1 transition-all',
              variantStyles[variant],
              indeterminate && 'animate-progress-indeterminate absolute inset-y-0 left-0 w-3/4'
            )}
            style={{
              transform: indeterminate ? undefined : `translateX(-${100 - percentage}%)`,
            }}
          />
        </div>
        {showValue && !indeterminate && (
          <div className="mt-1 text-right text-xs text-muted-foreground">{formattedValue}</div>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

// 추가 UI 패턴: 레이블이 있는 프로그레스 바
const LabeledProgress = ({
  label,
  value,
  max = 100,
  variant = 'default',
  showValue = true,
  className,
  ...props
}: {
  label: string;
  value: number;
  max?: number;
  // error를 danger로 수정하여 일관성 유지
  variant?: 'default' | 'success' | 'info' | 'warning' | 'danger';
  showValue?: boolean;
  className?: string;
}) => {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-sm font-medium">
        <span>{label}</span>
        {showValue && <span>{percentage}%</span>}
      </div>
      <Progress value={percentage} variant={variant} {...props} />
    </div>
  );
};

export { LabeledProgress };
