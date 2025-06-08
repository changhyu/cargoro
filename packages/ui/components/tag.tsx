import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '../utils';

const tagVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        success: 'bg-green-500 text-white hover:bg-green-600',
        warning: 'bg-amber-500 text-white hover:bg-amber-600',
        danger: 'bg-red-500 text-white hover:bg-red-600',
        info: 'bg-blue-500 text-white hover:bg-blue-600',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'bg-transparent hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        xs: 'h-5 px-1.5 text-xs',
        sm: 'h-6 px-2 text-xs',
        md: 'h-7 px-2.5 text-sm',
        lg: 'h-8 px-3 text-sm',
      },
      shape: {
        default: 'rounded-md',
        rounded: 'rounded-full',
      },
      interactive: {
        true: 'cursor-pointer focus:ring-2 focus:ring-ring focus:ring-offset-2',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      shape: 'default',
      interactive: false,
    },
  }
);

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {
  onRemove?: () => void;
  removable?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

/**
 * Tag/Chip 컴포넌트
 * 콘텐츠 태깅 및 분류에 사용하는 작은 요소
 */
export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      className,
      variant,
      size,
      shape,
      interactive,
      children,
      onRemove,
      removable = false,
      disabled = false,
      icon,
      ...props
    },
    ref
  ) => {
    // 삭제 버튼 클릭 시 이벤트 버블링 방지
    const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (!disabled && onRemove) {
        onRemove();
      }
    };

    return (
      <span
        ref={ref}
        className={cn(
          tagVariants({ variant, size, shape, interactive }),
          disabled && 'pointer-events-none cursor-not-allowed opacity-60',
          removable && 'pr-1', // 삭제 버튼이 있는 경우 오른쪽 패딩 조정
          className
        )}
        {...props}
      >
        {/* 아이콘이 있는 경우 */}
        {icon && <span className={cn('mr-1', size === 'xs' ? 'mr-0.5' : 'mr-1')}>{icon}</span>}

        {/* 텍스트 콘텐츠 */}
        <span className="truncate">{children}</span>

        {/* 삭제 버튼 */}
        {removable && (
          <button
            type="button"
            className={cn(
              'ml-1 flex-shrink-0 rounded-full p-0.5 transition-colors',
              size === 'xs' ? 'ml-0.5' : 'ml-1',
              disabled
                ? 'opacity-50'
                : variant === 'outline' || variant === 'ghost'
                  ? 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  : 'hover:bg-primary-foreground/20'
            )}
            onClick={handleRemoveClick}
            aria-label="태그 삭제"
            tabIndex={disabled ? -1 : 0}
            disabled={disabled}
          >
            <X className={cn(size === 'xs' ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
          </button>
        )}
      </span>
    );
  }
);

Tag.displayName = 'Tag';

/**
 * TagGroup 컴포넌트
 * 태그 그룹을 표시하는 컨테이너
 */
export interface TagGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'tight' | 'default' | 'loose';
  wrap?: boolean;
}

export const TagGroup = React.forwardRef<HTMLDivElement, TagGroupProps>(
  ({ className, spacing = 'default', wrap = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          wrap ? 'flex-wrap' : 'flex-nowrap overflow-x-auto',
          spacing === 'tight' && 'gap-1',
          spacing === 'default' && 'gap-2',
          spacing === 'loose' && 'gap-3',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TagGroup.displayName = 'TagGroup';

/**
 * TagInput 컴포넌트
 * 태그 입력 필드
 */
export interface TagInputProps extends React.HTMLAttributes<HTMLDivElement> {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxTags?: number;
  variant?: VariantProps<typeof tagVariants>['variant'];
  size?: VariantProps<typeof tagVariants>['size'];
  shape?: VariantProps<typeof tagVariants>['shape'];
  validator?: (value: string) => boolean;
  duplicateError?: string;
  maxTagsError?: string;
  validationError?: string;
}

export const TagInput = React.forwardRef<HTMLDivElement, TagInputProps>(
  (
    {
      className,
      tags,
      onTagsChange,
      placeholder = '태그 입력 후 Enter...',
      disabled = false,
      maxTags,
      variant = 'outline',
      size = 'md',
      shape = 'default',
      validator,
      duplicateError = '이미 존재하는 태그입니다',
      maxTagsError = '최대 태그 수에 도달했습니다',
      validationError = '유효하지 않은 태그입니다',
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // 태그 추가 처리
    const handleAddTag = (value: string) => {
      const trimmedValue = value.trim();
      if (!trimmedValue) return;

      // 유효성 검사
      if (validator && !validator(trimmedValue)) {
        setError(validationError);
        return;
      }

      // 최대 태그 수 검사
      if (maxTags && tags.length >= maxTags) {
        setError(maxTagsError);
        return;
      }

      // 중복 검사
      if (tags.includes(trimmedValue)) {
        setError(duplicateError);
        return;
      }

      // 태그 추가
      onTagsChange([...tags, trimmedValue]);
      setInputValue('');
      setError(null);
    };

    // 태그 삭제 처리
    const handleRemoveTag = (index: number) => {
      const newTags = [...tags];
      newTags.splice(index, 1);
      onTagsChange(newTags);
      setError(null);
    };

    // 키 이벤트 처리
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag(inputValue);
      } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
        // 입력란이 비어 있고 Backspace 키를 누르면 마지막 태그 삭제
        handleRemoveTag(tags.length - 1);
      }
    };

    return (
      <div ref={ref} className={cn('flex flex-col gap-1.5', className)} {...props}>
        <div
          className={cn(
            'flex min-h-9 w-full flex-wrap gap-1.5 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
            disabled
              ? 'cursor-not-allowed opacity-50'
              : 'focus-within:ring-1 focus-within:ring-ring'
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {/* 태그 목록 */}
          {tags.map((tag, index) => (
            <Tag
              key={`${tag}-${index}`}
              variant={variant}
              size={size}
              shape={shape}
              removable
              onRemove={() => handleRemoveTag(index)}
              disabled={disabled}
            >
              {tag}
            </Tag>
          ))}

          {/* 입력 필드 */}
          <input
            ref={inputRef}
            type="text"
            className={cn(
              'flex-grow bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed',
              tags.length > 0 ? 'ml-1.5' : ''
            )}
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (inputValue) {
                handleAddTag(inputValue);
              }
            }}
            placeholder={tags.length === 0 ? placeholder : ''}
            disabled={disabled}
          />
        </div>

        {/* 에러 메시지 */}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

TagInput.displayName = 'TagInput';

export { tagVariants };
