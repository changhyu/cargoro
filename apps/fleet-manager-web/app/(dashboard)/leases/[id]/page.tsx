'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@cargoro/ui';

import { LEASE_STATUS_LABEL } from '../../../constants';
import {
  ContractPayment,
  LeaseContract,
  leaseService,
  vehicleService,
  Vehicle,
} from '../../../services/api';

interface LeaseDetailsProps {
  params: {
    id: string;
  };
}

export default function LeaseDetailsPage({ params }: LeaseDetailsProps) {
  const router = useRouter();
  const [lease, setLease] = useState<LeaseContract | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [payments, setPayments] = useState<ContractPayment[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaseDetails = async () => {
      setLoading(true);
      try {
        const leaseData = await leaseService.getLeaseById(params.id);
        setLease(leaseData);

        // 차량 정보 가져오기
        try {
          const vehicleData = await vehicleService.getVehicleById(leaseData.vehicleId);
          setVehicle(vehicleData);
        } catch (vehicleError) {
          // 차량 정보 로드 실패 - 무시
        }

        // 결제 내역 가져오기
        try {
          const paymentsData = await leaseService.getLeasePayments(params.id);
          setPayments(paymentsData);
        } catch (paymentsError) {
          // 결제 내역 로드 실패 - 무시
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '계약 정보를 불러오는데 실패했습니다.');
        // 에러 상태 설정으로 처리
      } finally {
        setLoading(false);
      }
    };

    fetchLeaseDetails();
  }, [params.id]);

  const handleStatusChange = async (
    newStatus: 'active' | 'pending' | 'completed' | 'cancelled' | 'expired'
  ) => {
    try {
      if (!lease) return;
      await leaseService.updateLeaseStatus(lease.id, newStatus);
      setLease({
        ...lease,
        status: newStatus,
      });
    } catch (err) {
      // 에러는 alert로만 표시
      alert('계약 상태를 변경하는데 실패했습니다.');
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/leases/${params.id}/edit`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex h-48 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !lease) {
    return (
      <div className="container mx-auto py-6">
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <p>오류가 발생했습니다: {error || '계약 정보를 불러올 수 없습니다.'}</p>
          <Button
            onClick={() => router.push('/dashboard/leases')}
            className="mt-4"
            variant="outline"
          >
            계약 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRemainingMonths = () => {
    const today = new Date();
    const endDate = new Date(lease.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    if (diffTime <= 0) return 0;

    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
  };

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">계약 상세 정보</h1>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleEdit} variant="outline">
            계약 수정
          </Button>
          <Button onClick={() => router.push('/dashboard/leases')}>계약 목록으로</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{lease.provider} 계약</CardTitle>
              <CardDescription>
                계약 기간: {formatDate(lease.startDate)} ~ {formatDate(lease.endDate)}
              </CardDescription>
            </div>
            <div
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                lease.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : lease.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : lease.status === 'expired'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
              }`}
            >
              {LEASE_STATUS_LABEL[lease.status as keyof typeof LEASE_STATUS_LABEL] || lease.status}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">계약 정보</TabsTrigger>
              <TabsTrigger value="vehicle">차량 정보</TabsTrigger>
              <TabsTrigger value="payments">결제 내역</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="pt-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-lg font-semibold">계약 정보</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">계약 타입</dt>
                      <dd className="font-medium">
                        {lease.contractType === 'lease'
                          ? '리스'
                          : lease.contractType === 'rental'
                            ? '렌트'
                            : '구독'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">월 납입금</dt>
                      <dd className="font-medium">
                        {formatCurrency(lease.monthlyPayment || lease.monthlyPrice || 0)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">총 계약 금액</dt>
                      <dd className="font-medium">{formatCurrency(lease.totalCost || 0)}</dd>
                    </div>
                    {lease.deposit && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">보증금</dt>
                        <dd className="font-medium">{formatCurrency(lease.deposit)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-gray-600">계약 상태</dt>
                      <dd className="font-medium">
                        {LEASE_STATUS_LABEL[lease.status as keyof typeof LEASE_STATUS_LABEL] ||
                          lease.status}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">남은 계약 기간</dt>
                      <dd className="font-medium">{getRemainingMonths()}개월</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold">계약 관리</h3>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h4 className="mb-2 font-medium">계약 상태 변경</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(LEASE_STATUS_LABEL).map(([key, label]) => (
                          <Button
                            key={key}
                            onClick={() =>
                              handleStatusChange(
                                key as 'active' | 'pending' | 'completed' | 'cancelled' | 'expired'
                              )
                            }
                            variant={lease.status === key ? 'default' : 'outline'}
                            size="sm"
                          >
                            {label as string}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {lease.notes && (
                      <div className="rounded-lg bg-gray-50 p-4">
                        <h4 className="mb-2 font-medium">비고</h4>
                        <p className="text-gray-700">{lease.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vehicle" className="pt-4">
              {vehicle ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">차량 정보</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">제조사</dt>
                        <dd className="font-medium">{vehicle.make}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">모델명</dt>
                        <dd className="font-medium">{vehicle.model}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">연식</dt>
                        <dd className="font-medium">{vehicle.year}년형</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">번호판</dt>
                        <dd className="font-medium">{vehicle.plateNumber}</dd>
                      </div>
                      {vehicle.vin && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">VIN</dt>
                          <dd className="font-medium">{vehicle.vin}</dd>
                        </div>
                      )}
                      {vehicle.color && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">색상</dt>
                          <dd className="font-medium">{vehicle.color}</dd>
                        </div>
                      )}
                      {vehicle.mileage !== undefined && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">주행거리</dt>
                          <dd className="font-medium">{vehicle.mileage.toLocaleString()}km</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  <div className="flex items-center justify-center">
                    {vehicle.imageUrl ? (
                      <img
                        src={vehicle.imageUrl}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="max-h-48 rounded-lg object-contain"
                      />
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center rounded-lg bg-gray-100">
                        <p className="text-gray-500">차량 이미지 없음</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-gray-500">차량 정보를 불러올 수 없습니다.</p>
                  <Button
                    onClick={() => router.push(`/dashboard/vehicles/new?leaseId=${lease.id}`)}
                    className="mt-4"
                    variant="outline"
                  >
                    차량 등록하기
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="payments" className="pt-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">결제 내역</h3>
                <Button
                  onClick={() => router.push(`/dashboard/leases/${lease.id}/payments/new`)}
                  size="sm"
                >
                  결제 추가
                </Button>
              </div>

              {payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          결제일
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          결제 유형
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          금액
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          참조번호
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          비고
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {payments.map(payment => (
                        <tr key={payment.id}>
                          <td className="whitespace-nowrap px-6 py-4">
                            {formatDate(payment.paymentDate)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">{payment.paymentType}</td>
                          <td className="whitespace-nowrap px-6 py-4 font-medium">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                            {payment.referenceNumber || '-'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                            {payment.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg bg-gray-50 py-6 text-center">
                  <p className="text-gray-500">결제 내역이 없습니다.</p>
                  <Button
                    onClick={() => router.push(`/dashboard/leases/${lease.id}/payments/new`)}
                    className="mt-4"
                    variant="outline"
                  >
                    결제 추가하기
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
