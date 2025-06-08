// Basic format utilities for workshop-web app

// 로깅 유틸리티
const logger = {
  error: (message: string, error?: unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(message, error);
    }
  },
};

export const formatDate = (
  dateString?: string | null,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);

    // 유효하지 않은 날짜인 경우
    if (isNaN(date.getTime())) {
      logger.error('유효하지 않은 날짜 형식:', dateString);
      return '-';
    }

    // 기본 옵션
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    // 옵션 병합
    const mergedOptions = { ...defaultOptions, ...options };

    return date.toLocaleDateString('ko-KR', mergedOptions);
  } catch (error) {
    logger.error('날짜 형식 변환 오류:', error);
    return '-';
  }
};

export const formatNumber = (value: number): string => {
  try {
    return new Intl.NumberFormat('ko-KR').format(value);
  } catch (error) {
    logger.error('숫자 포맷 오류:', error);
    return value.toString();
  }
};

export const formatCurrency = (value: number, currency: string = 'KRW'): string => {
  try {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch (error) {
    logger.error('통화 포맷 오류:', error);
    return `${value} ${currency}`;
  }
};

export const formatTime = (date: Date | string | number | null): string => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return '-';

  return formatDate(dateString, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 전화번호를 포맷합니다.
 * @param phoneNumber 포맷할 전화번호 문자열
 * @returns 포맷된 전화번호 문자열
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';

  // 숫자만 추출
  const numbers = phoneNumber.replace(/[^\d]/g, '');

  // 한국 전화번호 형식으로 포맷 (010-1234-5678)
  if (numbers.length === 11 && numbers.startsWith('010')) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  }

  // 다른 형태의 전화번호는 원래 형식 유지
  return phoneNumber;
};

/**
 * ISO 형식 날짜 문자열을 간단한 형식으로 변환 (년월일)
 * @param dateString ISO 형식 날짜 문자열 (예: "2023-05-15T09:00:00Z")
 * @returns 형식화된 간단한 날짜 문자열 (예: "2023.05.15")
 */
export const formatDateShort = (dateString?: string | null): string => {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);

    // 유효하지 않은 날짜인 경우
    if (isNaN(date.getTime())) {
      return '-';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}.${month}.${day}`;
  } catch (error) {
    return '-';
  }
};

/**
 * 상대적 시간 표시 (예: '3일 전', '방금 전')
 * @param dateString ISO 형식 날짜 문자열
 * @returns 상대적 시간 문자열
 */
export const formatRelativeTime = (dateString?: string | null): string => {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);
    const now = new Date();

    // 유효하지 않은 날짜인 경우
    if (isNaN(date.getTime())) {
      return '-';
    }

    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffMonth / 12);

    if (diffSec < 60) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay < 30) return `${diffDay}일 전`;
    if (diffMonth < 12) return `${diffMonth}개월 전`;
    return `${diffYear}년 전`;
  } catch (error) {
    return '-';
  }
};

/**
 * 차량 상태를 포맷팅합니다.
 * @param status 차량 상태 문자열 ('active', 'inactive', 'maintenance')
 * @returns 포맷된 상태 문자열
 */
export const formatStatus = (status?: string | null): string => {
  if (!status) return '-';

  const statusMap: Record<string, string> = {
    active: '운행 중',
    inactive: '미운행',
    maintenance: '정비 중',
  };

  return statusMap[status] || status;
};

/**
 * 주행거리를 포맷팅합니다.
 * @param mileage 주행거리 (km)
 * @returns 포맷된 주행거리 문자열
 */
export const formatMileage = (mileage?: number | null): string => {
  if (mileage === undefined || mileage === null) return '-';

  try {
    return `${new Intl.NumberFormat('ko-KR').format(mileage)} km`;
  } catch (error) {
    logger.error('주행거리 포맷 오류:', error);
    return `${mileage} km`;
  }
};
