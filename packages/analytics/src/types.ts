// 분석 데이터 타입 정의

export interface DateRange {
  start: Date;
  end: Date;
  preset?:
    | 'today'
    | 'yesterday'
    | 'last7days'
    | 'last30days'
    | 'thisMonth'
    | 'lastMonth'
    | 'thisYear'
    | 'custom';
}

export interface MetricCard {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  unit?: string;
  icon?: string;
  description?: string;
  loading?: boolean;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: unknown;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  category?: string;
  [key: string]: unknown;
}

// 정비소 분석 데이터
export interface WorkshopAnalytics {
  overview: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    customerSatisfaction: number;
    repeatCustomerRate: number;
  };

  performance: {
    orderCompletionRate: number;
    averageCompletionTime: number; // 분 단위
    technicianProductivity: TechnicianProductivity[];
    serviceTypeDistribution: ServiceDistribution[];
  };

  financial: {
    dailyRevenue: TimeSeriesData[];
    monthlyRevenue: TimeSeriesData[];
    revenueByService: ChartData[];
    paymentMethodDistribution: ChartData[];
    outstandingPayments: number;
  };

  customer: {
    newCustomers: number;
    returningCustomers: number;
    customerRetentionRate: number;
    customerLifetimeValue: number;
    topCustomers: CustomerData[];
    customerSatisfactionTrend: TimeSeriesData[];
  };

  inventory: {
    totalParts: number;
    lowStockItems: InventoryItem[];
    partUsageTrend: TimeSeriesData[];
    mostUsedParts: ChartData[];
    inventoryValue: number;
  };
}

export interface TechnicianProductivity {
  technicianId: string;
  technicianName: string;
  completedOrders: number;
  averageTime: number;
  revenue: number;
  rating: number;
}

export interface ServiceDistribution {
  serviceType: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface CustomerData {
  customerId: string;
  customerName: string;
  totalOrders: number;
  totalSpent: number;
  lastVisit: Date;
  vehicleCount: number;
}

export interface InventoryItem {
  partId: string;
  partName: string;
  currentStock: number;
  minimumStock: number;
  reorderPoint: number;
  unitPrice: number;
}

// 배송 분석 데이터
export interface DeliveryAnalytics {
  overview: {
    totalDeliveries: number;
    completedDeliveries: number;
    inProgressDeliveries: number;
    delayedDeliveries: number;
    onTimeDeliveryRate: number;
    averageDeliveryTime: number;
  };

  performance: {
    deliveryTimeTrend: TimeSeriesData[];
    driverPerformance: DriverPerformance[];
    routeEfficiency: RouteEfficiency[];
    deliveryHeatmap: HeatmapData[];
  };

  cost: {
    totalFuelCost: number;
    averageCostPerDelivery: number;
    costByDriver: ChartData[];
    fuelEfficiencyTrend: TimeSeriesData[];
  };
}

export interface DriverPerformance {
  driverId: string;
  driverName: string;
  completedDeliveries: number;
  averageTime: number;
  onTimeRate: number;
  customerRating: number;
  distance: number;
}

export interface RouteEfficiency {
  routeId: string;
  routeName: string;
  averageTime: number;
  distance: number;
  deliveryCount: number;
  efficiency: number;
}

export interface HeatmapData {
  lat: number;
  lng: number;
  weight: number;
}

// 차량 관리 분석 데이터
export interface FleetAnalytics {
  overview: {
    totalVehicles: number;
    activeVehicles: number;
    inMaintenanceVehicles: number;
    utilizationRate: number;
    averageMileage: number;
    totalMaintenanceCost: number;
  };

  maintenance: {
    upcomingMaintenance: MaintenanceSchedule[];
    maintenanceHistory: TimeSeriesData[];
    costByVehicle: ChartData[];
    commonIssues: ChartData[];
  };

  performance: {
    fuelEfficiency: VehicleFuelData[];
    mileageDistribution: ChartData[];
    vehicleAgeDistribution: ChartData[];
    downtimeTrend: TimeSeriesData[];
  };
}

export interface MaintenanceSchedule {
  vehicleId: string;
  vehicleNumber: string;
  serviceType: string;
  dueDate: Date;
  estimatedCost: number;
  priority: 'low' | 'medium' | 'high';
}

export interface VehicleFuelData {
  vehicleId: string;
  vehicleNumber: string;
  averageFuelEfficiency: number;
  totalFuelCost: number;
  trend: 'improving' | 'stable' | 'declining';
}

// 재무 분석 데이터
export interface FinancialAnalytics {
  revenue: {
    total: number;
    byMonth: TimeSeriesData[];
    byService: ChartData[];
    byCustomerType: ChartData[];
    growth: number;
    forecast: TimeSeriesData[];
  };

  expenses: {
    total: number;
    byCategory: ChartData[];
    trend: TimeSeriesData[];
    laborCost: number;
    materialCost: number;
    overheadCost: number;
  };

  profitability: {
    grossProfit: number;
    grossMargin: number;
    netProfit: number;
    netMargin: number;
    profitTrend: TimeSeriesData[];
    profitByService: ChartData[];
  };

  cashFlow: {
    inflow: number;
    outflow: number;
    netCashFlow: number;
    cashFlowTrend: TimeSeriesData[];
    receivables: number;
    payables: number;
  };
}

// 분석 필터 옵션
export interface AnalyticsFilter {
  dateRange: DateRange;
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  serviceTypes?: string[];
  technicianIds?: string[];
  customerIds?: string[];
  vehicleIds?: string[];
  status?: string[];
}

// 대시보드 위젯 설정
export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'map';
  title: string;
  dataSource: string;
  config: WidgetConfig;
  position: { x: number; y: number; w: number; h: number };
  refreshInterval?: number; // 초 단위
}

export interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'scatter' | 'heatmap';
  metrics?: string[];
  dimensions?: string[];
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  aggregation?: 'sum' | 'average' | 'count' | 'min' | 'max';
}

// 리포트 설정
export interface ReportConfig {
  id: string;
  name: string;
  description?: string;
  schedule?: ReportSchedule;
  recipients?: string[];
  widgets: string[]; // 위젯 ID 배열
  format: 'pdf' | 'excel' | 'csv';
  dateRange: DateRange;
  filters?: AnalyticsFilter;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:mm 형식
  dayOfWeek?: number; // 0-6 (일-토)
  dayOfMonth?: number; // 1-31
  enabled: boolean;
}

// 알림 설정
export interface AlertConfig {
  id: string;
  name: string;
  condition: AlertCondition;
  actions: AlertAction[];
  enabled: boolean;
  createdAt: Date;
  lastTriggered?: Date;
}

export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';
  threshold: number;
  duration?: number; // 조건이 유지되어야 하는 시간 (분)
}

export interface AlertAction {
  type: 'email' | 'sms' | 'webhook' | 'notification';
  recipients?: string[];
  webhookUrl?: string;
  message?: string;
}

// API 응답 타입
export interface AnalyticsResponse<T> {
  data: T;
  metadata: {
    dateRange: DateRange;
    lastUpdated: Date;
    dataPoints: number;
  };
  error?: string;
}

export interface AnalyticsError {
  code: string;
  message: string;
  details?: unknown;
}
