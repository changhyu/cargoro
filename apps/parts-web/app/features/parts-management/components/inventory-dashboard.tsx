'use client';

import React, { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@cargoro/ui/card';
import { Progress } from '@cargoro/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@cargoro/ui/tabs';

import { Part, PartCategory, PartStatus, Supplier } from '../types';

interface InventoryDashboardProps {
  parts: Part[];
  isLoading: boolean;
  className?: string;
}

/**
 * 부품 재고 관리 대시보드 컴포넌트
 */
export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({
  parts,
  isLoading,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'suppliers'>('overview');

  // 재고 현황 요약 계산
  const inventorySummary = React.useMemo(() => {
    if (!parts.length) return { total: 0, inStock: 0, lowStock: 0, outOfStock: 0, discontinued: 0 };

    const total = parts.length;
    const inStock = parts.filter(part => part.status === PartStatus.IN_STOCK).length;
    const lowStock = parts.filter(part => part.status === PartStatus.LOW_STOCK).length;
    const outOfStock = parts.filter(part => part.status === PartStatus.OUT_OF_STOCK).length;
    const discontinued = parts.filter(part => part.status === PartStatus.DISCONTINUED).length;

    return { total, inStock, lowStock, outOfStock, discontinued };
  }, [parts]);

  // 카테고리별 부품 수 계산
  const categoryBreakdown = React.useMemo(() => {
    const breakdown: Record<string, number> = {};

    Object.values(PartCategory).forEach(category => {
      breakdown[category] = parts.filter(part => part.category === category).length;
    });

    return breakdown;
  }, [parts]);

  // 공급업체별 부품 수 계산
  const supplierBreakdown = React.useMemo(() => {
    const breakdown: Record<string, number> = {};

    parts.forEach(part => {
      const supplierName = getSupplierName(part.supplier);
      if (!breakdown[supplierName]) {
        breakdown[supplierName] = 0;
      }
      breakdown[supplierName]++;
    });

    // 상위 10개 공급업체만 반환
    return Object.entries(breakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .reduce(
        (acc, [supplier, count]) => {
          acc[supplier] = count;
          return acc;
        },
        {} as Record<string, number>
      );
  }, [parts]);

  // 총 재고 가치 계산
  const totalInventoryValue = React.useMemo(() => {
    return parts.reduce((total, part) => total + part.price * part.quantity, 0);
  }, [parts]);

  // 공급업체 이름 표시
  const getSupplierName = (supplier: string | Supplier | undefined) => {
    if (!supplier) return '알 수 없는 공급업체';
    if (typeof supplier === 'string') return supplier;
    return supplier.name || '알 수 없는 공급업체';
  };

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>재고 대시보드</CardTitle>
          <CardDescription>데이터 로딩 중...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center">
            <div className="animate-pulse">데이터를 불러오는 중입니다...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>재고 대시보드</CardTitle>
        <CardDescription>부품 재고 현황 및 통계</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={value => setActiveTab(value as 'overview' | 'categories' | 'suppliers')}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">재고 개요</TabsTrigger>
            <TabsTrigger value="categories">카테고리별</TabsTrigger>
            <TabsTrigger value="suppliers">공급업체별</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg bg-muted p-4">
                <div className="mb-2 text-sm font-medium text-muted-foreground">총 부품 수</div>
                <div className="text-2xl font-bold">{inventorySummary.total}개</div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <div className="mb-2 text-sm font-medium text-muted-foreground">총 재고 가치</div>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('ko-KR', {
                    style: 'currency',
                    currency: 'KRW',
                    maximumFractionDigits: 0,
                  }).format(totalInventoryValue)}
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <div className="mb-2 text-sm font-medium text-muted-foreground">부족 재고 부품</div>
                <div className="text-2xl font-bold text-amber-500">
                  {inventorySummary.lowStock}개
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-sm font-medium">재고 있음</span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {inventorySummary.inStock} / {inventorySummary.total}(
                    {Math.round((inventorySummary.inStock / inventorySummary.total) * 100) || 0}%)
                  </span>
                </div>
                <Progress
                  value={(inventorySummary.inStock / inventorySummary.total) * 100 || 0}
                  className="h-2 bg-slate-200"
                />
              </div>

              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-sm font-medium">재고 부족</span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {inventorySummary.lowStock} / {inventorySummary.total}(
                    {Math.round((inventorySummary.lowStock / inventorySummary.total) * 100) || 0}%)
                  </span>
                </div>
                <Progress
                  value={(inventorySummary.lowStock / inventorySummary.total) * 100 || 0}
                  className="h-2 bg-slate-200"
                />
              </div>

              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-sm font-medium">재고 없음</span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {inventorySummary.outOfStock} / {inventorySummary.total}(
                    {Math.round((inventorySummary.outOfStock / inventorySummary.total) * 100) || 0}
                    %)
                  </span>
                </div>
                <Progress
                  value={(inventorySummary.outOfStock / inventorySummary.total) * 100 || 0}
                  className="h-2 bg-slate-200"
                />
              </div>

              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-sm font-medium">단종됨</span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {inventorySummary.discontinued} / {inventorySummary.total}(
                    {Math.round((inventorySummary.discontinued / inventorySummary.total) * 100) ||
                      0}
                    %)
                  </span>
                </div>
                <Progress
                  value={(inventorySummary.discontinued / inventorySummary.total) * 100 || 0}
                  className="h-2 bg-slate-200"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="space-y-4">
              {Object.entries(categoryBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([category, count]) => (
                  <div key={category}>
                    <div className="mb-1 flex justify-between">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-sm font-medium text-muted-foreground">
                        {count} / {inventorySummary.total}(
                        {Math.round((count / inventorySummary.total) * 100) || 0}%)
                      </span>
                    </div>
                    <Progress
                      value={(count / inventorySummary.total) * 100 || 0}
                      className="h-2 bg-slate-200"
                    />
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="suppliers">
            <div className="space-y-4">
              {Object.entries(supplierBreakdown).map(([supplier, count]) => (
                <div key={supplier}>
                  <div className="mb-1 flex justify-between">
                    <span className="text-sm font-medium">{supplier}</span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {count} / {inventorySummary.total}(
                      {Math.round((count / inventorySummary.total) * 100) || 0}%)
                    </span>
                  </div>
                  <Progress
                    value={(count / inventorySummary.total) * 100 || 0}
                    className="h-2 bg-slate-200"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
