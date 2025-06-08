'use client';

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@cargoro/ui';

import { VEHICLE_STATUS } from '../constants/constants';
import { Vehicle, vehicleService, VehicleFilters } from '../services/api';

type VehicleStatusFilter = keyof typeof VEHICLE_STATUS | 'all';

export function useVehicles(): {
  vehicles: Vehicle[];
  loading: boolean;
  error: Error | null;
  filterByStatus: (status: VehicleStatusFilter) => void;
  status: VehicleStatusFilter;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  changePage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  searchQuery: string;
  setSearch: (query: string) => void;
  refreshVehicles: () => void;
} {
  const [_allVehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [status, setStatus] = useState<VehicleStatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  });
  const { toast } = useToast();

  // 차량 데이터 가져오기
  const fetchVehicles = useCallback(
    async (filters: VehicleFilters = {}) => {
      try {
        setLoading(true);
        setError(null);

        const response = await vehicleService.getVehicles({
          ...filters,
          page: pagination.page,
          pageSize: pagination.pageSize, // limit을 pageSize로 변경
          status: status !== 'all' ? VEHICLE_STATUS[status] : undefined,
          search: searchQuery || undefined,
        });

        // API 응답 구조에 맞게 수정
        setVehicles(response.vehicles || []);
        setFilteredVehicles(response.vehicles || []);
        setPagination({
          page: response.pagination?.page || 1,
          pageSize: response.pagination?.limit || 20, // limit -> pageSize 매핑
          totalItems: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0,
        });
      } catch (err) {
        // 차량 정보 로딩 오류
        setError(err instanceof Error ? err : new Error('차량 정보를 불러오는 데 실패했습니다.'));
        toast({
          title: '오류 발생',
          description: '차량 정보를 불러오는 데 실패했습니다.',
          variant: 'destructive',
        });

        // 개발 환경에서는 임시 데이터 사용
        if (process.env.NODE_ENV === 'development') {
          // 개발 환경에서 임시 데이터 사용 중
          const mockVehicles: Vehicle[] = [
            {
              id: '1',
              make: '현대',
              model: '소나타',
              year: 2023,
              plateNumber: '12가 3456',
              licensePlate: '12가 3456',
              vin: 'KMHE341CBNA123456',
              color: '검은색',
              status: 'active',
              fuelType: 'gasoline',
              mileage: 15000,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '2',
              make: '기아',
              model: 'K5',
              year: 2022,
              plateNumber: '34나 5678',
              licensePlate: '34나 5678',
              vin: 'KNAHF41CBRA234567',
              color: '흰색',
              status: 'maintenance',
              fuelType: 'hybrid',
              mileage: 25000,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '3',
              make: '쌍용',
              model: '렉스턴',
              year: 2023,
              plateNumber: '56다 7890',
              licensePlate: '56다 7890',
              vin: 'KNMCS81CBTA345678',
              color: '회색',
              status: 'inactive',
              fuelType: 'diesel',
              mileage: 5000,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '4',
              make: '르노삼성',
              model: 'SM6',
              year: 2021,
              plateNumber: '78라 9012',
              licensePlate: '78라 9012',
              vin: 'LNBCS21CBUA456789',
              color: '파란색',
              status: 'out_of_service',
              fuelType: 'gasoline',
              mileage: 35000,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '5',
              make: '테슬라',
              model: 'Model 3',
              year: 2023,
              plateNumber: '90마 3456',
              licensePlate: '90마 3456',
              vin: '5YJ3E1EA5KF567890',
              color: '흰색',
              status: 'active',
              fuelType: 'electric',
              mileage: 10000,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '6',
              make: '현대',
              model: '팰리세이드',
              year: 2022,
              plateNumber: '12바 5678',
              licensePlate: '12바 5678',
              vin: 'KMHJ81CBMA678901',
              color: '검은색',
              status: 'maintenance',
              fuelType: 'hybrid',
              mileage: 18000,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '7',
              make: '기아',
              model: '카니발',
              year: 2023,
              plateNumber: '34사 7890',
              licensePlate: '34사 7890',
              vin: 'KNDJ23CBNA789012',
              color: '은색',
              status: 'active',
              fuelType: 'diesel',
              mileage: 12000,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '8',
              make: '포드',
              model: 'Transit',
              year: 2022,
              plateNumber: '56아 9012',
              licensePlate: '56아 9012',
              vin: 'WF0FXXBDFBX890123',
              color: '흰색',
              status: 'inactive',
              fuelType: 'gasoline',
              mileage: 8000,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];

          // 검색어와 상태 필터 적용
          let filtered = [...mockVehicles];

          if (status !== 'all') {
            filtered = filtered.filter(v => v.status === VEHICLE_STATUS[status]);
          }

          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
              v =>
                (v.plateNumber || v.licensePlate || '').toLowerCase().includes(query) ||
                v.make.toLowerCase().includes(query) ||
                v.model.toLowerCase().includes(query)
            );
          }

          setVehicles(mockVehicles);
          setFilteredVehicles(filtered);
        }
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.pageSize, status, searchQuery, toast]
  );

  // 초기 데이터 로드
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // 상태별 필터링
  const filterByStatus = useCallback((newStatus: VehicleStatusFilter) => {
    setStatus(newStatus);
    // 상태 변경 시 페이지 리셋
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
  }, []);

  // 검색어 설정
  const setSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // 검색어 변경 시 페이지 리셋
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
  }, []);

  // 페이지 변경
  const changePage = useCallback((newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage,
    }));
  }, []);

  // 다음 페이지로 이동
  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  }, [pagination.page, pagination.totalPages]);

  // 이전 페이지로 이동
  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      setPagination(prev => ({
        ...prev,
        page: prev.page - 1,
      }));
    }
  }, [pagination.page]);

  // 차량 데이터 리프레시
  const refreshVehicles = useCallback(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return {
    vehicles: filteredVehicles,
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
    refreshVehicles,
  };
}
