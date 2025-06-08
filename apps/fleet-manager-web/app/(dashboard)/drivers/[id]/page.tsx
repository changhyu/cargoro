'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  FileText,
  Calendar,
  AlertCircle,
  Truck,
  Settings,
  ArrowLeft,
  Edit,
  Trash,
  UserMinus,
  UserPlus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, useToast } from '@cargoro/ui';

import { ExtendedDriver, driverService } from '@/app/services/api';
import { DRIVER_STATUS_LABEL } from '@/constants'; // 올바른 경로로 수정

interface DriverDetailPageProps {
  params: {
    id: string;
  };
}

// 현재 배정된 차량 인터페이스
interface CurrentVehicle {
  id: string;
  make: string;
  model: string;
  plateNumber: string;
  assignedDate: string;
}

// 차량 배정 이력 인터페이스
interface VehicleHistoryItem {
  id: string;
  vehicleId: string;
  make: string;
  model: string;
  plateNumber: string;
  startDate: string;
  endDate: string | null;
  status: 'active' | 'completed' | 'cancelled';
}

// 운전 성과 인터페이스
interface DriverPerformance {
  overallScore: number;
  safetyScore: number;
  punctualityScore: number;
  fuelEfficiencyScore: number;
  drivingBehaviorScore: number;
  trends: {
    safety: 'up' | 'down' | 'stable';
    punctuality: 'up' | 'down' | 'stable';
    fuelEfficiency: 'up' | 'down' | 'stable';
    drivingBehavior: 'up' | 'down' | 'stable';
  };
}

