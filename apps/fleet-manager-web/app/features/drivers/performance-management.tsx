'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  useToast,
} from '@cargoro/ui';
import { FixedSizeList as List } from 'react-window';
import { useQuery } from '@tanstack/react-query';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cargoro/ui';
import {
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Star,
  Trophy,
  Zap,
  Shield,
  Fuel,
  Clock,
  Route,
  Gauge,
  Plus,
} from 'lucide-react';

import { Driver, PerformanceMetrics, performanceService } from '../../../services/api';
import { SearchInput, PeriodSelector, ExportButton } from '../../../components/ui/form-components';
import {
  SortableHeader,
  EmptyState,
  PerformanceSummaryCards,
} from '../../../components/ui/table-components';

// ScoreIndicator 컴포넌트 정의
interface ScoreIndicatorProps {
  score: number;
  type: 'safety' | 'eco' | 'overall';
}

const ScoreIndicator: React.FC<ScoreIndicatorProps> = ({ score, type }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'safety':
        return '안전';
      case 'eco':
        return '친환경';
      case 'overall':
        return '종합';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">{getTypeLabel(type)}:</span>
      <span className={`font-semibold ${getScoreColor(score)}`}>{score}점</span>
    </div>
  );
};

interface PerformanceManagementProps {
  driver: Driver;
}

