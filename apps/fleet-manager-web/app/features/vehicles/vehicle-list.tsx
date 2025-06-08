'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { VehicleCard } from '../../components/vehicle-card';
import { VEHICLE_STATUS, VEHICLE_STATUS_LABEL } from '../../constants/constants';
import { useVehicles } from '../../hooks/useVehicles';

export default function VehicleList() {
  const router = useRouter();
  const {
    vehicles,
    loading,
    error,
    filterByStatus,
    status,
    pagination,
    changePage,
    nextPage,
    prevPage,
    searchQuery,
    setSearch,
  } = useVehicles();

  // 검색어 내부 상태 - 디바운싱을 위해 사용
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // 검색어 입력이 끝나면 검색 실행
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearchTerm);
    }, 300); // 300ms 디바운스

    return () => clearTimeout(timer);
  }, [localSearchTerm, setSearch]);

  // 검색어 초기화
  useEffect(() => {
    if (searchQuery && !localSearchTerm) {
      setLocalSearchTerm(searchQuery);
    }
  }, [searchQuery, localSearchTerm]);

  // 차량 상세 페이지로 이동
  const handleVehicleClick = (id: string) => {
    router.push(`/dashboard/vehicles/${id}`);
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div
          data-testid="loading-spinner"
          className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
        <p>오류가 발생했습니다: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">차량 관리</h1>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              type="text"
              placeholder="차량 검색..."
              value={localSearchTerm}
              onChange={e => setLocalSearchTerm(e.target.value)}
              className="w-full pl-10 sm:w-64"
            />
            {localSearchTerm && (
              <button
                onClick={() => {
                  setLocalSearchTerm('');
                  setSearch('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                aria-label="검색어 지우기"
              >
                <span className="sr-only">검색어 지우기</span>✕
              </button>
            )}
          </div>

          <Button
            onClick={() => router.push('/dashboard/vehicles/new')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            신규 차량 등록
          </Button>
        </div>
      </div>

      <div className="mb-4 flex overflow-x-auto py-2">
        <button
          onClick={() => filterByStatus('all')}
          className={`mr-2 whitespace-nowrap rounded-lg px-4 py-2 ${
            status === 'all'
              ? 'bg-blue-100 font-medium text-blue-800'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          전체 차량
        </button>
        {Object.entries(VEHICLE_STATUS).map(([key, value]) => (
          <button
            key={key}
            onClick={() => filterByStatus(key as keyof typeof VEHICLE_STATUS)}
            className={`mr-2 whitespace-nowrap rounded-lg px-4 py-2 ${
              status === key
                ? 'bg-blue-100 font-medium text-blue-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {VEHICLE_STATUS_LABEL[value]}
          </button>
        ))}
      </div>

      {vehicles.length === 0 ? (
        <div className="rounded-lg bg-gray-50 py-12 text-center">
          <p className="text-lg text-gray-500">
            {searchQuery
              ? '검색 결과가 없습니다.'
              : status !== 'all'
                ? `${VEHICLE_STATUS_LABEL[VEHICLE_STATUS[status as keyof typeof VEHICLE_STATUS]]} 상태의 차량이 없습니다.`
                : '등록된 차량이 없습니다.'}
          </p>
          <Button
            onClick={() => router.push('/dashboard/vehicles/new')}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            신규 차량 등록하기
          </Button>
        </div>
      ) : (
        <>
          <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3`}>
            {vehicles.map(vehicle => (
              <VehicleCard
                key={vehicle.id}
                vehicle={{
                  id: vehicle.id,
                  make: vehicle.make,
                  model: vehicle.model,
                  year: vehicle.year,
                  status: vehicle.status,
                  plateNumber: vehicle.plateNumber,
                }}
                onClick={() => handleVehicleClick(vehicle.id)}
              />
            ))}
          </div>

          {/* 페이지네이션 */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-2">
              <div className="text-sm text-muted-foreground">
                {(pagination.page - 1) * pagination.pageSize + 1}-
                {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)}/{' '}
                {pagination.totalItems}개 차량
              </div>
              <div className="flex items-center space-x-6 lg:space-x-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  이전
                </Button>
                <div className="text-sm font-medium">
                  {pagination.page} / {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  다음
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
