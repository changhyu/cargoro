'use client';

import React from 'react';
import { cn } from '@cargoro/ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@cargoro/ui';
import { CalendarIcon, Download, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { DateRange } from '../types';
import { useAnalyticsStore } from '../store';

interface AnalyticsHeaderProps {
  title: string;
  description?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  showDatePicker?: boolean;
  showGroupBy?: boolean;
  className?: string;
}

export function AnalyticsHeader({
  title,
  description,
  onRefresh,
  onExport,
  showDatePicker = true,
  showGroupBy = true,
  className,
}: AnalyticsHeaderProps) {
  const { dateRange, filters, setDateRange, setDatePreset, setFilters } = useAnalyticsStore();

  return (
    <Card className={cn('mb-6', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                새로고침
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="mr-2 h-4 w-4" />
                내보내기
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {(showDatePicker || showGroupBy) && (
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-4">
            {showDatePicker && (
              <div className="flex items-center gap-2">
                <Select
                  value={dateRange.preset || 'custom'}
                  onValueChange={(value: string) => {
                    if (value !== 'custom') {
                      setDatePreset(value as DateRange['preset']);
                    }
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">오늘</SelectItem>
                    <SelectItem value="yesterday">어제</SelectItem>
                    <SelectItem value="last7days">최근 7일</SelectItem>
                    <SelectItem value="last30days">최근 30일</SelectItem>
                    <SelectItem value="thisMonth">이번 달</SelectItem>
                    <SelectItem value="lastMonth">지난 달</SelectItem>
                    <SelectItem value="thisYear">올해</SelectItem>
                    <SelectItem value="custom">사용자 지정</SelectItem>
                  </SelectContent>
                </Select>

                {dateRange.preset === 'custom' && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(dateRange.start, 'PP', { locale: ko })} -{' '}
                        {format(dateRange.end, 'PP', { locale: ko })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.start}
                        selected={{
                          from: dateRange.start,
                          to: dateRange.end,
                        }}
                        onSelect={(range: { from?: Date; to?: Date } | undefined) => {
                          if (range?.from && range?.to) {
                            setDateRange({
                              start: range.from,
                              end: range.to,
                              preset: 'custom',
                            });
                          }
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            )}

            {showGroupBy && (
              <Select
                value={filters.groupBy}
                onValueChange={(value: string) => setFilters({ groupBy: value as any })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">일별</SelectItem>
                  <SelectItem value="week">주별</SelectItem>
                  <SelectItem value="month">월별</SelectItem>
                  <SelectItem value="quarter">분기별</SelectItem>
                  <SelectItem value="year">연도별</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
