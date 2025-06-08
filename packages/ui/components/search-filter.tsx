import React, { useState } from 'react';

import { Search, X } from 'lucide-react';

import { Button } from './button';
import { Input } from './input';

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface DateRange {
  from?: string;
  to?: string;
}

export interface SearchFilterProps {
  searchValue?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onSearchChange?: (value: string) => void;
  filterOptions?: Array<{
    key: string;
    label: string;
    type: 'select' | 'text' | 'date' | 'dateRange' | 'number' | 'boolean';
    options?: FilterOption[];
    placeholder?: string;
  }>;
  defaultFilters?: Record<string, string | number | DateRange | boolean>;
  onFilter?: (filters: Record<string, string | number | DateRange | boolean>) => void;
  onFilterChange?: (key: string, value: string | number | DateRange | boolean) => void;
  onClearFilters?: () => void;
  collapsible?: boolean;
  showSearchButton?: boolean;
  showFilterButton?: boolean;
  variant?: 'ghost' | 'outline' | 'default';
  className?: string;
}

export function SearchFilter({
  searchValue = '',
  searchPlaceholder,
  onSearch,
  onSearchChange,
  filterOptions = [],
  defaultFilters = {},
  onFilter,
  onFilterChange,
  onClearFilters,
  collapsible = false,
  showSearchButton = true,
  showFilterButton = true,
  variant = 'default',
  className = '',
}: SearchFilterProps) {
  const [search, setSearch] = useState(searchValue);
  const [filtersState, setFiltersState] = useState(defaultFilters);
  const activeFilterCount = Object.values(filtersState).filter(
    v =>
      v !== '' &&
      v !== undefined &&
      v !== null &&
      !(typeof v === 'object' && !(v as DateRange).from && !(v as DateRange).to)
  ).length;
  const [open, setOpen] = useState(!collapsible && filterOptions.length > 0);

  const handleSearch = () => {
    onSearch?.(search);
    onSearchChange?.(search);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleFilterChangeAll = (key: string, value: string | number | DateRange | boolean) => {
    const next = { ...filtersState, [key]: value };
    setFiltersState(next);
    onFilter?.(next);
    onFilterChange?.(key, value);
  };

  const handleClear = () => {
    setFiltersState({});
    onFilter?.({});
    onClearFilters?.();
  };

  const renderFilterInput = (filter: {
    key: string;
    label: string;
    type: 'select' | 'text' | 'date' | 'dateRange' | 'number' | 'boolean';
    options?: FilterOption[];
    placeholder?: string;
  }) => {
    const currentValue = filtersState[filter.key] || '';

    switch (filter.type) {
      case 'select':
        return (
          <div key={filter.key} className="relative">
            <label htmlFor={filter.key} className="mb-1 block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <select
              id={filter.key}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={currentValue as string}
              onChange={e => handleFilterChangeAll(filter.key, e.target.value)}
            >
              <option value="">{filter.placeholder || `${filter.label} 선택`}</option>
              {filter.options?.map((option: FilterOption) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'text':
      case 'number':
        return (
          <div key={filter.key} className="relative">
            <label htmlFor={filter.key} className="mb-1 block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <Input
              id={filter.key}
              type={filter.type === 'number' ? 'number' : 'text'}
              placeholder={filter.placeholder || filter.label}
              value={currentValue as string}
              onChange={e => handleFilterChangeAll(filter.key, e.target.value)}
              className="w-full"
            />
          </div>
        );

      case 'boolean':
        return (
          <div key={filter.key} className="relative">
            <label htmlFor={filter.key} className="mb-1 block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <select
              id={filter.key}
              value={String(currentValue)}
              onChange={e => handleFilterChangeAll(filter.key, e.target.value === 'true')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{filter.placeholder || `${filter.label} 선택`}</option>
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
        );

      case 'dateRange': {
        const dateRange = (currentValue as DateRange) || {};
        return (
          <div key={filter.key} className="relative">
            <label htmlFor={filter.key} className="mb-1 block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <div className="flex space-x-2">
              <Input
                id={`${filter.key}-from`}
                type="date"
                placeholder="시작일"
                value={dateRange.from || ''}
                onChange={e =>
                  handleFilterChangeAll(filter.key, {
                    ...dateRange,
                    from: e.target.value,
                  })
                }
                className="flex-1"
              />
              <Input
                id={`${filter.key}-to`}
                type="date"
                placeholder="종료일"
                value={dateRange.to || ''}
                onChange={e =>
                  handleFilterChangeAll(filter.key, {
                    ...dateRange,
                    to: e.target.value,
                  })
                }
                className="flex-1"
              />
            </div>
          </div>
        );
      }

      case 'date':
        return (
          <div key={filter.key} className="relative">
            <label htmlFor={filter.key} className="mb-1 block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <select
              id={filter.key}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={(currentValue as string) || ''}
              onChange={e => handleFilterChangeAll(filter.key, e.target.value)}
            >
              <option value="">{filter.placeholder || '기간 선택'}</option>
              <option value="today">오늘</option>
              <option value="week">이번 주</option>
              <option value="month">이번 달</option>
              <option value="quarter">이번 분기</option>
              <option value="year">올해</option>
            </select>
          </div>
        );

      default:
        return (
          <div key={filter.key} className="relative">
            <label htmlFor={filter.key} className="mb-1 block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <Input
              id={filter.key}
              placeholder={filter.placeholder || filter.label}
              value={(currentValue as string) || ''}
              onChange={e => handleFilterChangeAll(filter.key, e.target.value)}
              className="w-full"
            />
          </div>
        );
    }
  };

  const variantClass =
    variant === 'ghost'
      ? 'bg-transparent'
      : variant === 'outline'
        ? 'border bg-background p-4'
        : 'bg-background';
  return (
    <div data-testid="search-filter" className={`${variantClass} space-y-4 ${className}`}>
      {/* 검색 바 */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            data-testid="input"
            id="search"
            placeholder={searchPlaceholder || '검색어를 입력하세요...'}
            value={search}
            onChange={e => {
              setSearch(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10"
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
              onClick={() => setSearch('')}
            >
              <X className="h-4 w-4" data-testid="x-icon" />
            </Button>
          )}
        </div>
        {showSearchButton && <Button onClick={handleSearch}>검색</Button>}
      </div>

      {/* 필터 영역 */}
      {filterOptions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {showFilterButton && (
              <button onClick={() => setOpen(!open)} className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">필터</span>
                {activeFilterCount > 0 && (
                  <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}
            {open && <div>검색 필터</div>}
            {open && activeFilterCount > 0 && <Button onClick={handleClear}>필터 초기화</Button>}
          </div>

          {open && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filterOptions.map(renderFilterInput)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
