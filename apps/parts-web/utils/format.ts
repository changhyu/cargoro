import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 날짜를 지정된 형식으로 포맷팅합니다.
 * @param date - 포맷팅할 날짜
 * @param formatString - 날짜 형식 문자열 (예: 'yyyy-MM-dd', 'HH:mm:ss')
 * @returns 포맷팅된 날짜 문자열
 */
export function formatDate(
  date: Date | string | number,
  formatString: string = 'yyyy-MM-dd'
): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    return format(dateObj, formatString, { locale: ko });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
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
