'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@cargoro/ui';
import {
  Info as InfoIcon,
  AlertCircle as AlertCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  Shield as ShieldIcon,
  RefreshCw,
  Download,
  Search,
  Filter,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { DateRangePicker } from '../../components/ui/date-range-picker';
import { Input, Button } from '@cargoro/ui';

import { AuditLogDetail } from './components/audit-log-detail';
import { AuditLogTable } from './components/audit-log-table';
import { useAuditLogsQuery } from './hooks/use-audit-logs';
import { AuditLog, AuditCategoryValues, ServiceTypeValues } from './types';

// Tabs 컴포넌트를 동적으로 로드
const Tabs = dynamic(() => import('@cargoro/ui').then(mod => mod.Tabs), {
  ssr: false,
});
const TabsContent = dynamic(() => import('@cargoro/ui').then(mod => mod.TabsContent), {
  ssr: false,
});
const TabsList = dynamic(() => import('@cargoro/ui').then(mod => mod.TabsList), {
  ssr: false,
});
const TabsTrigger = dynamic(() => import('@cargoro/ui').then(mod => mod.TabsTrigger), {
  ssr: false,
});

// 필터와 페이지네이션 타입 안전하게 수정
type Category = (typeof AuditCategoryValues)[keyof typeof AuditCategoryValues];
type Service = (typeof ServiceTypeValues)[keyof typeof ServiceTypeValues];

export const SystemAuditDashboard: React.FC = () => {
  const { t } = useTranslation('system-audit');
  const [page, setPage] = useState(1);
  const [timeRange, setTimeRange] = useState<{ from: Date; to: Date } | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedService, setSelectedService] = useState<Service | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const {
    auditLogs,
    totalLogs,
    totalPages,
    isLoading,
    // statistics, // 향후 사용 예정
    fetchAuditLogs,
    exportAuditLogs,
  } = useAuditLogsQuery({
    page,
    pageSize: 10,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    serviceType: selectedService === 'all' ? undefined : selectedService,
    searchQuery: searchTerm || undefined,
  });

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // 새로고침 핸들러
  const handleRefresh = () => {
    fetchAuditLogs();
  };

  // 내보내기 핸들러
  const handleExport = async (format: 'csv' | 'json') => {
    await exportAuditLogs(format);
  };

  // 로그 선택 핸들러
  const handleLogSelect = (log: AuditLog) => {
    setSelectedLog(log);
  };

  // 필터 초기화
  const handleFilterReset = () => {
    setSelectedCategory('all');
    setSelectedService('all');
    setSearchTerm('');
    setTimeRange(undefined);
    setPage(1);
  };

  // 검색어 변경시 페이지 리셋
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory, selectedService, timeRange]);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('dashboard.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('dashboard.refresh')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={isLoading}
          >
            <Download className="mr-2 h-4 w-4" />
            {t('dashboard.export')}
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.stats.total')}</CardTitle>
            <InfoIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLogs}</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.stats.totalDescription')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.stats.errors')}</CardTitle>
            <AlertCircleIcon className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {auditLogs.filter((log: AuditLog) => log.level === 'error').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.stats.errorsDescription')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.stats.warnings')}</CardTitle>
            <AlertTriangleIcon className="text-warning h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-warning text-2xl font-bold">
              {auditLogs.filter((log: AuditLog) => log.level === 'warning').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.stats.warningsDescription')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.stats.security')}</CardTitle>
            <ShieldIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {auditLogs.filter((log: AuditLog) => log.category === 'security').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.stats.securityDescription')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('dashboard.filters.title')}
          </CardTitle>
          <CardDescription>{t('dashboard.filters.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('dashboard.filters.searchPlaceholder')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <DateRangePicker
              value={timeRange}
              onChange={setTimeRange}
              placeholder={t('dashboard.filters.dateRange')}
            />
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value as Category | 'all')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">{t('dashboard.filters.allCategories')}</option>
                {Object.entries(AuditCategoryValues).map(([key, value]) => (
                  <option key={key} value={value}>
                    {t(`categories.${value}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <select
                value={selectedService}
                onChange={e => setSelectedService(e.target.value as Service | 'all')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">{t('dashboard.filters.allServices')}</option>
                {Object.entries(ServiceTypeValues).map(([key, value]) => (
                  <option key={key} value={value}>
                    {t(`services.${value}`)}
                  </option>
                ))}
              </select>
            </div>
            <Button variant="outline" onClick={handleFilterReset}>
              {t('dashboard.filters.reset')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 메인 콘텐츠 */}
      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">{t('dashboard.tabs.table')}</TabsTrigger>
          <TabsTrigger value="detail">{t('dashboard.tabs.detail')}</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <AuditLogTable
            logs={auditLogs}
            totalLogs={totalLogs}
            totalPages={totalPages}
            currentPage={page}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            onLogSelect={handleLogSelect}
            onFilterChange={(type, value) => {
              if (type === 'category') {
                setSelectedCategory(value as Category | 'all');
              } else if (type === 'serviceType') {
                setSelectedService(value as Service | 'all');
              } else if (type === 'searchQuery') {
                setSearchTerm(value);
              }
              setPage(1);
            }}
            currentFilters={{
              level: 'all',
              category: selectedCategory,
              serviceType: selectedService,
              searchQuery: searchTerm,
            }}
          />
        </TabsContent>

        <TabsContent value="detail" className="space-y-4">
          {selectedLog ? (
            <AuditLogDetail
              log={selectedLog}
              isOpen={!!selectedLog}
              onClose={() => setSelectedLog(null)}
              onExport={async (id, format) => {
                await exportAuditLogs(format);
              }}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  {t('dashboard.detail.noSelection')}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemAuditDashboard;
