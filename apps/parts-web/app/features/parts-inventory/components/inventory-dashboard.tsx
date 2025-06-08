'use client';

import { useInventoryStats } from '../hooks/use-parts';
import { Card, CardContent, CardHeader, CardTitle } from '@cargoro/ui/card';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  BarChart3,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function InventoryDashboard() {
  const { data: stats, isLoading, error } = useInventoryStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p>재고 통계를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">재고 통계를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 주요 지표 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">총 부품 수</p>
                <p className="text-2xl font-bold">{stats.totalParts.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">재고 총 가치</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">재고 부족</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.lowStockCount || stats.lowStockItems}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">품절 항목</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.outOfStockCount || stats.outOfStockItems}
                </p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 카테고리별 재고 분포 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              카테고리별 재고 분포
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={
                    stats.valueByCategory ||
                    stats.categoriesBreakdown.map(cat => ({
                      name: cat.categoryName,
                      value: cat.value,
                    }))
                  }
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, value }) => `${category}: ${formatCurrency(value)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(
                    stats.valueByCategory ||
                    stats.categoriesBreakdown.map(cat => ({
                      name: cat.categoryName,
                      value: cat.value,
                    }))
                  ).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 재고 가치 추이 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              재고 가치 추이
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.recentValueTrend || stats.stockValueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={date =>
                    new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
                  }
                />
                <YAxis tickFormatter={value => formatCurrency(value)} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={date => new Date(date).toLocaleDateString('ko-KR')}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 인기 부품 TOP 10 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            이동량 TOP 10 부품
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topMovingParts.map((part, index) => (
              <div
                key={part.partId}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`text-lg font-bold ${index < 3 ? 'text-blue-600' : 'text-gray-600'}`}
                  >
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{part.name}</p>
                    <p className="text-sm text-gray-500">{part.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {part.movementRate > 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">{Math.abs(part.movementRate)}개</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