export default function DriverDetailPage({ params }: DriverDetailPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [driver, setDriver] = useState<ExtendedDriver | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, _setError] = useState<string | null>(null);
  // 구체적인 타입으로 상태 정의
  const [_currentVehicle, setCurrentVehicle] = useState<CurrentVehicle | null>(null);
  const [_vehicleHistory, setVehicleHistory] = useState<VehicleHistoryItem[]>([]);
  const [_performance, setPerformance] = useState<DriverPerformance | null>(null);

  useEffect(() => {
    const loadDriverDetails = async () => {
      setLoading(true);
      _setError(null);

      try {
        // 운전자 기본 정보 조회
        const driverResponse = await driverService.getDriverById(params.id);
        // 타입 변환 처리
        const extendedDriver: ExtendedDriver = {
          ...driverResponse,
          assignedVehicles: Array.isArray(driverResponse.assignedVehicles)
            ? driverResponse.assignedVehicles.map(v =>
                typeof v === 'string'
                  ? { id: v }
                  : (v as {
                      id: string;
                      make?: string;
                      model?: string;
                      plateNumber?: string;
                      type?: string;
                    })
              )
            : undefined,
        };
        setDriver(extendedDriver);

        // 나머지 데이터는 모의 데이터로 대체 (추후 실제 API 구현 시 수정 필요)
        // 현재 배정된 차량 정보 조회
        // const currentVehicleResponse = await driverService.getCurrentVehicle(params.id);
        setCurrentVehicle({
          id: 'v-temp-1',
          make: '현대',
          model: '아반떼',
          plateNumber: '12가 3456',
          assignedDate: '2024-01-15',
        });

        // 차량 배정 이력 조회
        // const vehicleHistoryResponse = await driverService.getVehicleHistory(params.id);
        setVehicleHistory([
          {
            id: 'vh-1',
            vehicleId: 'v-temp-1',
            make: '현대',
            model: '아반떼',
            plateNumber: '12가 3456',
            startDate: '2024-01-15',
            endDate: null,
            status: 'active',
          },
          {
            id: 'vh-2',
            vehicleId: 'v-temp-2',
            make: '기아',
            model: 'K5',
            plateNumber: '34나 5678',
            startDate: '2023-06-10',
            endDate: '2024-01-14',
            status: 'completed',
          },
        ]);

        // 운전 성과 정보 조회
        // const performanceResponse = await driverService.getDriverPerformance(params.id);
        setPerformance({
          overallScore: 85,
          safetyScore: 90,
          punctualityScore: 85,
          fuelEfficiencyScore: 80,
          drivingBehaviorScore: 82,
          trends: {
            safety: 'up',
            punctuality: 'stable',
            fuelEfficiency: 'down',
            drivingBehavior: 'up',
          },
        });
      } catch (err) {
        // 에러는 toast로만 표시
        _setError('운전자 정보를 불러오는데 실패했습니다.');
        toast({
          title: '오류',
          description: '운전자 정보를 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadDriverDetails();
  }, [params.id, toast]);

  const handleDeleteDriver = async () => {
    if (!driver) return;

    if (!confirm(`${driver.name} 운전자를 정말 삭제하시겠습니까?`)) return;

    try {
      await driverService.deleteDriver(driver.id);
      toast({
        title: '삭제 완료',
        description: `${driver.name} 운전자가 삭제되었습니다.`,
      });
      router.push('/dashboard/drivers');
    } catch {
      toast({
        title: '오류',
        description: '운전자 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async () => {
    if (!driver) return;

    try {
      const updatedDriver = await driverService.toggleDriverStatus(driver.id, !driver.isActive);
      // Driver 타입을 ExtendedDriver로 변환하여 타입 안전성 확보
      setDriver({
        ...updatedDriver,
        assignedVehicles: driver.assignedVehicles,
        emergencyContact: driver.emergencyContact,
      });
      toast({
        title: '상태 변경 완료',
        description: `${driver.name} 운전자가 ${!driver.isActive ? '활성화' : '비활성화'}되었습니다.`,
      });
    } catch {
      toast({
        title: '오류',
        description: '상태 변경에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const getLicenseExpiryStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysDiff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return {
        status: 'expired',
        label: '만료됨',
        variant: 'destructive' as const,
        days: Math.abs(daysDiff),
      };
    } else if (daysDiff <= 30) {
      return {
        status: 'expiring-soon',
        label: '곧 만료',
        variant: 'destructive' as const,
        days: daysDiff,
      };
    } else if (daysDiff <= 90) {
      return {
        status: 'expiring',
        label: '만료 임박',
        variant: 'secondary' as const,
        days: daysDiff,
      };
    }
    return { status: 'valid', label: '유효', variant: 'default' as const, days: daysDiff };
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (!driver || error) {
    return (
      <div className="py-8 text-center">
        <User className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="text-gray-500">운전자 정보를 찾을 수 없습니다.</p>
        <Button className="mt-4" onClick={() => router.push('/dashboard/drivers')}>
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  const licenseStatus = getLicenseExpiryStatus(driver.licenseExpiry);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로가기
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{driver.name}</h1>
            <p className="text-muted-foreground">운전자 상세 정보</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/drivers/${driver.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            수정
          </Button>
          <Button variant="outline" onClick={handleToggleStatus}>
            {driver.isActive ? (
              <>
                <UserMinus className="mr-2 h-4 w-4" />
                비활성화
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                활성화
              </>
            )}
          </Button>
          <Button variant="destructive" onClick={handleDeleteDriver}>
            <Trash className="mr-2 h-4 w-4" />
            삭제
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 기본 정보 */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">이름</span>
                  <p className="text-lg font-medium">{driver.name}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">상태</span>
                  <div>
                    <Badge variant={driver.isActive ? 'default' : 'secondary'}>
                      {driver.isActive ? DRIVER_STATUS_LABEL.active : DRIVER_STATUS_LABEL.inactive}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">이메일</span>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{driver.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">전화번호</span>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p>{driver.phone}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">등록일</span>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>
                      {driver.createdAt
                        ? new Date(driver.createdAt).toLocaleDateString('ko-KR')
                        : '정보 없음'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">최종 수정일</span>
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <p>
                      {driver.updatedAt
                        ? new Date(driver.updatedAt).toLocaleDateString('ko-KR')
                        : '정보 없음'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 면허 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                면허 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">면허번호</span>
                  <p className="font-mono text-lg">{driver.licenseNumber}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">면허 종류</span>
                  <div>
                    {driver.licenseType ? (
                      <Badge variant="outline">{driver.licenseType}</Badge>
                    ) : (
                      <span className="text-muted-foreground">미설정</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">만료일</span>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{new Date(driver.licenseExpiry).toLocaleDateString('ko-KR')}</p>
                    <Badge variant={licenseStatus.variant}>{licenseStatus.label}</Badge>
                  </div>
                  {licenseStatus.status === 'expired' && (
                    <p className="text-sm text-red-600">
                      <AlertCircle className="mr-1 inline h-4 w-4" />
                      {licenseStatus.days}일 전에 만료되었습니다
                    </p>
                  )}
                  {licenseStatus.status === 'expiring-soon' && (
                    <p className="text-sm text-red-600">
                      <AlertCircle className="mr-1 inline h-4 w-4" />
                      {licenseStatus.days}일 후 만료됩니다
                    </p>
                  )}
                  {licenseStatus.status === 'expiring' && (
                    <p className="text-sm text-yellow-600">
                      <AlertCircle className="mr-1 inline h-4 w-4" />
                      {licenseStatus.days}일 후 만료됩니다
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 운전 제한사항 */}
          {driver.restrictions && driver.restrictions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  운전 제한사항
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {driver.restrictions.map((restriction, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-yellow-300 text-yellow-700"
                    >
                      {restriction}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 참고사항 */}
          {driver.notes && (
            <Card>
              <CardHeader>
                <CardTitle>참고사항</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{driver.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 배정 차량 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="mr-2 h-5 w-5" />
                배정 차량
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold">{driver.assignedVehicles?.length || 0}</div>
                <p className="text-sm text-muted-foreground">배정된 차량 수</p>
              </div>
              <Button className="w-full" variant="outline">
                <Truck className="mr-2 h-4 w-4" />
                차량 배정 관리
              </Button>
            </CardContent>
          </Card>

          <div className="my-4 border-t border-gray-200"></div>

          {/* 빠른 액션 */}
          <Card>
            <CardHeader>
              <CardTitle>빠른 작업</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push(`/dashboard/drivers/${driver.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                정보 수정
              </Button>
              <Button className="w-full" variant="outline" onClick={handleToggleStatus}>
                {driver.isActive ? (
                  <>
                    <UserMinus className="mr-2 h-4 w-4" />
                    비활성화
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    활성화
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
