'use client';

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ReservationStatus, ReservationStatusType } from '@cargoro/types/schema/reservation';

// 차량 목록 조회를 위한 모의 데이터 (API 연동 후 제거 예정)
const mockVehicles = [
  {
    id: 'v1',
    licensePlate: '서울 123가 4567',
    plateNumber: '서울 123가 4567', // 호환성을 위해 추가
    make: '현대',
    model: '팰리세이드',
    status: 'available',
  },
  {
    id: 'v2',
    licensePlate: '서울 456나 7890',
    plateNumber: '서울 456나 7890', // 호환성을 위해 추가
    make: '기아',
    model: 'K9',
    status: 'available',
  },
  {
    id: 'v3',
    licensePlate: '서울 789다 1234',
    plateNumber: '서울 789다 1234', // 호환성을 위해 추가
    make: '쌍용',
    model: '렉스턴',
    status: 'maintenance',
  },
  {
    id: 'v4',
    licensePlate: '서울 987라 6543',
    plateNumber: '서울 987라 6543', // 호환성을 위해 추가
    make: '르노',
    model: 'SM6',
    status: 'available',
  },
];

// 예약 목적 선택 옵션
const purposeOptions = [
  { value: '업무용', label: '업무용' },
  { value: '출장', label: '출장' },
  { value: '물류 운송', label: '물류 운송' },
  { value: '고객 미팅', label: '고객 미팅' },
  { value: '견학', label: '견학' },
  { value: '기타', label: '기타' },
];

// 예약 폼 검증 스키마
const reservationSchema = z.object({
  vehicleId: z.string().min(1, '차량을 선택해주세요'),
  customerName: z.string().min(2, '고객명은 최소 2자 이상 입력해주세요'),
  customerPhone: z
    .string()
    .min(10, '연락처를 정확히 입력해주세요')
    .regex(/^[0-9-]+$/, '숫자와 하이픈(-)만 사용할 수 있습니다'),
  startDate: z.string().min(1, '시작 날짜를 선택해주세요'),
  startTime: z.string().min(1, '시작 시간을 선택해주세요'),
  endDate: z.string().min(1, '종료 날짜를 선택해주세요'),
  endTime: z.string().min(1, '종료 시간을 선택해주세요'),
  purpose: z.string().min(1, '예약 목적을 선택해주세요'),
  notes: z.string().optional(),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

interface ReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    vehicleId: string;
    vehicleLicensePlate: string;
    customerName: string;
    customerPhone: string;
    startDate: string;
    endDate: string;
    status: ReservationStatusType;
    purpose: string;
    notes?: string;
  }) => void;
}

export default function ReservationForm({ isOpen, onClose, onSubmit }: ReservationFormProps) {
  const [availableVehicles, setAvailableVehicles] = useState(mockVehicles);
  const [selectedVehicle, setSelectedVehicle] = useState<(typeof mockVehicles)[0] | null>(null);
  const [showOtherPurpose, setShowOtherPurpose] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      vehicleId: '',
      customerName: '',
      customerPhone: '',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endDate: new Date().toISOString().split('T')[0],
      endTime: '18:00',
      purpose: '',
      notes: '',
    },
  });

  const purpose = watch('purpose');

  // 차량 ID 변경 시 선택된 차량 정보 업데이트
  const vehicleId = watch('vehicleId');
  useEffect(() => {
    if (vehicleId) {
      const vehicle = availableVehicles.find(v => v.id === vehicleId) || null;
      setSelectedVehicle(vehicle);
    } else {
      setSelectedVehicle(null);
    }
  }, [vehicleId, availableVehicles]);

  // 기타 목적 선택 시 입력 필드 표시
  useEffect(() => {
    setShowOtherPurpose(purpose === '기타');
  }, [purpose]);

  // 폼 제출 핸들러
  const processSubmit = (data: ReservationFormData) => {
    // 날짜와 시간 합치기
    const startDateTime = `${data.startDate}T${data.startTime}:00`;
    const endDateTime = `${data.endDate}T${data.endTime}:00`;

    // 선택된 차량의 번호판 정보 가져오기
    const vehicleLicensePlate = selectedVehicle?.licensePlate || '';

    // 폼 데이터로 예약 객체 생성하여 제출
    onSubmit({
      vehicleId: data.vehicleId,
      vehicleLicensePlate,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      startDate: startDateTime,
      endDate: endDateTime,
      status: ReservationStatus.PENDING, // 기본 상태: 대기 중
      purpose: data.purpose,
      notes: data.notes,
    });

    // 폼 초기화 및 모달 닫기
    reset();
    onClose();
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75 p-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">닫기</span>
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="mb-6 text-xl font-bold text-gray-900">새 예약 등록</h2>

        <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
          {/* 차량 선택 */}
          <div className="space-y-1">
            <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700">
              차량 선택 <span className="text-red-500">*</span>
            </label>
            <select
              id="vehicleId"
              {...register('vehicleId')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">차량을 선택하세요</option>
              {availableVehicles
                .filter(v => v.status === 'available')
                .map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.licensePlate} - {vehicle.make} {vehicle.model}
                  </option>
                ))}
            </select>
            {errors.vehicleId && (
              <p className="mt-1 text-xs text-red-500">{errors.vehicleId.message}</p>
            )}
          </div>

          {/* 고객 정보 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
                고객명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customerName"
                {...register('customerName')}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.customerName && (
                <p className="mt-1 text-xs text-red-500">{errors.customerName.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">
                연락처 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customerPhone"
                placeholder="010-1234-5678"
                {...register('customerPhone')}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.customerPhone && (
                <p className="mt-1 text-xs text-red-500">{errors.customerPhone.message}</p>
              )}
            </div>
          </div>

          {/* 예약 일정 */}
          <div className="space-y-3">
            <h3 className="text-md font-medium text-gray-900">예약 일정</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  시작 날짜 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  {...register('startDate')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.startDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  시작 시간 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="startTime"
                  {...register('startTime')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.startTime && (
                  <p className="mt-1 text-xs text-red-500">{errors.startTime.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  종료 날짜 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  {...register('endDate')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.endDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.endDate.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  종료 시간 <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="endTime"
                  {...register('endTime')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.endTime && (
                  <p className="mt-1 text-xs text-red-500">{errors.endTime.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* 예약 목적 */}
          <div className="space-y-1">
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
              예약 목적 <span className="text-red-500">*</span>
            </label>
            <select
              id="purpose"
              {...register('purpose')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">예약 목적을 선택하세요</option>
              {purposeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.purpose && (
              <p className="mt-1 text-xs text-red-500">{errors.purpose.message}</p>
            )}

            {showOtherPurpose && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="기타 목적을 입력하세요"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  onChange={e => setValue('purpose', e.target.value)}
                />
              </div>
            )}
          </div>

          {/* 메모 */}
          <div className="space-y-1">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              메모 (선택사항)
            </label>
            <textarea
              id="notes"
              rows={3}
              {...register('notes')}
              placeholder="추가 정보를 입력하세요"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isSubmitting ? '처리 중...' : '예약 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
