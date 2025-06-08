/**
 * 차량 관련 유틸리티 함수
 */

import { formatDate, formatMileage, formatStatus } from './format';
import { formatDateToYYYYMMDD } from './type-utils';

// 로깅 유틸리티
const logger = {
  error: (message: string, error?: unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(message, error);
    }
  },
};

/**
 * 차량 종류별 아이콘 매핑
 */
export const getVehicleTypeIcon = (type?: string): string => {
  const typeMap: Record<string, string> = {
    sedan: 'car',
    suv: 'suv',
    van: 'van',
    truck: 'truck',
    bus: 'bus',
  };

  return typeMap[type?.toLowerCase() || ''] || 'car';
};

interface Vehicle {
  id: string;
  lastServiceDate?: string | Date;
  status?: string;
  mileage?: number;
  type?: string;
  [key: string]: string | number | Date | boolean | undefined;
}

interface FormattedVehicle extends Vehicle {
  formattedLastServiceDate: string;
  formattedStatus: string;
  formattedMileage: string;
  statusClass: string;
  typeIcon: string;
}

/**
 * 차량 데이터 모델 필드에 포맷팅 적용
 */
export const formatVehicleData = (vehicle: Vehicle | null): FormattedVehicle | null => {
  if (!vehicle) return null;

  return {
    ...vehicle,
    formattedLastServiceDate: formatDate(vehicle.lastServiceDate?.toString()),
    formattedStatus: formatStatus(vehicle.status),
    formattedMileage: formatMileage(vehicle.mileage),
    statusClass: getStatusClass(vehicle.status),
    typeIcon: getVehicleTypeIcon(vehicle.type),
  };
};

/**
 * 차량 상태에 따른 CSS 클래스 반환
 */
export const getStatusClass = (status?: string): string => {
  const statusMap: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
  };

  return statusMap[status || ''] || 'bg-gray-100 text-gray-800';
};

/**
 * 차량 번호판 유효성 검사
 */
export const isValidLicensePlate = (licensePlate: string): boolean => {
  // 한국 차량 번호판 포맷 확인 (12가 3456, 123가 4567 등)
  const pattern = /^[\d]{2,3}[가-힣]{1}[\s]?[\d]{4}$/;
  return pattern.test(licensePlate);
};

/**
 * VIN(Vehicle Identification Number) 유효성 검사
 */
export const isValidVIN = (vin: string): boolean => {
  // 17자리 영문/숫자 조합
  if (!vin || vin.length !== 17) return false;

  // I, O, Q 문자는 사용되지 않음
  if (/[IOQ]/.test(vin)) return false;

  // 영문자와 숫자만 허용
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
};

/**
 * 차량 연식 제한 확인 (너무 오래된 차량인지)
 */
export const isVehicleTooOld = (year: number, maxAge: number = 15): boolean => {
  const currentYear = new Date().getFullYear();
  return currentYear - year > maxAge;
};

/**
 * 다음 정비 예정일 계산
 */
export const calculateNextServiceDate = (
  lastServiceDate: string,
  serviceIntervalMonths: number = 6
): string => {
  if (!lastServiceDate) return '';

  try {
    const date = new Date(lastServiceDate);
    date.setMonth(date.getMonth() + serviceIntervalMonths);
    return formatDateToYYYYMMDD(date);
  } catch (error) {
    logger.error('다음 정비일 계산 오류:', error);
    return '';
  }
};
