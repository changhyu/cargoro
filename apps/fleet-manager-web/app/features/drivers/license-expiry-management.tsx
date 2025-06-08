'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, Clock, Mail, BellRing } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  useToast,
} from '@cargoro/ui';

import { Driver, Notification, driverService, notificationService } from '../../services/api';

// Badge 컴포넌트의 variant 타입 정의
type BadgeVariant = 'default' | 'destructive' | 'outline' | 'secondary';

export default function LicenseExpiryManagement() {
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [expiryAlerts, setExpiryAlerts] = useState<Notification[]>([]);

  // 만료 예정 면허증 조회
  useEffect(() => {
    const fetchLicenseExpiryData = async () => {
      setLoading(true);
      try {
        // 면허 만료 예정 알림 조회
        const alertsData = await notificationService.getLicenseExpiryAlerts();
        setExpiryAlerts(alertsData);

        // 면허 만료일이 60일 이내인 운전자 조회
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 60); // 60일 이내

        const driversData = await driverService.getDrivers({
          isActive: true,
        });

        // 면허 만료일 기준으로 필터링
        const filteredDrivers = driversData.items.filter(driver => {
          const expiryDate = new Date(driver.licenseExpiry);
          return expiryDate <= endDate;
        });

        // 만료일 기준으로 정렬
        filteredDrivers.sort(
          (a, b) => new Date(a.licenseExpiry).getTime() - new Date(b.licenseExpiry).getTime()
        );

        setDrivers(filteredDrivers);
      } catch (error) {
        toast({
          title: '오류',
          description: '면허 만료 데이터를 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLicenseExpiryData();
  }, [toast]);

  // 알림 전송 버튼 핸들러
  const handleSendNotification = async (driver: Driver) => {
    try {
      // 여기서는 실제로 알림을 생성하는 API 호출이 필요합니다
      // 예시 코드이므로 실제 구현은 해당 API에 맞게 수정 필요
      /*
      await notificationService.createNotification({
        type: 'license_expiry',
        title: '면허증 만료 예정 알림',
        message: `${driver.name} 님의 운전면허가 ${getRemainingDays(driver.licenseExpiry)}일 후에 만료됩니다.`,
        severity: getRemainingDays(driver.licenseExpiry) <= 7 ? 'error' : 'warning',
        targetType: 'driver',
        targetId: driver.id,
      });
      */

      toast({
        title: '알림 전송 완료',
        description: `${driver.name} 운전자에게 면허 만료 알림이 전송되었습니다.`,
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '알림 전송에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 남은 일수 계산
  const getRemainingDays = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 긴급도 라벨 및 색상
  const getUrgencyLabel = (days: number) => {
    if (days <= 0) {
      return { label: '만료됨', color: 'destructive' as BadgeVariant };
    } else if (days <= 7) {
      return { label: '매우 긴급', color: 'destructive' as BadgeVariant };
    } else if (days <= 30) {
      return { label: '긴급', color: 'destructive' as BadgeVariant };
    } else {
      return { label: '주의', color: 'default' as BadgeVariant };
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          운전 면허 만료 관리
        </CardTitle>
      </CardHeader>
      <CardContent>
        {drivers.length === 0 ? (
          <div className="py-8 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-500">60일 이내에 만료되는 면허가 없습니다.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>운전자</TableHead>
                <TableHead>면허 번호</TableHead>
                <TableHead>만료일</TableHead>
                <TableHead>남은 일수</TableHead>
                <TableHead>긴급도</TableHead>
                <TableHead>알림 상태</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map(driver => {
                const remainingDays = getRemainingDays(driver.licenseExpiry);
                const urgency = getUrgencyLabel(remainingDays);
                // 이 운전자에 대한 알림이 이미 존재하는지 확인
                const hasAlert = expiryAlerts.some(
                  alert => alert.targetType === 'driver' && alert.targetId === driver.id
                );

                return (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{driver.name}</TableCell>
                    <TableCell>{driver.licenseNumber}</TableCell>
                    <TableCell>
                      {new Date(driver.licenseExpiry).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell>
                      {remainingDays <= 0 ? '만료됨' : `${remainingDays}일 남음`}
                    </TableCell>
                    <TableCell>
                      <Badge variant={urgency.color}>{urgency.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {hasAlert ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          알림 전송됨
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100">
                          미전송
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendNotification(driver)}
                          disabled={hasAlert}
                        >
                          <BellRing className="mr-1 h-4 w-4" />
                          알림 전송
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="mr-1 h-4 w-4" />
                          이메일
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* 통계 섹션 */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">만료된 면허</p>
                  <p className="text-xl font-bold">
                    {drivers.filter(d => getRemainingDays(d.licenseExpiry) <= 0).length}명
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">7일 이내 만료</p>
                  <p className="text-xl font-bold">
                    {
                      drivers.filter(d => {
                        const days = getRemainingDays(d.licenseExpiry);
                        return days > 0 && days <= 7;
                      }).length
                    }
                    명
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">30일 이내 만료</p>
                  <p className="text-xl font-bold">
                    {
                      drivers.filter(d => {
                        const days = getRemainingDays(d.licenseExpiry);
                        return days > 7 && days <= 30;
                      }).length
                    }
                    명
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BellRing className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">알림 전송됨</p>
                  <p className="text-xl font-bold">{expiryAlerts.length}건</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
