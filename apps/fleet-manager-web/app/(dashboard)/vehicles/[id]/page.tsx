'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { VEHICLE_STATUS_LABEL } from '../../../../app/constants';
import { vehicleService, Vehicle, leaseService, LeaseContract } from '../../../services/api';

interface VehicleDetailPageProps {
  params: {
    id: string;
  };
}

export default function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const router = useRouter();
  const { id } = params;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [leases, setLeases] = useState<LeaseContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const vehicleData = await vehicleService.getVehicleById(id);
        setVehicle(vehicleData);

        const leaseData = await leaseService.getLeasesByVehicleId(id);
        setLeases(leaseData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '차량 정보를 불러오는데 실패했습니다.');
        // 에러 상태 설정으로 처리
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleEdit = () => {
    router.push(`/dashboard/vehicles/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 차량을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      await vehicleService.deleteVehicle(id);
      router.push('/dashboard/vehicles');
    } catch (err) {
      alert(err instanceof Error ? err.message : '차량 삭제에 실패했습니다.');
      // 에러는 alert로만 표시
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
        <p>오류가 발생했습니다: {error || '차량 정보를 찾을 수 없습니다.'}</p>
        <button
          onClick={() => router.back()}
          className="mt-3 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-2 flex items-center text-blue-600 hover:text-blue-800"
          >
            ← 목록으로 돌아가기
          </button>
          <h1 className="text-2xl font-bold">
            {vehicle.make} {vehicle.model} ({vehicle.year})
          </h1>
          <p className="text-gray-600">차량번호: {vehicle.plateNumber}</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleEdit}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            수정
          </button>
          <button
            onClick={handleDelete}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            삭제
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* 차량 기본 정보 카드 */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold">차량 정보</h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-600">제조사</p>
                  <p className="font-medium">{vehicle.make}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">모델</p>
                  <p className="font-medium">{vehicle.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">연식</p>
                  <p className="font-medium">{vehicle.year}년</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">상태</p>
                  <p className="font-medium">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs
                      ${
                        vehicle.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : vehicle.status === 'maintenance'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {VEHICLE_STATUS_LABEL[vehicle.status]}
                    </span>
                  </p>
                </div>
                {vehicle.vin && (
                  <div>
                    <p className="text-sm text-gray-600">VIN</p>
                    <p className="font-medium">{vehicle.vin}</p>
                  </div>
                )}
                {vehicle.color && (
                  <div>
                    <p className="text-sm text-gray-600">색상</p>
                    <p className="font-medium">{vehicle.color}</p>
                  </div>
                )}
                {vehicle.fuelType && (
                  <div>
                    <p className="text-sm text-gray-600">연료 타입</p>
                    <p className="font-medium">{vehicle.fuelType}</p>
                  </div>
                )}
                {vehicle.mileage !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600">주행거리</p>
                    <p className="font-medium">{vehicle.mileage.toLocaleString()}km</p>
                  </div>
                )}
                {vehicle.purchaseDate && (
                  <div>
                    <p className="text-sm text-gray-600">구매일</p>
                    <p className="font-medium">{vehicle.purchaseDate}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 리스/렌트 계약 정보 */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">리스/렌트 계약</h2>
                <button
                  onClick={() => router.push(`/dashboard/leases/new?vehicleId=${id}`)}
                  className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                >
                  + 계약 추가
                </button>
              </div>

              {leases.length === 0 ? (
                <div className="rounded bg-gray-50 py-8 text-center">
                  <p className="text-gray-500">이 차량에 대한 리스/렌트 계약이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leases.map(lease => (
                    <div
                      key={lease.id}
                      className="cursor-pointer rounded-lg border p-4 hover:bg-gray-50"
                      onClick={() => router.push(`/dashboard/leases/${lease.id}`)}
                    >
                      <div className="flex justify-between">
                        <h3 className="font-medium">{lease.provider}</h3>
                        <span
                          className={`rounded-full px-2 py-1 text-xs
                          ${
                            lease.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : lease.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {lease.status}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">기간</p>
                          <p>
                            {lease.startDate} ~ {lease.endDate}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">월 납부액</p>
                          <p>
                            {lease.monthlyPayment ? lease.monthlyPayment.toLocaleString() : '0'}원
                          </p>
                        </div>
                      </div>
                      {lease.notes && <p className="mt-2 text-sm text-gray-600">{lease.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 차량 이미지 */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="relative aspect-video bg-gray-200">
              {vehicle.imageUrl ? (
                <img
                  src={vehicle.imageUrl}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  차량 이미지 없음
                </div>
              )}
            </div>
            <div className="p-4">
              <button className="w-full rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
                이미지 업데이트
              </button>
            </div>
          </div>

          {/* 빠른 액션 */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold">빠른 액션</h2>
              <div className="space-y-2">
                <button
                  onClick={() => router.push(`/dashboard/maintenance/new?vehicleId=${id}`)}
                  className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  정비 일정 추가
                </button>
                <button
                  onClick={() => router.push(`/dashboard/insurance?vehicleId=${id}`)}
                  className="w-full rounded border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50"
                >
                  보험 정보 확인
                </button>
                <button
                  onClick={() => router.push(`/dashboard/drivers/assign?vehicleId=${id}`)}
                  className="w-full rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  운전자 배정
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
