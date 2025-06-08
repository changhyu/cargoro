import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChartData, TimeSeriesData } from './types';

/**
 * 숫자 포맷팅
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * 통화 포맷팅
 */
export function formatCurrency(amount: number, currency: string = 'KRW'): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * 퍼센트 포맷팅
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 변화율 계산
 */
export function calculateChangeRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 1 : 0;
  return (current - previous) / previous;
}

/**
 * 날짜 포맷팅
 */
export function formatDate(date: Date | string, formatStr: string = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr, { locale: ko });
}

/**
 * 상대적 시간 포맷팅
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: ko });
}

/**
 * 시간 범위 포맷팅
 */
export function formatDateRange(start: Date, end: Date): string {
  const days = differenceInDays(end, start);

  if (days === 0) {
    return format(start, 'yyyy년 M월 d일', { locale: ko });
  } else if (days < 30) {
    return `${format(start, 'M월 d일', { locale: ko })} - ${format(end, 'M월 d일', { locale: ko })}`;
  } else {
    return `${format(start, 'yyyy년 M월 d일', { locale: ko })} - ${format(end, 'yyyy년 M월 d일', { locale: ko })}`;
  }
}

/**
 * 차트 데이터 정렬
 */
export function sortChartData(
  data: ChartData[],
  by: 'name' | 'value' = 'value',
  order: 'asc' | 'desc' = 'desc'
): ChartData[] {
  return [...data].sort((a, b) => {
    const aVal = by === 'name' ? a.name : a.value;
    const bVal = by === 'name' ? b.name : b.value;

    if (order === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });
}

/**
 * 시계열 데이터 집계
 */
export function aggregateTimeSeries(
  data: TimeSeriesData[],
  groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year',
  aggregation: 'sum' | 'average' | 'count' | 'min' | 'max' = 'sum'
): TimeSeriesData[] {
  const grouped = new Map<string, TimeSeriesData[]>();

  data.forEach(item => {
    const key = getGroupKey(item.timestamp, groupBy);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(item);
  });

  return Array.from(grouped.entries()).map(([key, items]) => {
    let value: number;

    switch (aggregation) {
      case 'sum':
        value = items.reduce((sum, item) => sum + item.value, 0);
        break;
      case 'average':
        value = items.reduce((sum, item) => sum + item.value, 0) / items.length;
        break;
      case 'count':
        value = items.length;
        break;
      case 'min':
        value = Math.min(...items.map(item => item.value));
        break;
      case 'max':
        value = Math.max(...items.map(item => item.value));
        break;
      default:
        value = 0;
    }

    return {
      timestamp: new Date(key),
      value,
      category: items[0]?.category,
    };
  });
}

/**
 * 그룹 키 생성
 */
function getGroupKey(date: Date, groupBy: string): string {
  switch (groupBy) {
    case 'day':
      return format(date, 'yyyy-MM-dd');
    case 'week':
      return format(date, 'yyyy-ww');
    case 'month':
      return format(date, 'yyyy-MM');
    case 'quarter':
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `${date.getFullYear()}-Q${quarter}`;
    case 'year':
      return date.getFullYear().toString();
    default:
      return format(date, 'yyyy-MM-dd');
  }
}

/**
 * 색상 팔레트
 */
export const chartColors = {
  primary: ['#3b82f6', '#60a5fa', '#93bbfc', '#c7e0fe'],
  success: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
  warning: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'],
  danger: ['#ef4444', '#f87171', '#fca5a5', '#fecaca'],
  neutral: ['#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'],
  rainbow: [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
    '#f97316',
    '#6366f1',
  ],
};

/**
 * 차트 색상 선택
 */
export function getChartColor(
  index: number,
  palette: keyof typeof chartColors = 'rainbow'
): string {
  const colors = chartColors[palette];
  return colors[index % colors.length] || '#6b7280';
}

/**
 * 데이터 요약 통계
 */
export function calculateSummaryStats(values: number[]): {
  min: number;
  max: number;
  mean: number;
  median: number;
  sum: number;
  count: number;
} {
  if (values.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0, sum: 0, count: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / values.length;
  const median =
    sorted.length % 2 === 0
      ? ((sorted[sorted.length / 2 - 1] ?? 0) + (sorted[sorted.length / 2] ?? 0)) / 2
      : (sorted[Math.floor(sorted.length / 2)] ?? 0);

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    mean,
    median,
    sum,
    count: values.length,
  };
}

/**
 * 이동 평균 계산
 */
export function calculateMovingAverage(data: TimeSeriesData[], window: number): TimeSeriesData[] {
  if (data.length < window) return data;

  const result: TimeSeriesData[] = [];

  for (let i = window - 1; i < data.length; i++) {
    const slice = data.slice(i - window + 1, i + 1);
    const avg = slice.reduce((sum, item) => sum + item.value, 0) / window;

    result.push({
      ...data[i]!,
      value: avg,
    });
  }

  return result;
}

/**
 * 트렌드 계산
 */
export function calculateTrend(data: TimeSeriesData[]): 'up' | 'down' | 'stable' {
  if (data.length < 2) return 'stable';

  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));

  const firstAvg = firstHalf.reduce((sum, item) => sum + item.value, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, item) => sum + item.value, 0) / secondHalf.length;

  const changeRate = (secondAvg - firstAvg) / firstAvg;

  if (changeRate > 0.05) return 'up';
  if (changeRate < -0.05) return 'down';
  return 'stable';
}

/**
 * 데이터 필터링
 */
export function filterOutliers(data: number[], threshold: number = 2): number[] {
  const stats = calculateSummaryStats(data);
  const stdDev = Math.sqrt(
    data.reduce((sum, val) => sum + Math.pow(val - stats.mean, 2), 0) / data.length
  );

  return data.filter(val => Math.abs(val - stats.mean) <= threshold * stdDev);
}

/**
 * CSV 내보내기
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string = 'data.csv'): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]!);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers
        .map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * 숫자 단위 축약
 */
export function abbreviateNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
}

/**
 * 시간 포맷팅 (분 단위를 시간:분으로)
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}분`;
  if (mins === 0) return `${hours}시간`;
  return `${hours}시간 ${mins}분`;
}
