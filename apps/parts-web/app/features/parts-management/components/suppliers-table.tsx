'use client';

import { useState } from 'react';
import { Edit, Trash, RefreshCw, Search } from 'lucide-react';

import { Supplier } from '../types';
import { Badge } from '@cargoro/ui/badge';
import { SupplierStatus } from '../types';

interface SuppliersTableProps {
  suppliers: Supplier[];
  isLoading: boolean;
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onFilterChange: (filters: {
    name?: string;
    city?: string;
    country?: string;
    status?: string;
  }) => void;
  onRefresh: () => void;
}

export const SuppliersTable = ({
  suppliers,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onFilterChange,
  onRefresh,
}: SuppliersTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // 필터 적용
  const handleFilterApply = () => {
    onFilterChange({
      name: searchTerm || undefined,
      status: statusFilter || undefined,
    });
  };

  // 필터 초기화
  const handleFilterReset = () => {
    setSearchTerm('');
    setStatusFilter('');
    onFilterChange({});
  };

  /**
   * 공급업체 상태에 따른 배지 렌더링
   */
  const renderStatusBadge = (status: SupplierStatus | string | undefined) => {
    if (!status) return <Badge variant="outline">알 수 없음</Badge>;

    switch (status) {
      case SupplierStatus.ACTIVE:
        return <Badge className="bg-green-100 text-green-800">활성</Badge>;
      case SupplierStatus.INACTIVE:
        return <Badge className="bg-red-100 text-red-800">비활성</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* 필터 섹션 */}
      <div className="flex flex-wrap items-center gap-4 border-b pb-4">
        <div className="min-w-[300px] flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="공급업체 이름으로 검색..."
              className="w-full rounded-md border py-2 pl-10 pr-4"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-initial">
          <select
            className="rounded-md border px-4 py-2"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">모든 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
        </div>

        <div className="flex flex-initial space-x-2">
          <button
            onClick={handleFilterApply}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            필터 적용
          </button>
          <button
            onClick={handleFilterReset}
            className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
          >
            초기화
          </button>
          <button onClick={onRefresh} className="p-2 text-gray-600 hover:text-blue-600">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                공급업체
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                담당자
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                연락처
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                지역
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                상태
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  검색 결과가 없습니다
                </td>
              </tr>
            ) : (
              suppliers.map(supplier => (
                <tr
                  key={supplier.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onView(supplier)}
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-medium text-gray-900">{supplier.name}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-500">{supplier.contactName}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-500">{supplier.phone}</div>
                    <div className="text-sm text-gray-500">{supplier.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-500">{supplier.address}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {renderStatusBadge(supplier.status)}
                  </td>
                  <td className="space-x-2 whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onEdit(supplier);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onDelete(supplier);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
