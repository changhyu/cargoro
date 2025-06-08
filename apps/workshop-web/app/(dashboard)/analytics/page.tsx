'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@cargoro/ui';
import {
  AnalyticsHeader,
  MetricGrid,
  ChartGrid,
  DataTable,
  useWorkshopAnalytics,
  useFinancialAnalytics,
  useExportData,
  // MetricCard // 사용하지 않음
} from '@cargoro/analytics';
import {
  TrendingUp,
  DollarSign,
  Users,
  Wrench,
  Package,
  Clock,
  CheckCircle,
  // XCircle, // 사용하지 않음
  AlertCircle,
  // Car, // 사용하지 않음
  BarChart3,
  FileText,
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const workshop = useWorkshopAnalytics();
  const financial = useFinancialAnalytics();
  const { exportToExcel } = useExportData(); // exportToPdf 사용하지 않음

  const handleExport = async () => {
    await exportToExcel(
      'workshop',
      `workshop_analytics_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  // 주요 지표 카드
  const overviewMetrics = workshop.data
    ? [
        {
          id: 'total-orders',
          title: '총 주문 수',
          value: workshop.data.overview.totalOrders,
          change: 0.12,
          changeType: 'increase' as const,
          unit: '건',
          icon: <FileText className="h-4 w-4" />,
          description: '전월 대비',
        },
        {
          id: 'completed-orders',
          title: '완료된 주문',
          value: workshop.data.overview.completedOrders,
          change: 0.08,
          changeType: 'increase' as const,
          unit: '건',
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        },
        {
          id: 'total-revenue',
          title: '총 매출',
          value: workshop.data.overview.totalRevenue,
          change: 0.15,
          changeType: 'increase' as const,
          unit: 'currency',
          icon: <DollarSign className="h-4 w-4 text-green-600" />,
        },
        {
          id: 'avg-order-value',
          title: '평균 주문 금액',
          value: workshop.data.overview.averageOrderValue,
          change: 0.05,
          changeType: 'increase' as const,
          unit: 'currency',
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          id: 'customer-satisfaction',
          title: '고객 만족도',
          value: workshop.data.overview.customerSatisfaction,
          change: 0.02,
          changeType: 'increase' as const,
          unit: '점',
          icon: '⭐',
          description: '5점 만점',
        },
        {
          id: 'repeat-rate',
          title: '재방문율',
          value: workshop.data.overview.repeatCustomerRate * 100,
          change: 0.03,
          changeType: 'increase' as const,
          unit: '%',
          icon: <Users className="h-4 w-4" />,
        },
        {
          id: 'completion-rate',
          title: '작업 완료율',
          value: workshop.data.performance.orderCompletionRate * 100,
          change: -0.01,
          changeType: 'decrease' as const,
          unit: '%',
          icon: <Clock className="h-4 w-4" />,
        },
        {
          id: 'avg-completion-time',
          title: '평균 작업 시간',
          value: workshop.data.performance.averageCompletionTime,
          change: -0.05,
          changeType: 'decrease' as const,
          unit: '분',
          icon: <Wrench className="h-4 w-4" />,
          description: '시간 단축',
        },
      ]
    : [];

  // 차트 데이터
  const revenueChartData = financial.data
    ? {
        id: 'revenue-trend',
        title: '매출 추이',
        description: '일별 매출 현황',
        data: financial.data.revenue.byMonth.map(item => ({
          name: new Date(item.timestamp).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
          }),
          매출: item.value,
        })),
        config: {
          chartType: 'area' as const,
          metrics: ['매출'],
          dimensions: ['name'],
          colors: ['#3b82f6'],
        },
      }
    : null;

  const serviceDistributionData = workshop.data
    ? {
        id: 'service-distribution',
        title: '서비스별 분포',
        description: '서비스 유형별 주문 비율',
        data: workshop.data.performance.serviceTypeDistribution.map(item => ({
          name: item.serviceType,
          value: item.count,
          revenue: item.revenue,
        })),
        config: {
          chartType: 'pie' as const,
          metrics: ['value'],
          dimensions: ['name'],
        },
      }
    : null;

  // 기술자 생산성 테이블
  const technicianColumns = [
    { key: 'technicianName', label: '기술자', type: 'text' as const },
    {
      key: 'completedOrders',
      label: '완료 주문',
      type: 'number' as const,
      align: 'center' as const,
    },
    {
      key: 'averageTime',
      label: '평균 시간(분)',
      type: 'number' as const,
      align: 'center' as const,
    },
    { key: 'revenue', label: '매출', type: 'currency' as const, align: 'right' as const },
    {
      key: 'rating',
      label: '평점',
      type: 'custom' as const,
      align: 'center' as const,
      render: (value: number) => (
        <div className="flex items-center justify-center gap-1">
          <span>{value.toFixed(1)}</span>
          <span className="text-yellow-500">⭐</span>
        </div>
      ),
    },
  ];

  const technicianData = workshop.data?.performance.technicianProductivity || [];

  return (
    <div className="container mx-auto space-y-6 py-6">
      <AnalyticsHeader
        title="정비소 분석 대시보드"
        description="실시간 비즈니스 인사이트와 성과 지표를 확인하세요"
        onRefresh={() => {
          workshop.refresh();
          financial.refresh();
        }}
        onExport={handleExport}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="performance">성과</TabsTrigger>
          <TabsTrigger value="financial">재무</TabsTrigger>
          <TabsTrigger value="customer">고객</TabsTrigger>
          <TabsTrigger value="inventory">재고</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <MetricGrid metrics={overviewMetrics} columns={4} loading={workshop.isLoading} />

          {revenueChartData && serviceDistributionData && (
            <ChartGrid
              charts={[revenueChartData, serviceDistributionData]}
              columns={2}
              loading={financial.isLoading}
            />
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <DataTable
            title="기술자 생산성"
            description="기술자별 성과 지표"
            columns={technicianColumns}
            data={technicianData}
            loading={workshop.isLoading}
          />

          {workshop.data && (
            <ChartGrid
              charts={[
                {
                  id: 'completion-time-trend',
                  title: '작업 완료 시간 추이',
                  data: Array.from({ length: 30 }, (_, i) => ({
                    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(
                      'ko-KR',
                      { month: 'short', day: 'numeric' }
                    ),
                    시간: Math.floor(Math.random() * 60) + 90,
                  })),
                  config: {
                    chartType: 'line' as const,
                    metrics: ['시간'],
                    dimensions: ['date'],
                  },
                },
              ]}
              columns={1}
            />
          )}
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          {financial.data && (
            <>
              <MetricGrid
                metrics={[
                  {
                    id: 'gross-profit',
                    title: '총 이익',
                    value: financial.data.profitability.grossProfit,
                    unit: 'currency',
                    icon: <TrendingUp className="h-4 w-4" />,
                  },
                  {
                    id: 'gross-margin',
                    title: '총 이익률',
                    value: financial.data.profitability.grossMargin * 100,
                    unit: '%',
                    icon: <BarChart3 className="h-4 w-4" />,
                  },
                  {
                    id: 'net-profit',
                    title: '순 이익',
                    value: financial.data.profitability.netProfit,
                    unit: 'currency',
                    icon: <DollarSign className="h-4 w-4" />,
                  },
                  {
                    id: 'net-margin',
                    title: '순 이익률',
                    value: financial.data.profitability.netMargin * 100,
                    unit: '%',
                    icon: <BarChart3 className="h-4 w-4" />,
                  },
                ]}
                columns={4}
              />

              <ChartGrid
                charts={[
                  {
                    id: 'expense-breakdown',
                    title: '비용 구성',
                    data: financial.data.expenses.byCategory,
                    config: {
                      chartType: 'donut' as const,
                      metrics: ['value'],
                      dimensions: ['name'],
                    },
                  },
                  {
                    id: 'profit-trend',
                    title: '수익성 추이',
                    data: financial.data.profitability.profitTrend.map(item => ({
                      date: new Date(item.timestamp).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                      }),
                      이익: item.value,
                    })),
                    config: {
                      chartType: 'line' as const,
                      metrics: ['이익'],
                      dimensions: ['date'],
                      colors: ['#10b981'],
                    },
                  },
                ]}
                columns={2}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="customer" className="space-y-6">
          {workshop.data && (
            <>
              <MetricGrid
                metrics={[
                  {
                    id: 'new-customers',
                    title: '신규 고객',
                    value: workshop.data.customer.newCustomers,
                    unit: '명',
                    icon: <Users className="h-4 w-4" />,
                  },
                  {
                    id: 'returning-customers',
                    title: '재방문 고객',
                    value: workshop.data.customer.returningCustomers,
                    unit: '명',
                    icon: <Users className="h-4 w-4" />,
                  },
                  {
                    id: 'retention-rate',
                    title: '고객 유지율',
                    value: workshop.data.customer.customerRetentionRate * 100,
                    unit: '%',
                    icon: <TrendingUp className="h-4 w-4" />,
                  },
                  {
                    id: 'lifetime-value',
                    title: '고객 생애 가치',
                    value: workshop.data.customer.customerLifetimeValue,
                    unit: 'currency',
                    icon: <DollarSign className="h-4 w-4" />,
                  },
                ]}
                columns={4}
              />

              <DataTable
                title="우수 고객"
                description="매출 기여도가 높은 고객 목록"
                columns={[
                  { key: 'customerName', label: '고객명', type: 'text' },
                  { key: 'totalOrders', label: '주문 수', type: 'number', align: 'center' },
                  { key: 'totalSpent', label: '총 지출', type: 'currency', align: 'right' },
                  { key: 'vehicleCount', label: '차량 수', type: 'number', align: 'center' },
                  { key: 'lastVisit', label: '최근 방문', type: 'date' },
                ]}
                data={workshop.data.customer.topCustomers}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          {workshop.data && (
            <>
              <MetricGrid
                metrics={[
                  {
                    id: 'total-parts',
                    title: '총 부품 수',
                    value: workshop.data.inventory.totalParts,
                    unit: '개',
                    icon: <Package className="h-4 w-4" />,
                  },
                  {
                    id: 'low-stock',
                    title: '재고 부족',
                    value: workshop.data.inventory.lowStockItems.length,
                    unit: '개',
                    icon: <AlertCircle className="h-4 w-4 text-yellow-600" />,
                    changeType: 'decrease',
                  },
                  {
                    id: 'inventory-value',
                    title: '재고 가치',
                    value: workshop.data.inventory.inventoryValue,
                    unit: 'currency',
                    icon: <DollarSign className="h-4 w-4" />,
                  },
                ]}
                columns={3}
              />

              <DataTable
                title="재고 부족 품목"
                description="주문이 필요한 부품 목록"
                columns={[
                  { key: 'partName', label: '부품명', type: 'text' },
                  { key: 'currentStock', label: '현재 재고', type: 'number', align: 'center' },
                  { key: 'minimumStock', label: '최소 재고', type: 'number', align: 'center' },
                  { key: 'reorderPoint', label: '재주문 시점', type: 'number', align: 'center' },
                  { key: 'unitPrice', label: '단가', type: 'currency', align: 'right' },
                ]}
                data={workshop.data.inventory.lowStockItems}
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
