import React, { useState, createContext, useContext } from 'react';

import { cn } from '../../lib/utils';

// Select 컨텍스트 생성
interface SelectContextType {
  onSelectValue: (value: string) => void;
}

const SelectContext = createContext<SelectContextType | null>(null);

// 모의 Select 컴포넌트 타입 정의
export interface SelectProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
  position?: 'item-aligned' | 'popper' | 'fixed';
  popperPosition?: 'top' | 'bottom' | 'right' | 'left';
}

export interface SelectItemProps {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export interface SelectGroupProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

// 모의 컴포넌트 타입 정의 (React Element 타입용)
const ITEM_TYPE = Symbol('select-item');
const GROUP_TYPE = Symbol('select-group');

// 모의 Select 컴포넌트
export function Select({
  value,
  defaultValue,
  placeholder = '선택하세요',
  disabled = false,
  onValueChange,
  className,
  children,
}: SelectProps) {
  const [selectedValue, setSelectedValue] = useState<string | undefined>(value || defaultValue);
  const [open, setOpen] = useState(false);

  const handleSelectClick = () => {
    if (!disabled) {
      setOpen(!open);
    }
  };

  const handleItemClick = (val: string) => {
    setSelectedValue(val);
    if (onValueChange) {
      onValueChange(val);
    }
    setOpen(false);
  };

  // children에서 선택된 값에 해당하는 라벨 찾기
  const findLabelForValue = (): React.ReactNode => {
    if (!selectedValue) return placeholder;

    let label: React.ReactNode = selectedValue;

    // SelectItem 컴포넌트에서 값을 찾기
    React.Children.forEach(children, child => {
      if (React.isValidElement(child)) {
        // SelectItem 타입 체크
        if (child.type === SelectItem) {
          const props = child.props as SelectItemProps;
          if (props.value === selectedValue) {
            label = props.children;
          }
        }
        // SelectGroup 타입 체크
        else if (child.type === SelectGroup) {
          // SelectGroup 안의 SelectItem 컴포넌트에서 값을 찾기
          const groupProps = child.props as SelectGroupProps;
          React.Children.forEach(groupProps.children, groupChild => {
            if (React.isValidElement(groupChild) && groupChild.type === SelectItem) {
              const itemProps = groupChild.props as SelectItemProps;
              if (itemProps.value === selectedValue) {
                label = itemProps.children;
              }
            }
          });
        }
      }
    });

    return label;
  };

  return (
    <SelectContext.Provider value={{ onSelectValue: handleItemClick }}>
      <div className={cn('relative', className)} data-testid="select-container">
        <button
          data-testid="select-trigger"
          onClick={handleSelectClick}
          disabled={disabled}
          className={cn(
            'flex h-10 items-center justify-between rounded-md border px-3 py-2 text-sm',
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          )}
        >
          <span>{findLabelForValue()}</span>
          <span className="ml-2">▼</span>
        </button>

        {open && (
          <div
            data-testid="select-content"
            className={cn(
              'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md animate-in fade-in-80',
              'left-0 top-full mt-1 w-full'
            )}
            role="listbox"
          >
            {children}
          </div>
        )}
      </div>
    </SelectContext.Provider>
  );
}

// 모의 SelectItem 컴포넌트
export function SelectItem({ value, disabled = false, children, className }: SelectItemProps) {
  const selectContext = useContext(SelectContext);

  // 키보드 이벤트 핸들러 추가
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as unknown as React.MouseEvent);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    // Context를 통해 Select 컴포넌트의 handleItemClick 직접 호출
    if (selectContext) {
      selectContext.onSelectValue(value);
    }
  };

  return (
    <div
      data-testid={`option-${value}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="option"
      aria-selected={false}
      tabIndex={disabled ? -1 : 0}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100',
        className
      )}
      data-disabled={disabled ? 'true' : undefined}
      data-value={value}
    >
      {children}
    </div>
  );
}

// 모의 SelectGroup 컴포넌트
export function SelectGroup({ label, children, className }: SelectGroupProps) {
  return (
    <div className={cn('px-2 py-1.5', className)} role="group" aria-label={label}>
      {label && <div className="text-xs font-semibold">{label}</div>}
      {children}
    </div>
  );
}

// 스크롤 버튼 컴포넌트
export function SelectScrollUpButton() {
  const handleClick = () => {
    // 스크롤 로직
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      data-radix-select-scroll-up-button=""
      className="flex h-6 cursor-pointer items-center justify-center border-b bg-white"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label="스크롤 위로"
    >
      ▲
    </div>
  );
}

export function SelectScrollDownButton() {
  const handleClick = () => {
    // 스크롤 로직
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      data-radix-select-scroll-down-button=""
      className="flex h-6 cursor-pointer items-center justify-center border-t bg-white"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label="스크롤 아래로"
    >
      ▼
    </div>
  );
}

// 모의 컴포넌트 다시 내보내기
export const Root = Select;
export const Item = SelectItem;
export const Group = SelectGroup;
