'use client';

import { useState, useEffect } from 'react';
import { DownloadIcon, FilterIcon, MoreHorizontalIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { formatDateString } from '../../../utils';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useToast } from '../../components/ui/use-toast';
import { Driver, DriverFilters, driverService } from '../../services/api';

export default function DriversPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [licenseType, setLicenseType] = useState<string>('');
  const [exporting, setExporting] = useState<boolean>(false);

  const loadDrivers = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: DriverFilters = {
        search: searchTerm,
      };

      if (activeTab === 'active') {
        filters.isActive = true;
      } else if (activeTab === 'inactive') {
        filters.isActive = false;
      }

      if (department) {
        filters.department = department;
      }

      if (licenseType) {
        filters.licenseType = licenseType;
      }

      const response = await driverService.getDrivers(filters);
      setDrivers(response.items);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : '운전자 목록을 불러오는데 실패했습니다.';
      // 에러는 toast로만 표시
      setError('운전자 목록을 불러오는데 실패했습니다.');
      toast({
        title: '오류',
        description: '운전자 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, [activeTab, department, licenseType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    loadDrivers();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleExportToExcel = async () => {
    try {
      setExporting(true);

      // Excel로 내보내기 옵션 설정
      const exportOptions = {
        dateFrom: new Date(new Date().setMonth(new Date().getMonth() - 6))
          .toISOString()
          .split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
        format: 'excel' as const,
        includePerformanceData: true,
        includeVehicleAssignments: true,
        includeDrivingHistory: true,
        includeInactiveDrivers: activeTab === 'all' || activeTab === 'inactive',
      };

      const blob = await driverService.exportDriversToExcel(exportOptions);

      // 파일 다운로드
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `drivers_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: '내보내기 완료',
        description: '운전자 목록이 엑셀 파일로 내보내기 되었습니다.',
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '엑셀 파일 생성에 실패했습니다.';
      // 에러는 toast로만 표시
      toast({
        title: '내보내기 실패',
        description: '엑셀 파일 생성에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteDriver = async (driver: Driver) => {
    if (window.confirm(`${driver.name} 운전자를 삭제하시겠습니까?`)) {
      try {
        await driverService.deleteDriver(driver.id);
        toast({
          title: '운전자 삭제',
          description: `${driver.name} 운전자가 삭제되었습니다.`,
        });
        loadDrivers();
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : '운전자 삭제에 실패했습니다.';
        // 에러는 toast로만 표시
        toast({
          title: '삭제 실패',
          description: '운전자 삭제에 실패했습니다.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleToggleStatus = async (driver: Driver) => {
    try {
      const newStatus = !driver.isActive;
      await driverService.toggleDriverStatus(driver.id, newStatus);
      toast({
        title: '상태 변경',
        description: `${driver.name} 운전자가 ${newStatus ? '활성' : '비활성'} 상태로 변경되었습니다.`,
      });
      loadDrivers();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '운전자 상태 변경에 실패했습니다.';
      // 에러는 toast로만 표시
      toast({
        title: '상태 변경 실패',
        description: '운전자 상태 변경에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 부서 목록
  const departments = [
    '영업부',
    '마케팅부',
    '물류부',
    '인사부',
    '기술부',
    '경영지원부',
    '회계부',
    'IT부',
  ];

  // 면허 종류
  const licenseTypes = ['1종보통', '1종대형', '2종보통', '2종소형', '특수'];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">운전자 관리</h1>
          <p className="mt-1 text-muted-foreground">
            모든 운전자 정보를 확인하고 관리할 수 있습니다
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={handleExportToExcel}
            variant="outline"
            disabled={loading || exporting}
            className="w-full sm:w-auto"
          >
            <DownloadIcon className="mr-2 h-4 w-4" />
            {exporting ? '내보내는 중...' : '엑셀로 내보내기'}
          </Button>
          <Button
            onClick={() => router.push('/dashboard/drivers/new')}
            className="w-full sm:w-auto"
          >
            <PlusIcon className="mr-2 h-4 w-4" />새 운전자 등록
          </Button>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <TabsList>
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="active">활성</TabsTrigger>
                <TabsTrigger value="inactive">비활성</TabsTrigger>
              </TabsList>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="운전자 검색..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10"
                  />
                </div>
                <Button onClick={handleSearch} variant="secondary" className="sm:w-auto">
                  검색
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="sm:w-auto">
                      <FilterIcon className="mr-2 h-4 w-4" />
                      필터
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <div className="p-2">
                      <div className="mb-2 space-y-2">
                        <Label htmlFor="department">부서</Label>
                        <Select value={department} onValueChange={setDepartment}>
                          <SelectTrigger id="department">
                            <SelectValue placeholder="부서 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">전체</SelectItem>
                            {departments.map(dept => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="licenseType">면허 종류</Label>
                        <Select value={licenseType} onValueChange={setLicenseType}>
                          <SelectTrigger id="licenseType">
                            <SelectValue placeholder="면허 종류 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">전체</SelectItem>
                            {licenseTypes.map(type => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <TabsContent value="all" className="mt-0">
              {renderDriverTable()}
            </TabsContent>
            <TabsContent value="active" className="mt-0">
              {renderDriverTable()}
            </TabsContent>
            <TabsContent value="inactive" className="mt-0">
              {renderDriverTable()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );

  function renderDriverTable() {
    if (loading) {
      return (
        <div className="flex h-48 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-red-800">{error}</p>
          <Button onClick={loadDrivers} variant="outline" className="mt-2">
            다시 시도
          </Button>
        </div>
      );
    }

    if (drivers.length === 0) {
      return (
        <div className="py-12 text-center">
          <p className="mb-4 text-muted-foreground">
            {searchTerm || department || licenseType || activeTab !== 'all'
              ? '검색 조건에 맞는 운전자가 없습니다'
              : '등록된 운전자가 없습니다'}
          </p>
          <Button onClick={() => router.push('/dashboard/drivers/new')}>
            <PlusIcon className="mr-2 h-4 w-4" />새 운전자 등록
          </Button>
        </div>
      );
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>연락처</TableHead>
              <TableHead>면허번호</TableHead>
              <TableHead>면허 만료일</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map(driver => (
              <TableRow key={driver.id}>
                <TableCell
                  className="cursor-pointer font-medium hover:text-blue-600"
                  onClick={() => router.push(`/dashboard/drivers/${driver.id}`)}
                >
                  {driver.name}
                  {driver.department && (
                    <span className="ml-2 text-xs text-muted-foreground">{driver.department}</span>
                  )}
                </TableCell>
                <TableCell>{driver.phone}</TableCell>
                <TableCell>
                  {driver.licenseNumber}
                  {driver.licenseType && (
                    <span className="ml-2 text-xs text-muted-foreground">{driver.licenseType}</span>
                  )}
                </TableCell>
                <TableCell>
                  {driver.licenseExpiry ? (
                    formatDateString(driver.licenseExpiry)
                  ) : (
                    <span className="text-muted-foreground">정보 없음</span>
                  )}
                </TableCell>
                <TableCell>
                  {driver.isActive ? (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 hover:bg-green-50"
                    >
                      활성
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-500 hover:bg-gray-100"
                    >
                      비활성
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontalIcon className="h-4 w-4" />
                        <span className="sr-only">메뉴 열기</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/drivers/${driver.id}`)}
                      >
                        상세 보기
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/drivers/${driver.id}/edit`)}
                      >
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(driver)}>
                        {driver.isActive ? '비활성화' : '활성화'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteDriver(driver)}>
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}
