import * as React from 'react';

// 필요한 date-fns 함수들을 명시적으로 다시 import
import { ko } from 'date-fns/locale';
import addMonths from 'date-fns/addMonths';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import endOfDay from 'date-fns/endOfDay';
import endOfMonth from 'date-fns/endOfMonth';
import format from 'date-fns/format';
import isSameDay from 'date-fns/isSameDay';
import isSameMonth from 'date-fns/isSameMonth';
import isToday from 'date-fns/isToday';
import isWithinInterval from 'date-fns/isWithinInterval';
import startOfDay from 'date-fns/startOfDay';
import startOfMonth from 'date-fns/startOfMonth';
import subMonths from 'date-fns/subMonths';
import type { Locale } from 'date-fns';

import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '../utils';

import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export interface DateRange {
  from: Date;
  to?: Date;
}

// HTMLAttributes<HTMLDivElement>에서 onChange 속성을 제외하고 확장
export interface DateRangePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: DateRange;
  onChange?: (value: DateRange) => void;
  numberOfMonths?: number;
  disabled?: boolean;
  placeholder?: string;
  showClearButton?: boolean;
  showFooter?: boolean;
  presets?: {
    name: string;
    range: () => DateRange;
  }[];
  closeOnSelect?: boolean;
  disabledDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  formatDisplay?: (range: DateRange) => string;
  locale?: Locale; // 추가: date-fns의 locale 속성
}

/**
 * DateRangePicker 컴포넌트
 * 기간을 선택할 수 있는 날짜 범위 선택기
 */
