import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '../utils';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    variant?: 'default' | 'success' | 'info' | 'warning' | 'error';
    showValue?: boolean;
    valueFormat?: (value: number[]) => string;
  }
>(
  (
    {
      className,
      variant = 'default',
      showValue = false,
      valueFormat = value => `${value[0]}${value[1] !== undefined ? ` - ${value[1]}` : ''}`,
      ...props
    },
    ref
  ) => {
    const getVariantClass = () => {
      switch (variant) {
        case 'success':
          return 'bg-green-500';
        case 'info':
          return 'bg-blue-500';
        case 'warning':
          return 'bg-yellow-500';
        case 'error':
          return 'bg-red-500';
        default:
          return 'bg-primary';
      }
    };

    return (
      <div className="relative space-y-2">
        <SliderPrimitive.Root
          ref={ref}
          className={cn('relative flex w-full touch-none select-none items-center', className)}
          {...props}
        >
          <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
            <SliderPrimitive.Range className={cn('absolute h-full', getVariantClass())} />
          </SliderPrimitive.Track>
          {props.defaultValue?.map((_, i) => (
            <SliderPrimitive.Thumb
              key={i}
              className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            />
          ))}
        </SliderPrimitive.Root>

        {showValue && props.defaultValue && (
          <div className="w-full text-center text-xs font-medium">
            {valueFormat(props.defaultValue)}
          </div>
        )}
      </div>
    );
  }
);
Slider.displayName = SliderPrimitive.Root.displayName;

// 추가 UI 패턴: 레이블이 있는 슬라이더
const LabeledSlider = ({
  label,
  value,
  onChange,
  variant = 'default',
  showValue = true,
  className,
  min = 0,
  max = 100,
  step = 1,
  ...props
}: {
  label: string;
  value: number[];
  onChange?: (value: number[]) => void;
  variant?: 'default' | 'success' | 'info' | 'warning' | 'error';
  showValue?: boolean;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm font-medium">
        <span>{label}</span>
        {showValue && (
          <span>
            {value[0]}
            {value[1] !== undefined ? ` - ${value[1]}` : ''}
          </span>
        )}
      </div>
      <Slider
        defaultValue={value}
        variant={variant}
        onValueChange={onChange}
        min={min}
        max={max}
        step={step}
        {...props}
      />
    </div>
  );
};

export { Slider, LabeledSlider };
