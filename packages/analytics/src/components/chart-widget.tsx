'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  cn,
} from '@cargoro/ui';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  // RadialBarChart,
  // RadialBar,
  // ComposedChart,
} from 'recharts';
import { WidgetConfig } from '../types';
import { formatNumber, getChartColor } from '../utils';

interface ChartWidgetProps {
  title: string;
  description?: string;
  data: any[];
  config: WidgetConfig;
  loading?: boolean;
  className?: string;
  height?: number;
}

export function ChartWidget({
  title,
  description,
  data,
  config,
  loading = false,
  className,
  height = 300,
}: ChartWidgetProps) {
  const {
    chartType = 'line',
    metrics = ['value'],
    dimensions = ['name'],
    colors = [],
    showLegend = true,
    showGrid = true,
    showTooltip = true,
  } = config;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{formatNumber(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis dataKey={dimensions[0]} />
            <YAxis />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {metrics.map((metric, index) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={colors[index] || getChartColor(index)}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis dataKey={dimensions[0]} />
            <YAxis />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {metrics.map((metric, index) => (
              <Bar key={metric} dataKey={metric} fill={colors[index] || getChartColor(index)} />
            ))}
          </BarChart>
        );

      case 'pie':
      case 'donut':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={metrics[0] || 'value'}
              nameKey={dimensions[0]}
              cx="50%"
              cy="50%"
              outerRadius={height / 3}
              innerRadius={chartType === 'donut' ? height / 6 : 0}
              label={entry => `${entry.name}: ${formatNumber(entry.value)}`}
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index] || getChartColor(index)} />
              ))}
            </Pie>
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
          </PieChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis dataKey={dimensions[0]} />
            <YAxis />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            {metrics.map((metric, index) => (
              <Area
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={colors[index] || getChartColor(index)}
                fill={colors[index] || getChartColor(index)}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        );

      case 'scatter':
        return (
          <ScatterChart>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
            <XAxis dataKey={dimensions[0]} />
            <YAxis dataKey={metrics[0]} />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            <Scatter name={metrics[0]} data={data} fill={colors[0] || getChartColor(0)} />
          </ScatterChart>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          {description && <Skeleton className="mt-2 h-4 w-[300px]" />}
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full" style={{ height }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart() || <div>차트를 로드할 수 없습니다.</div>}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface ChartGridProps {
  charts: Array<{
    id: string;
    title: string;
    description?: string;
    data: any[];
    config: WidgetConfig;
  }>;
  columns?: 1 | 2;
  loading?: boolean;
  className?: string;
}

export function ChartGrid({ charts, columns = 2, loading = false, className }: ChartGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
  };

  return (
    <div className={cn(`grid gap-6 ${gridCols[columns]}`, className)}>
      {charts.map(chart => (
        <ChartWidget key={chart.id} {...chart} loading={loading} />
      ))}
    </div>
  );
}
