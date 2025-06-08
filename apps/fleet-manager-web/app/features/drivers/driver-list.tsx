'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Phone,
  CreditCard,
  Calendar,
  AlertTriangle,
  Car,
  Settings,
  Plus,
  Search,
  MoreHorizontal,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DriverFilters } from '@cargoro/types/schema/driver';

import { LICENSE_TYPES } from '../../../constants';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { useToast } from '../../components/ui/use-toast';
import { driverService, ExtendedDriver } from '../../services/api';

export default function DriverList(): React.JSX.Element {
  const router = useRouter();
  const { toast } = useToast();

  const [drivers, setDrivers] = useState<ExtendedDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [licenseTypeFilter, setLicenseTypeFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  // 운전자 목록 조회
  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const filters: DriverFilters = {
        page: pagination.page,
        pageSize: pagination.pageSize,
      };

      if (searchTerm) filters.search = searchTerm;
      if (statusFilter !== 'all') filters.isActive = statusFilter === 'active';
      if (licenseTypeFilter !== 'all') filters.licenseType = licenseTypeFilter;

      const response = await driverService.getDrivers(filters);
      // Driver[] 타입을 ExtendedDriver[] 타입으로 변환
      const extendedDrivers: ExtendedDriver[] = response.items.map(driver => {
        // assignedVehicles를 올바른 타입으로 변환
        let processedVehicles:
          | string[]
          | Array<{
              id: string;
              make?: string;
              model?: string;
              plateNumber?: string;
              type?: string;
            }> = [];

        if (Array.isArray(driver.assignedVehicles)) {
          // 모든 요소가 string인지 확인
          const allStrings = driver.assignedVehicles.every(v => typeof v === 'string');
          if (allStrings) {
            processedVehicles = driver.assignedVehicles as string[];
          } else {
            // 객체 배열로 변환
            processedVehicles = driver.assignedVehicles.map(v =>
              typeof v === 'string'
                ? {
                    id: v,
                    make: undefined,
                    model: undefined,
                    plateNumber: undefined,
                    type: undefined,
                  }
                : v
            );
          }
        }

        return {
          ...driver,
          assignedVehicles: processedVehicles,
        };
      });
      setDrivers(extendedDrivers);
      setPagination(prev => ({
        ...prev,
        total: response.total,
      }));
    } catch {
      toast({
        title: '오류',
        description: '운전자 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, searchTerm, statusFilter, licenseTypeFilter, toast]);

  useEffect(() => {
    fetchDrivers();
  }, [pagination.page, searchTerm, statusFilter, licenseTypeFilter, fetchDrivers]);

  // 운전자 삭제
  const handleDeleteDriver = async (id: string, name: string) => {
    if (!confirm(`${name} 운전자를 정말 삭제하시겠습니까?`)) return;

    try {
      await driverService.deleteDriver(id);
      toast({
        title: '삭제 완료',
        description: `${name} 운전자가 삭제되었습니다.`,
      });
      fetchDrivers();
    } catch {
      toast({
        title: '오류',
        description: '운전자 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 운전자 상태 토글
  const handleToggleStatus = async (id: string, currentStatus: boolean, name: string) => {
    try {
      await driverService.toggleDriverStatus(id, !currentStatus);
      toast({
        title: '상태 변경 완료',
        description: `${name} 운전자가 ${!currentStatus ? '활성화' : '비활성화'}되었습니다.`,
      });
      fetchDrivers();
    } catch {
      toast({
        title: '오류',
        description: '상태 변경에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 면허 만료일 체크
  const getLicenseExpiryStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysDiff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return { status: 'expired', label: '만료됨', variant: 'destructive' as const };
    } else if (daysDiff <= 30) {
      return { status: 'expiring-soon', label: '곧 만료', variant: 'destructive' as const };
    } else if (daysDiff <= 90) {
      return { status: 'expiring', label: '만료 임박', variant: 'secondary' as const };
    }
    return { status: 'valid', label: '유효', variant: 'default' as const };
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">운전자 관리</h1>
          <p className="text-muted-foreground">
            조직의 운전자를 관리하고 차량을 배정할 수 있습니다.
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/drivers/new')}>
          <Plus className="mr-2 h-4 w-4" />
          운전자 등록
        </Button>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle>검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* 검색창 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="이름, 이메일, 전화번호로 검색..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 상태 필터 */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue>
                  {statusFilter === 'all'
                    ? '전체 상태'
                    : statusFilter === 'active'
                      ? '활성'
                      : '비활성'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="inactive">비활성</SelectItem>
              </SelectContent>
            </Select>

            {/* 면허 유형 필터 */}
            <Select value={licenseTypeFilter} onValueChange={setLicenseTypeFilter}>
              <SelectTrigger>
                <SelectValue>
                  {licenseTypeFilter === 'all'
                    ? '전체 면허'
                    : LICENSE_TYPES.find(t => t.value === licenseTypeFilter)?.label ||
                      licenseTypeFilter}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 면허</SelectItem>
                {LICENSE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 초기화 버튼 */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setLicenseTypeFilter('all');
              }}
            >
              초기화
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 운전자 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            운전자 목록 ({pagination.total}명)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {drivers.length === 0 ? (
            <div className="py-8 text-center">
              <User className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-500">등록된 운전자가 없습니다.</p>
              <Button className="mt-4" onClick={() => router.push('/dashboard/drivers/new')}>
                첫 운전자 등록하기
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>운전자 정보</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>면허 정보</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>배정 차량</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map(driver => {
                  const licenseStatus = getLicenseExpiryStatus(driver.licenseExpiry);

                  return (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{driver.name}</p>
                          <p className="text-sm text-muted-foreground">{driver.email}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{driver.phone}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">{driver.licenseNumber}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(driver.licenseExpiry).toLocaleDateString('ko-KR')}
                            </span>
                            <Badge variant={licenseStatus.variant} className="text-xs">
                              {licenseStatus.label}
                            </Badge>
                          </div>
                          {driver.licenseType && (
                            <Badge variant="outline" className="text-xs">
                              {driver.licenseType}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={driver.isActive ? 'default' : 'secondary'}>
                          {driver.isActive ? '활성' : '비활성'}
                        </Badge>
                        {driver.restrictions && driver.restrictions.length > 0 && (
                          <div className="mt-1">
                            <Badge variant="outline" className="text-xs">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              제한사항 {driver.restrictions.length}개
                            </Badge>
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{driver.assignedVehicles?.length || 0}대</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/drivers/${driver.id}`)}
                            >
                              <User className="mr-2 h-4 w-4" />
                              상세 보기
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/drivers/${driver.id}/edit`)}
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleStatus(driver.id, driver.isActive, driver.name)
                              }
                            >
                              {driver.isActive ? '비활성화' : '활성화'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteDriver(driver.id, driver.name)}
                              className="text-red-600"
                            >
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      {pagination.total > pagination.pageSize && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              이전
            </Button>
            <span className="flex items-center px-4">
              {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
