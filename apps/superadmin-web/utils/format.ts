import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 날짜를 지정된 형식으로 포맷팅합니다.
 * @param date - 포맷팅할 날짜
 * @param formatString - 날짜 형식 문자열 (예: 'yyyy-MM-dd', 'HH:mm:ss')
 * @returns 포맷팅된 날짜 문자열
 */
export function formatDate(date: Date | string | number, formatString: string): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    return format(dateObj, formatString, { locale: ko });
  } catch (_) {
    // console.error('날짜 포맷팅 오류:', error);
    return '-';
  }
}

/**
 * 숫자를 한국 형식으로 포맷팅합니다.
 * @param num 포맷팅할 숫자
 * @returns 포맷팅된 숫자 문자열
 */
export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('ko-KR').format(num);
};

/**
 * 금액을 원화 형식으로 포맷팅합니다.
 * @param amount 포맷팅할 금액
 * @returns 포맷팅된 금액 문자열
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
};

/**
 * 시간을 지정된 형식으로 포맷팅합니다.
 * @param date 포맷팅할 날짜/시간
 * @param formatStr 시간 형식 문자열 (기본값: 'HH:mm')
 * @returns 포맷팅된 시간 문자열
 */
export const formatTime = (
  date: Date | string | number | null | undefined,
  formatStr: string = 'HH:mm'
): string => {
  if (!date) return '-';

  try {
    let dateObj: Date;

    if (typeof date === 'string') {
      dateObj = date.includes('T') || date.includes('Z') ? new Date(date) : new Date(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }

    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    return format(dateObj, formatStr, { locale: ko });
  } catch (_) {
    // console.error('시간 포맷팅 오류:', error);
    return '-';
  }
};

/**
 * 날짜와 시간을 함께 포맷팅합니다.
 * @param date 포맷팅할 날짜/시간
 * @param formatStr 날짜시간 형식 문자열 (기본값: 'yyyy-MM-dd HH:mm')
 * @returns 포맷팅된 날짜시간 문자열
 */
export const formatDateTime = (
  date: Date | string | number | null | undefined,
  formatStr: string = 'yyyy-MM-dd HH:mm'
): string => {
  if (!date) return '-';
  return formatDate(date as Date | string | number, formatStr);
};

/**
 * 상대적인 시간을 표시합니다.
 * @param date - 기준 날짜
 * @returns 상대적인 시간 문자열 (예: '2시간 전', '1일 전')
 */
export function getRelativeTime(date: Date | string | number): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return '방금 전';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}분 전`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}시간 전`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}일 전`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months}개월 전`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years}년 전`;
    }
  } catch (_) {
    // console.error('상대적 시간 계산 오류:', error);
    return '-';
  }
}

export const formatDuration = (
  seconds: number | null | undefined,
  includeSeconds = false,
  fallback?: string
): string => {
  if (seconds === null || seconds === undefined) return fallback || '';

  try {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    seconds = Math.floor(seconds % 60);

    if (includeSeconds) {
      return `${hours > 0 ? hours + '시간 ' : ''}${minutes}분 ${seconds}초`;
    }
    return hours === 0 ? seconds + '초' : hours + '시간 ' + minutes + '분';
  } catch (_) {
    // console.error('시간 포맷팅 오류:', error);
    return fallback || '';
  }
};

export const timeAgo = (date: string | Date | null, fallback?: string): string => {
  if (!date) return fallback || '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    // 1분 미만
    if (diffInSeconds < 60) {
      return '방금 전';
    }
    // 1시간 미만
    else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}분 전`;
    }
    // 24시간 미만
    else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}시간 전`;
    }
    // 30일 미만
    else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}일 전`;
    }
    // 그 이상
    else {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      return dateObj.toLocaleDateString('ko-KR', options);
    }
  } catch (_) {
    // console.error('상대적 시간 계산 오류:', error);
    return fallback || '';
  }
};
