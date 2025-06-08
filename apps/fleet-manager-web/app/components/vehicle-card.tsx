'use client';

import React from 'react';

import { cn } from '../../lib/utils';

interface VehicleCardProps {
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    status: string;
    plateNumber?: string;
    licensePlate?: string;
    imageUrl?: string;
  };
  className?: string;
  onClick?: () => void;
}

// 상태 타입 정의
type VehicleStatus = 'active' | 'maintenance' | 'inactive' | 'reserved' | 'unavailable';

const statusClasses: Record<VehicleStatus, string> = {
  active: 'bg-green-100 text-green-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-800',
  reserved: 'bg-blue-100 text-blue-800',
  unavailable: 'bg-red-100 text-red-800',
};

// 상태에 따른 표시 텍스트
const getStatusText = (status: string): string => {
  switch (status) {
    case 'active':
      return '운행 중';
    case 'maintenance':
      return '정비 중';
    case 'inactive':
      return '운행 불가';
    case 'reserved':
      return '예약됨';
    case 'unavailable':
      return '이용 불가';
    default:
      return status;
  }
};

// 안전한 상태 클래스 얻기
const getStatusClass = (status: string): string => {
  return statusClasses[status as VehicleStatus] || 'bg-gray-100 text-gray-800';
};

export function VehicleCard({ vehicle, className, onClick }: VehicleCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={cn(
        'cursor-pointer overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${vehicle.make} ${vehicle.model} 차량 상세보기`}
    >
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
        <div
          className={cn(
            'absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-medium',
            getStatusClass(vehicle.status)
          )}
        >
          {getStatusText(vehicle.status)}
        </div>
      </div>
      <div className="p-4">
        <div className="mb-1 text-lg font-bold">
          {vehicle.make} {vehicle.model} ({vehicle.year})
        </div>
        <div className="text-sm text-gray-500">
          차량번호: {vehicle.plateNumber || vehicle.licensePlate || '정보 없음'}
        </div>
      </div>
    </div>
  );
}
