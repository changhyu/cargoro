'use client';

import { useState } from 'react';
import { cn, Button, Calendar, Popover, PopoverContent, PopoverTrigger } from '@cargoro/ui';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

interface DateRangePickerProps {
  value: { from: Date; to: Date } | undefined;
  onChange: (range: { from: Date; to: Date } | undefined) => void;
  placeholder?: string;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = '날짜 선택',
  align = 'start',
  className,
}: DateRangePickerProps) {
  const [date, setDate] = useState<{ from: Date; to: Date } | undefined>(value);

  const handleApply = () => {
    if (date?.from && date?.to) {
      onChange(date);
    }
  };

  const handleClear = () => {
    setDate(undefined);
    onChange(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('w-full justify-start text-left', className)}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <span>
                {format(date.from, 'yyyy.MM.dd', { locale: ko })} -{' '}
                {format(date.to, 'yyyy.MM.dd', { locale: ko })}
              </span>
            ) : (
              format(date.from, 'yyyy.MM.dd', { locale: ko })
            )
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <div className="border-b p-3">
          <Calendar
            mode="range"
            selected={{ from: date?.from, to: date?.to }}
            onSelect={(range: { from?: Date; to?: Date } | undefined) => {
              if (range?.from && range?.to) {
                setDate({ from: range.from, to: range.to });
              } else if (range?.from) {
                setDate({ from: range.from, to: range.from });
              }
            }}
            numberOfMonths={2}
            locale={ko}
          />
        </div>
        <div className="flex items-center justify-between border-t p-3">
          <Button variant="outline" size="sm" onClick={handleClear}>
            초기화
          </Button>
          <Button size="sm" onClick={handleApply}>
            적용
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
