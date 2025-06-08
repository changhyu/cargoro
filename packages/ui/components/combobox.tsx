import * as React from 'react';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '../utils';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export interface ComboboxOption {
  label: string;
  value: string;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
}

export interface ComboboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  clearable?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  align?: 'start' | 'center' | 'end';
  displayValue?: (option: ComboboxOption | undefined) => string;
  onSearch?: (value: string) => void;
  loading?: boolean;
  loadingMessage?: string;
  maxDisplayItems?: number;
  virtualized?: boolean;
}

const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  ({
    className,
    options,
    value,
    defaultValue,
    onChange,
    placeholder = '항목 선택',
    emptyMessage = '일치하는 항목이 없습니다',
    clearable = false,
    searchable = true,
    disabled = false,
    size = 'default',
    align = 'start',
    displayValue,
    onSearch,
    loading = false,
    loadingMessage = '로딩 중...',
    maxDisplayItems = 6,
    virtualized = false,
    ...props
  }) => {
    const [open, setOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState<string | undefined>(
      value || defaultValue
    );
    const [searchQuery, setSearchQuery] = React.useState('');
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    // 외부에서 value가 변경되면 내부 상태도 업데이트
    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    const handleSelect = (option: ComboboxOption) => {
      if (option.disabled) return;

      setSelectedValue(option.value);
      onChange?.(option.value);
      setOpen(false);
      setSearchQuery('');
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedValue(undefined);
      onChange?.('');
      setSearchQuery('');
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);

      if (onSearch) {
        onSearch(value);
      }
    };

    // 선택된 옵션 찾기
    const selectedOption = options.find(option => option.value === selectedValue);

    // 검색 필터링
    const filteredOptions = searchQuery
      ? options.filter(
          option =>
            option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            option.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    // 표시 값 생성
    const getDisplayValue = () => {
      if (!selectedOption) return '';

      return displayValue ? displayValue(selectedOption) : selectedOption.label;
    };

    // 팝업 열릴 때 검색 입력에 포커스
    React.useEffect(() => {
      if (open && searchable && searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 0);
      }
    }, [open, searchable]);

    // 선택된 옵션의 색상 스타일
    const getOptionStyles = (option: ComboboxOption) => {
      return cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none',
        option.disabled && 'opacity-50 cursor-not-allowed',
        option.value === selectedValue
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      );
    };

    // 사이즈 분기 스타일
    const getButtonSizeStyles = () => {
      switch (size) {
        case 'sm':
          return 'h-8 px-2 text-xs';
        case 'lg':
          return 'h-11 px-4 text-base';
        default:
          return 'h-10 px-3 text-sm';
      }
    };

    // 스크롤 영역 높이 계산
    const getScrollHeight = () => {
      // 각 아이템 높이 (대략적인 예상치)
      const itemHeight = 36;
      const padding = 8;

      const totalItems = Math.min(filteredOptions.length, maxDisplayItems);

      // 검색 입력창 높이 추가
      const searchInputHeight = searchable ? 40 : 0;

      return totalItems * itemHeight + padding * 2 + searchInputHeight;
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-between font-normal',
              getButtonSizeStyles(),
              !selectedValue && 'text-muted-foreground',
              disabled && 'cursor-not-allowed opacity-50',
              className
            )}
            disabled={disabled}
          >
            {selectedValue ? (
              <div className="flex items-center gap-2 truncate">
                {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
                <span className="truncate">{getDisplayValue()}</span>
              </div>
            ) : (
              <span>{placeholder}</span>
            )}

            <div className="flex items-center gap-1">
              {selectedValue && clearable && (
                <span
                  role="button"
                  className="inline-flex h-auto cursor-pointer rounded-full p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={handleClear}
                  aria-label="지우기"
                  data-testid="combobox-clear-btn"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align={align}
          sideOffset={5}
          style={{ width: 'var(--radix-popover-trigger-width)' }}
        >
          <div className="flex flex-col">
            {searchable && (
              <div className="flex items-center border-b px-3 py-2">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                  ref={searchInputRef}
                  className="flex h-8 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  {...props}
                />
                {searchQuery && (
                  <span
                    role="button"
                    className="inline-flex h-auto cursor-pointer rounded-full p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setSearchQuery('')}
                    aria-label="검색어 지우기"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </span>
                )}
              </div>
            )}

            <div className="overflow-y-auto" style={{ maxHeight: `${getScrollHeight()}px` }}>
              {loading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {loadingMessage}
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</div>
              ) : (
                filteredOptions.map(option => (
                  <div
                    key={option.value}
                    className={getOptionStyles(option)}
                    onClick={() => !option.disabled && handleSelect(option)}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {option.icon && <span className="shrink-0">{option.icon}</span>}
                      <div className="flex flex-col truncate">
                        <span className="truncate">{option.label}</span>
                        {option.description && (
                          <span className="truncate text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </div>
                    {option.value === selectedValue && (
                      <Check className="ml-auto h-4 w-4 shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

Combobox.displayName = 'Combobox';

export { Combobox };
