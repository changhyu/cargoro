'use client';

import { useState, useEffect } from 'react';
import { repairApi } from '../../services/api';
import { Button } from '@cargoro/ui';
import { useToast } from '@cargoro/ui';

interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleInfo: {
    licensePlate: string;
    make: string;
    model: string;
  };

  date: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  serviceType: string;
  notes?: string;
}

export function AppointmentManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []); // eslint-disable-line
  // 의존성 배열에서 fetchAppointments를 제외하여 무한 루프 방지

  async function fetchAppointments() {
    setIsLoading(true);
    try {
      // 예약 데이터 가져오기 요청 시작
      const response = await repairApi.get('/api/appointments');

      // 응답 형식 처리 개선
      let appointmentsData: Appointment[] = [];

      if (response && response.data) {
        // 배열인 경우 직접 사용
        if (Array.isArray(response.data)) {
          appointmentsData = response.data;
        }
        // data 프로퍼티 내부에 배열이 있는 경우
        else if (response.data.data && Array.isArray(response.data.data)) {
          appointmentsData = response.data.data;
        }
        // 기타 예상치 못한 형식인 경우
        else {
          appointmentsData = [];
        }
      } else {
        appointmentsData = [];
      }

      setAppointments(appointmentsData);
    } catch {
      // 오류 발생 시 토스트 메시지 표시
      toast({
        title: '오류',
        description: '예약 목록을 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function updateAppointmentStatus(appointmentId: string, status: string) {
    try {
      await repairApi.put(`/api/appointments/${appointmentId}`, { status });
      toast({
        title: '성공',
        description: '예약 상태가 변경되었습니다',
      });
      fetchAppointments();
    } catch {
      toast({
        title: '오류',
        description: '예약 상태 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  }

  async function cancelAppointment(appointmentId: string) {
    try {
      await repairApi.delete(`/api/appointments/${appointmentId}`);
      toast({
        title: '성공',
        description: '예약이 취소되었습니다',
      });
      fetchAppointments();
    } catch {
      toast({
        title: '오류',
        description: '예약 취소 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  }

  if (isLoading) {
    return <div data-testid="loading-indicator">예약 목록을 불러오는 중...</div>;
  }

  // 데이터가 없는 경우 메시지 표시
  if (appointments.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="mb-6 text-2xl font-bold">예약 관리</h1>
        <div data-testid="no-data-message" className="p-4 text-center text-gray-500">
          예약 데이터가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">예약 관리</h1>

      <div className="rounded-md border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                고객
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                차량
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                예약 일시
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                서비스 유형
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                작업
              </th>
            </tr>
          </thead>
          <tbody
            data-testid="appointments-table-body"
            className="divide-y divide-gray-200 bg-white"
          >
            {appointments.map(appointment => (
              <tr key={appointment.id} data-testid={`appointment-row-${appointment.id}`}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {appointment.customerName}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {appointment.vehicleInfo.licensePlate}
                  </div>
                  <div className="text-sm text-gray-500">
                    {appointment.vehicleInfo.make} {appointment.vehicleInfo.model}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {new Date(appointment.date).toLocaleString()}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900">{appointment.serviceType}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      appointment.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : appointment.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {appointment.status === 'CONFIRMED'
                      ? '확정'
                      : appointment.status === 'PENDING'
                        ? '대기중'
                        : appointment.status === 'COMPLETED'
                          ? '완료'
                          : '취소됨'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    {appointment.status !== 'COMPLETED' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => updateAppointmentStatus(appointment.id, 'COMPLETED')}
                        data-testid={`status-button-${appointment.id}`}
                      >
                        상태 변경
                      </Button>
                    )}
                    {appointment.status !== 'CANCELLED' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => cancelAppointment(appointment.id)}
                        data-testid={`cancel-button-${appointment.id}`}
                      >
                        취소
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