// SortConfig 타입 추가
interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export default function PerformanceManagement({ driver }: PerformanceManagementProps) {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>('30'); // 최근 30일
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'overallScore',
    direction: 'desc',
  });

  // 성능 지표 조회 최적화 - React Query 활용
  const {
    data: performanceData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['driver-performance', driver.id, period],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(period));

      return performanceService.getDriverMetrics(driver.id, {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      });
    },
    staleTime: 5 * 60 * 1000, // 5분 캐싱
    gcTime: 10 * 60 * 1000, // 10분 메모리 보관
  });

  // 에러 처리
  useEffect(() => {
    if (error) {
      toast({
        title: '오류',
        description: '성과 지표를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // 검색 및 정렬 최적화 - useMemo로 불필요한 재계산 방지
  const filteredAndSortedData = useMemo(() => {
    if (!performanceData?.items) return [];

    let filtered = performanceData.items;

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(
        (item: PerformanceData) =>
          item.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.vehicleId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 정렬
    return filtered.sort((a: PerformanceData, b: PerformanceData) => {
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue || '');
      const bStr = String(bValue || '');
      return sortConfig.direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [performanceData?.items, searchTerm, sortConfig]);

  // 성능 최적화된 이벤트 핸들러
  const handleEdit = useCallback((performanceId: string) => {
    // 성과 데이터 편집 로직
    console.log('성과 데이터 편집:', performanceId);
  }, []);

  const handleDelete = useCallback((performanceId: string) => {
    // 성과 데이터 삭제 로직
    console.log('성과 데이터 삭제:', performanceId);
  }, []);

  const columns = useMemo(
    () => [
      {
        header: '운전자',
        cell: (data: PerformanceData) => (
          <div className="font-medium">{data.driver?.name || 'N/A'}</div>
        ),
      },
      {
        header: '안전 점수',
        cell: (data: PerformanceData) => (
          <div className="flex items-center space-x-2">
            <ScoreIndicator score={data.safetyScore} type="safety" />
            <span>{data.safetyScore}점</span>
          </div>
        ),
      },
      {
        header: '연비 점수',
        cell: (data: PerformanceData) => (
          <div className="flex items-center space-x-2">
            <ScoreIndicator score={data.ecoScore} type="eco" />
            <span>{data.ecoScore}점</span>
          </div>
        ),
      },
      {
        header: '종합 점수',
        cell: (data: PerformanceData) => (
          <div className="flex items-center space-x-2">
            <ScoreIndicator score={data.overallScore} type="overall" />
            <span className="font-semibold">{data.overallScore}점</span>
          </div>
        ),
      },
      {
        header: '평가 기간',
        cell: (data: PerformanceData) => (
          <div className="text-sm text-gray-600">
            {formatDateRange(data.periodStart, data.periodEnd)}
          </div>
        ),
      },
      {
        header: '차량',
        cell: (data: PerformanceData) => <div className="text-sm">{data.vehicleId}</div>,
      },
      {
        header: '액션',
        cell: (data: PerformanceData) => (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleEdit(data.id)}>
              수정
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDelete(data.id)}>
              삭제
            </Button>
          </div>
        ),
      },
    ],
    [handleEdit, handleDelete]
  );

  // 가상화 스크롤을 위한 행 렌더러
  const renderRow = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const item = filteredAndSortedData[index];

      return (
        <div style={style} className="border-b border-gray-200 hover:bg-gray-50">
          <PerformanceRowItem data={item} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      );
    },
    [filteredAndSortedData, handleEdit, handleDelete]
  );

  const handleSort = useCallback((key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  // 디바운싱된 검색
  const debouncedSearch = useMemo(() => debounce((value: string) => setSearchTerm(value), 300), []);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="text-gray-500">성과 데이터가 없습니다.</p>
      </div>
    );
  }

  // metrics가 null일 경우 기본값 설정
  const overallGrade = metrics?.overallScore ? getGrade(metrics.overallScore) : 'N/A';

  return (
    <div className="space-y-6">
      {/* 검색 및 필터 영역 */}
      <div className="flex items-center justify-between">
        <SearchInput
          value={searchTerm}
          placeholder="운전자 이름 또는 차량 번호로 검색"
          onChange={setSearchTerm}
          className="max-w-md"
        />
        <div className="flex gap-2">
          <PeriodSelector value={period} onChange={setPeriod} />
          <ExportButton data={filteredAndSortedData} />
        </div>
      </div>

      {/* 성능 요약 대시보드 */}
      <PerformanceSummaryCards metrics={performanceData?.summary} />

      {/* 가상화된 데이터 테이블 */}
      <div className="rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <SortableHeader
                    sortKey="driver.name"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  >
                    운전자
                  </SortableHeader>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <SortableHeader
                    sortKey="safetyScore"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  >
                    안전 점수
                  </SortableHeader>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <SortableHeader sortKey="ecoScore" currentSort={sortConfig} onSort={handleSort}>
                    연비 점수
                  </SortableHeader>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <SortableHeader
                    sortKey="overallScore"
                    currentSort={sortConfig}
                    onSort={handleSort}
                  >
                    종합 점수
                  </SortableHeader>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  평가 기간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  차량
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredAndSortedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4">
                    <EmptyState
                      title="성과 데이터가 없습니다"
                      description="선택한 조건에 맞는 성과 데이터가 없습니다."
                      action={
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />새 성과 데이터 추가
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredAndSortedData.map((data: PerformanceData) => (
                  <tr key={data.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-medium">{data.driver?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{data.driver?.licenseNumber}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <ScoreIndicator score={data.safetyScore} type="safety" />
                        <span>{data.safetyScore}점</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <ScoreIndicator score={data.ecoScore} type="eco" />
                        <span>{data.ecoScore}점</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <ScoreIndicator score={data.overallScore} type="overall" />
                        <span className="font-semibold">{data.overallScore}점</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {formatDateRange(data.periodStart, data.periodEnd)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm">{data.vehicleId}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(data.id)}>
                          수정
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(data.id)}>
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 성능 최적화된 개별 행 컴포넌트
const PerformanceRowItem = React.memo(
  ({
    data,
    onEdit,
    onDelete,
  }: {
    data: PerformanceData;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
  }) => {
    return (
      <div className="grid grid-cols-7 items-center gap-4 p-4">
        <div className="font-medium">{data.driver?.name || 'N/A'}</div>
        <div className="flex items-center gap-2">
          <ScoreIndicator score={data.safetyScore} type="safety" />
          <span>{data.safetyScore}점</span>
        </div>
        <div className="flex items-center gap-2">
          <ScoreIndicator score={data.ecoScore} type="eco" />
          <span>{data.ecoScore}점</span>
        </div>
        <div className="flex items-center gap-2">
          <ScoreIndicator score={data.overallScore} type="overall" />
          <span className="font-semibold">{data.overallScore}점</span>
        </div>
        <div className="text-sm text-gray-600">
          {formatDateRange(data.periodStart, data.periodEnd)}
        </div>
        <div className="text-sm">{data.vehicleId}</div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => onEdit(data.id)}>
            편집
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(data.id)}
            className="text-red-600 hover:text-red-700"
          >
            삭제
          </Button>
        </div>
      </div>
    );
  }
);

// PerformanceData 타입 정의 추가
interface PerformanceData {
  id: string;
  driverId: string;
  driver?: {
    id: string;
    name: string;
    licenseNumber: string;
  };
  period: string;
  periodStart: string;
  periodEnd: string;
  safetyScore: number;
  ecoScore: number;
  overallScore: number;
  vehicleId: string;
  milesPerGallon: number;
  incidents: number;
  totalDistance: number;
  updatedAt: string;
}

// 유틸리티 함수들
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleDateString()} ~ ${endDate.toLocaleDateString()}`;
}

// 점수별 색상
const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

// 점수별 배경 색상
const getScoreBgColor = (score: number) => {
  if (score >= 90) return 'bg-green-100';
  if (score >= 80) return 'bg-blue-100';
  if (score >= 70) return 'bg-yellow-100';
  return 'bg-red-100';
};

// 등급 계산
const getGrade = (score: number) => {
  if (score >= 95) return { grade: 'S', label: '최우수' };
  if (score >= 90) return { grade: 'A+', label: '우수' };
  if (score >= 85) return { grade: 'A', label: '양호' };
  if (score >= 80) return { grade: 'B+', label: '보통' };
  if (score >= 75) return { grade: 'B', label: '개선필요' };
  if (score >= 70) return { grade: 'C+', label: '주의' };
  return { grade: 'C', label: '경고' };
};

// 트렌드 아이콘
const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'down':
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <div className="h-4 w-4 rounded-full bg-gray-300" />;
  }
};
