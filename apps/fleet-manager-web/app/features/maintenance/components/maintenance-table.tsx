'use client';

import { useState } from 'react';
import { Eye, Edit, Trash, Search, RefreshCw } from 'lucide-react';

import { Maintenance, MaintenanceStatus, MaintenanceType } from '../types';

interface MaintenanceTableProps {
  maintenances: Maintenance[];
  isLoading: boolean;
  onView: (maintenance: Maintenance) => void;
  onEdit: (maintenance: Maintenance) => void;
  onDelete: (maintenance: Maintenance) => void;
  onStatusChange: (maintenance: Maintenance, status: MaintenanceStatus) => void;
  onFilterChange?: (filters: { status?: string; type?: string; search?: string }) => void;
  onRefresh?: () => void;
}

export function MaintenanceTable({
  maintenances,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onFilterChange,
  onRefresh,
}: MaintenanceTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  // 검색 처리
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onFilterChange) {
      onFilterChange({
        status: selectedStatus,
        type: selectedType,
        search: searchTerm,
      });
    }
  };

  // 상태 필터 변경
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    if (onFilterChange) {
      onFilterChange({
        status,
        type: selectedType,
        search: searchTerm,
      });
    }
  };

  // 타입 필터 변경
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    if (onFilterChange) {
      onFilterChange({
        status: selectedStatus,
        type,
        search: searchTerm,
      });
    }
  };

  // 새로고침
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  // 정비 상태에 따른 배지 스타일
  const getStatusBadge = (status: MaintenanceStatus) => {
    const styles: Record<MaintenanceStatus, string> = {
      pending: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    const labels: Record<MaintenanceStatus, string> = {
      pending: '대기',
      scheduled: '예정',
      in_progress: '진행 중',
      completed: '완료',
      cancelled: '취소',
    };

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  // 정비 타입에 따른 배지 스타일
  const getTypeBadge = (type: MaintenanceType) => {
    const styles: Record<MaintenanceType, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      repair: 'bg-orange-100 text-orange-800',
      emergency: 'bg-red-100 text-red-800',
      inspection: 'bg-purple-100 text-purple-800',
    };

    const labels: Record<MaintenanceType, string> = {
      scheduled: '정기점검',
      repair: '수리',
      emergency: '긴급수리',
      inspection: '검사',
    };

    return (
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${styles[type]}`}>
        {labels[type]}
      </span>
    );
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  // 금액 포맷팅
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* 필터 및 검색 */}
      <div className="flex flex-col justify-between gap-4 md:flex-row">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={e => handleStatusChange(e.target.value)}
              className="w-[180px] rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체 상태</option>
              <option value="scheduled">예정</option>
              <option value="in_progress">진행 중</option>
              <option value="completed">완료</option>
              <option value="cancelled">취소</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={selectedType}
              onChange={e => handleTypeChange(e.target.value)}
              className="w-[180px] rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체 유형</option>
              <option value="regular">정기점검</option>
              <option value="repair">수리</option>
              <option value="emergency">긴급수리</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <input
              type="search"
              placeholder="차량 번호, 정비소, 내용 검색"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-[250px] rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              <Search className="mr-1 h-4 w-4" />
              검색
            </button>
          </form>

          <button
            onClick={handleRefresh}
            className="flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            <RefreshCw className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>
      </div>

      {/* 정비 목록 테이블 */}
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                차량 정보
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                정비 제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                정비 유형
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                일정
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                정비소
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                비용
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              // 로딩 상태
              Array(5)
                .fill(null)
                .map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="h-6 w-16 animate-pulse rounded bg-gray-200"></div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="h-6 w-16 animate-pulse rounded bg-gray-200"></div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="ml-auto h-8 w-24 animate-pulse rounded bg-gray-200"></div>
                    </td>
                  </tr>
                ))
            ) : maintenances.length === 0 ? (
              // 데이터 없음
              <tr>
                <td colSpan={8} className="py-6 text-center">
                  정비 일정이 없습니다.
                </td>
              </tr>
            ) : (
              // 정비 목록
              maintenances.map(maintenance => (
                <tr key={maintenance.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="font-medium">{maintenance.vehicleId}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-medium">{maintenance.title}</div>
                    {maintenance.description && (
                      <div className="max-w-[200px] truncate text-sm text-gray-500">
                        {maintenance.description}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {getTypeBadge(maintenance.type as MaintenanceType)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>{formatDate(maintenance.scheduledDate)}</div>
                    {maintenance.completedDate && (
                      <div className="text-sm text-gray-500">
                        {formatDate(maintenance.completedDate)}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {getStatusBadge(maintenance.status as MaintenanceStatus)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {maintenance.serviceCenterName || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {formatCurrency(maintenance.cost)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onView(maintenance)}
                        className="text-blue-600 hover:text-blue-900"
                        title="상세 보기"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(maintenance)}
                        className="text-gray-600 hover:text-gray-900"
                        title="수정"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(maintenance)}
                        className="text-red-600 hover:text-red-900"
                        title="삭제"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
