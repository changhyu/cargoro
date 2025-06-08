import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '../utils';

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn('grid gap-2', className)} {...props} ref={ref} />;
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    variant?: 'default' | 'colored';
  }
>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'colored' &&
          'border-primary data-[state=checked]:border-transparent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <div
          className={cn(
            'h-2 w-2 rounded-full',
            variant === 'default' ? 'bg-primary' : 'bg-primary-foreground'
          )}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

// 추가 UI 패턴: 라벨이 있는 라디오 아이템
interface RadioGroupItemWithLabelProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupItem> {
  label: string;
  description?: string;
  disabled?: boolean;
}

const RadioGroupItemWithLabel = ({
  id,
  label,
  description,
  disabled,
  className,
  ...props
}: RadioGroupItemWithLabelProps) => {
  const radioId = id || `radio-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={cn('flex items-start space-x-2', className)}>
      <RadioGroupItem id={radioId} disabled={disabled} {...props} />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor={radioId}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            disabled && 'cursor-not-allowed opacity-70'
          )}
        >
          {label}
        </label>
        {description && (
          <p className={cn('text-sm text-muted-foreground', disabled && 'opacity-70')}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
RadioGroupItemWithLabel.displayName = 'RadioGroupItemWithLabel';

// 추가 UI 패턴: 카드형 라디오 아이템
interface RadioGroupCardItemProps extends React.ComponentPropsWithoutRef<typeof RadioGroupItem> {
  value: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const RadioGroupCardItem = ({
  value,
  title,
  description,
  icon,
  disabled,
  className,
  ...props
}: RadioGroupCardItemProps) => {
  const radioId = `radio-card-${value}`;

  return (
    <div className="relative">
      <RadioGroupPrimitive.Item
        id={radioId}
        value={value}
        disabled={disabled}
        className="peer sr-only"
        {...props}
      />
      <label
        htmlFor={radioId}
        className={cn(
          'flex cursor-pointer items-start rounded-lg border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        {icon && <div className="mr-3 mt-0.5 text-muted-foreground">{icon}</div>}
        <div className="grid gap-1">
          <div className="text-sm font-medium leading-none">{title}</div>
          {description && <div className="text-sm text-muted-foreground">{description}</div>}
        </div>
        <div className="absolute right-4 top-4 h-3 w-3 rounded-full border-2 border-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary"></div>
      </label>
    </div>
  );
};
RadioGroupCardItem.displayName = 'RadioGroupCardItem';

export { RadioGroup, RadioGroupItem, RadioGroupItemWithLabel, RadioGroupCardItem };
