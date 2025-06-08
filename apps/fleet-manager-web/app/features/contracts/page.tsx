'use client';

import { useState, useEffect } from 'react';
import { FileText, DollarSign, User, Car, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { useRentalStore } from '@/app/state/rental-store';

const rentalStatusConfig = {
  DRAFT: { label: '임시저장', variant: 'secondary' as const, icon: Clock },
  ACTIVE: { label: '활성', variant: 'success' as const, icon: CheckCircle },
  COMPLETED: { label: '완료', variant: 'default' as const, icon: CheckCircle },
  CANCELLED: { label: '취소', variant: 'destructive' as const, icon: X },
};

const leaseStatusConfig = {
  DRAFT: { label: '임시저장', variant: 'secondary' as const, icon: Clock },
  ACTIVE: { label: '활성', variant: 'success' as const, icon: CheckCircle },
  TERMINATED: { label: '중도해지', variant: 'warning' as const, icon: AlertCircle },
  COMPLETED: { label: '만료', variant: 'default' as const, icon: CheckCircle },
};

export default function ContractsPage() {
  const {
    rentalContracts,
    leaseContracts,
    customers,
    vehicles,
    loadRentalContracts,
    loadLeaseContracts,
    terminateRentalContract,
    terminateLeaseContract,
  } = useRentalStore();

  const [activeTab, setActiveTab] = useState('rental');

  useEffect(() => {
    Promise.all([loadRentalContracts(), loadLeaseContracts()]);
  }, [loadRentalContracts, loadLeaseContracts]);

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || '알 수 없음';
  };

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model}` : '알 수 없음';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const getRentalStatusBadge = (status: keyof typeof rentalStatusConfig) => {
    const config = rentalStatusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getLeaseStatusBadge = (status: keyof typeof leaseStatusConfig) => {
    const config = leaseStatusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const activeRentals = rentalContracts.filter(c => c.status === 'ACTIVE');
  const activeLeases = leaseContracts.filter(c => c.status === 'ACTIVE');

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">계약 관리</h1>
          <p className="mt-2 text-gray-600">렌탈 및 리스 계약을 통합 관리합니다</p>
        </div>
        <div className="flex gap-2">
          <Link href="/features/rental/new">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />새 렌탈 계약
            </Button>
          </Link>
          <Link href="/features/lease/new">
            <Button>
              <FileText className="mr-2 h-4 w-4" />새 리스 계약
            </Button>
          </Link>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 렌탈</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRentals.length}건</div>
            <p className="text-xs text-muted-foreground">전체 {rentalContracts.length}건 중</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 리스</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLeases.length}건</div>
            <p className="text-xs text-muted-foreground">전체 {leaseContracts.length}건 중</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 렌탈 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                activeRentals.reduce((sum, contract) => sum + contract.totalAmount, 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">월 리스료 합계</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                activeLeases.reduce((sum, contract) => sum + contract.monthlyPayment, 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 계약 목록 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rental">렌탈 계약</TabsTrigger>
          <TabsTrigger value="lease">리스 계약</TabsTrigger>
        </TabsList>

        <TabsContent value="rental" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>렌탈 계약 목록</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>계약번호</TableHead>
                    <TableHead>고객</TableHead>
                    <TableHead>차량</TableHead>
                    <TableHead>계약 기간</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>총 금액</TableHead>
                    <TableHead>보험</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rentalContracts.map(contract => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-mono text-sm">{contract.contractNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {getCustomerName(contract.customerId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-gray-400" />
                          {getVehicleInfo(contract.vehicleId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(contract.startDate)} ~ {formatDate(contract.endDate)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {contract.contractType === 'SHORT_TERM' ? '단기' : '장기'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRentalStatusBadge(contract.status as keyof typeof rentalStatusConfig)}
                      </TableCell>
                      <TableCell>{formatCurrency(contract.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {contract.insuranceType === 'BASIC' && '기본'}
                          {contract.insuranceType === 'STANDARD' && '표준'}
                          {contract.insuranceType === 'PREMIUM' && '프리미엄'}
                          {contract.insuranceType === 'FULL_COVERAGE' && '완전'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            상세
                          </Button>
                          {contract.status === 'ACTIVE' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => terminateRentalContract(contract.id)}
                            >
                              종료
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lease" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>리스 계약 목록</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>계약번호</TableHead>
                    <TableHead>고객</TableHead>
                    <TableHead>차량</TableHead>
                    <TableHead>계약 기간</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>월 납입금</TableHead>
                    <TableHead>리스 유형</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaseContracts.map(contract => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-mono text-sm">{contract.contractNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {getCustomerName(contract.customerId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-gray-400" />
                          {getVehicleInfo(contract.vehicleId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(contract.startDate)} ~ {formatDate(contract.endDate)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.ceil(
                            (new Date(contract.endDate).getTime() -
                              new Date(contract.startDate).getTime()) /
                              (1000 * 60 * 60 * 24 * 30)
                          )}
                          개월
                        </div>
                      </TableCell>
                      <TableCell>
                        {getLeaseStatusBadge(contract.status as keyof typeof leaseStatusConfig)}
                      </TableCell>
                      <TableCell>{formatCurrency(contract.monthlyPayment)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {contract.leaseType === 'OPERATING' ? '운용리스' : '금융리스'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            상세
                          </Button>
                          {contract.status === 'ACTIVE' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => terminateLeaseContract(contract.id)}
                            >
                              해지
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
