'use client';

import React from 'react';
import { Badge, Card, CardContent, CardHeader, CardTitle, Skeleton, cn } from '@cargoro/ui';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, TrendingUp, TrendingDown } from 'lucide-react';

// Type definitions
interface MetricCardType {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  unit?: string;
  icon?: React.ReactNode | string;
  description?: string;
  loading?: boolean;
}

// Utility functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(value);
};

const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('ko-KR').format(value);
};

interface MetricCardProps extends Readonly<MetricCardType> {
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  unit,
  icon,
  description,
  loading,
  className,
  onClick,
}: Readonly<MetricCardProps>) {
  const formatValue = () => {
    if (typeof value === 'string') {
      return value;
    }

    switch (unit) {
      case 'currency':
      case 'won':
      case '원':
        return formatCurrency(value);
      case 'percent':
      case '%':
        return formatPercent(value / 100);
      default:
        return formatNumber(value);
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return <ArrowUpIcon className="h-4 w-4" />;
      case 'decrease':
        return <ArrowDownIcon className="h-4 w-4" />;
      default:
        return <MinusIcon className="h-4 w-4" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'decrease':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getTrendIcon = () => {
    if (!change) {
      return null;
    }

    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-8 w-8 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-2 h-8 w-[120px]" />
          <Skeleton className="h-4 w-[80px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        onClick && 'cursor-pointer hover:border-primary',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            {typeof icon === 'string' ? <span className="text-lg">{icon}</span> : icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold">
            {formatValue()}
            {unit && !['currency', 'won', '원', 'percent', '%'].includes(unit) && (
              <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>
            )}
          </div>
          {getTrendIcon()}
        </div>

        {change !== undefined && (
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className={cn('text-xs', getChangeColor())}>
              <span className="flex items-center gap-1">
                {getChangeIcon()}
                {formatPercent(Math.abs(change))}
              </span>
            </Badge>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        )}

        {!change && description && (
          <p className="mt-2 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface MetricGridProps {
  readonly metrics: MetricCardType[];
  readonly columns?: 2 | 3 | 4;
  readonly loading?: boolean;
  readonly className?: string;
}

export function MetricGrid({
  metrics,
  columns = 4,
  loading = false,
  className,
}: Readonly<MetricGridProps>) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn(`grid gap-4 ${gridCols[columns]}`, className)}>
      {metrics.map(metric => (
        <MetricCard key={metric.id} {...metric} loading={loading || metric.loading} />
      ))}
    </div>
  );
}