export const DateRangePicker = React.forwardRef<HTMLDivElement, DateRangePickerProps>(
  (
    {
      value,
      onChange,
      numberOfMonths = 2,
      disabled = false,
      placeholder = '날짜 범위 선택',
      showClearButton = true,
      showFooter = true,
      presets,
      closeOnSelect = false,
      disabledDates = [],
      minDate,
      maxDate,
      className,
      formatDisplay,
      locale = ko, // 기본값으로 한국어 로케일 사용
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [startMonth, setStartMonth] = React.useState(new Date());
    const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(value);
    const [hoverDate, setHoverDate] = React.useState<Date | null>(null);

    // 외부 value prop이 변경됐을 때 내부 상태 동기화
    React.useEffect(() => {
      setSelectedRange(value);

      // value가 있을 경우 시작 월을 value.from을 포함하는 달로 설정
      if (value?.from) {
        setStartMonth(startOfMonth(value.from));
      }
    }, [value]);

    // 날짜 선택 처리
    const handleSelect = (date: Date) => {
      const normalizedDate = startOfDay(date);

      if (!selectedRange || !selectedRange.from || selectedRange.to) {
        // 첫 선택 또는 이미 범위가 완성된 경우 새 범위 시작
        const newRange = {
          from: normalizedDate,
          to: undefined,
        };
        setSelectedRange(newRange);

        if (onChange && closeOnSelect) {
          onChange(newRange);
        }
      } else {
        // 시작일을 선택한 상태에서 종료일 선택
        const isAfterStart = normalizedDate > selectedRange.from;

        const newRange = {
          from: isAfterStart ? selectedRange.from : normalizedDate,
          to: isAfterStart ? normalizedDate : selectedRange.from,
        };

        setSelectedRange(newRange);

        if (onChange) {
          onChange(newRange);
        }

        if (closeOnSelect) {
          setIsOpen(false);
        }
      }
    };

    // 편의 기간 선택
    const handlePresetSelect = (preset: DateRange) => {
      setSelectedRange(preset);

      if (onChange) {
        onChange(preset);
      }

      setIsOpen(false);
    };

    // 날짜 초기화
    const handleClear = () => {
      setSelectedRange(undefined);

      if (onChange) {
        onChange({ from: new Date(), to: undefined });
      }
    };

    // 이전 달로 이동
    const handlePrevious = () => {
      setStartMonth(prev => subMonths(prev, 1));
    };

    // 다음 달로 이동
    const handleNext = () => {
      setStartMonth(prev => addMonths(prev, 1));
    };

    // 날짜 비활성화 여부 확인
    const isDateDisabled = (date: Date): boolean => {
      return (
        (minDate && date < startOfDay(minDate)) ||
        (maxDate && date > endOfDay(maxDate)) ||
        disabledDates.some(disabledDate => isSameDay(date, disabledDate))
      );
    };

    // 날짜 선택 여부 확인
    const isDateSelected = (date: Date): boolean => {
      if (!selectedRange) return false;

      const { from, to } = selectedRange;

      if (to) {
        return isWithinInterval(date, { start: from, end: to });
      }

      return isSameDay(date, from);
    };

    // 날짜 표시 형식
    const formatSelectedRange = (range?: DateRange): string => {
      if (!range || !range.from) return placeholder;

      if (formatDisplay) {
        return formatDisplay(range);
      }

      const fromDate = format(range.from, 'yyyy년 MM월 dd일', { locale });

      if (!range.to) {
        return fromDate;
      }

      const toDate = format(range.to, 'yyyy년 MM월 dd일', { locale });
      return `${fromDate} ~ ${toDate}`;
    };

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        <Popover open={isOpen && !disabled} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'w-full justify-start text-left font-normal',
                !selectedRange && 'text-muted-foreground'
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatSelectedRange(selectedRange)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex flex-col space-y-3 p-3 sm:flex-row sm:space-x-3 sm:space-y-0">
              {/* 프리셋 메뉴 */}
              {presets && presets.length > 0 && (
                <div className="border-b pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
                  <div className="space-y-1">
                    {presets.map((preset, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start font-normal"
                        onClick={() => handlePresetSelect(preset.range())}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col space-y-4">
                {/* 캘린더 헤더 */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handlePrevious}
                    disabled={minDate && startMonth <= startOfMonth(minDate)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm font-medium">{format(startMonth, 'yyyy년 MM월')}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleNext}
                    disabled={
                      maxDate && addMonths(startMonth, numberOfMonths - 1) >= startOfMonth(maxDate)
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* 캘린더 그리드 */}
                <div className="flex flex-wrap gap-4">
                  {Array.from({ length: numberOfMonths }).map((_, i) => {
                    const currentMonth = addMonths(startMonth, i);
                    const month = startOfMonth(currentMonth);
                    const days = eachDayOfInterval({
                      start: month,
                      end: endOfMonth(month),
                    });

                    return (
                      <div key={i} className="w-full min-w-[256px]">
                        {i > 0 && (
                          <div className="mb-2 text-center text-sm font-medium">
                            {format(month, 'yyyy년 MM월')}
                          </div>
                        )}

                        <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
                          {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                            <div key={idx} className="py-1">
                              {day}
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-sm">
                          {Array.from({ length: new Date(month).getDay() }).map((_, idx) => (
                            <div key={`empty-${idx}`} className="h-8 w-8" />
                          ))}
                          {days.map(day => {
                            const isSelected = isDateSelected(day);
                            const isDisabled = isDateDisabled(day);
                            const isRangeStart =
                              selectedRange?.from && isSameDay(day, selectedRange.from);
                            const isRangeEnd =
                              selectedRange?.to && isSameDay(day, selectedRange.to);
                            const isCurrentMonth = isSameMonth(day, month);

                            // 호버 효과를 위한 상태 계산
                            const isHovered =
                              hoverDate &&
                              selectedRange?.from &&
                              !selectedRange.to &&
                              hoverDate > selectedRange.from &&
                              day > selectedRange.from &&
                              day <= hoverDate;

                            return (
                              <div
                                key={day.getTime()}
                                className={cn(
                                  'relative h-8 w-8',
                                  isSelected && 'bg-primary/10',
                                  isRangeStart && 'rounded-l-md bg-primary text-primary-foreground',
                                  isRangeEnd && 'rounded-r-md bg-primary text-primary-foreground',
                                  !isCurrentMonth && 'text-muted-foreground/50'
                                )}
                              >
                                <button
                                  type="button"
                                  className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded-md',
                                    isToday(day) && !isSelected && 'border border-primary',
                                    isHovered && 'bg-primary/5',
                                    (isDisabled || !isCurrentMonth) &&
                                      'pointer-events-none opacity-50'
                                  )}
                                  disabled={isDisabled || !isCurrentMonth}
                                  onClick={() => handleSelect(day)}
                                  onMouseEnter={() => setHoverDate(day)}
                                  onMouseLeave={() => setHoverDate(null)}
                                >
                                  <time dateTime={format(day, 'yyyy-MM-dd')}>
                                    {format(day, 'd')}
                                  </time>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 푸터 액션 */}
                {showFooter && (
                  <div className="flex justify-end gap-2 border-t pt-3">
                    {showClearButton && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        disabled={!selectedRange}
                      >
                        초기화
                      </Button>
                    )}
                    <Button size="sm" onClick={() => setIsOpen(false)}>
                      적용
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

DateRangePicker.displayName = 'DateRangePicker';
