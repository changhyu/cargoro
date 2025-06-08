/**
 * 날짜 관련 유틸리티 함수
 * 정비소 앱에서 자주 사용되는 날짜 포맷팅 및 계산 기능을 제공합니다.
 */

import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';

// 한국어 로케일 설정 및 플러그인 적용
dayjs.locale('ko');
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷팅합니다.
 * @param date 포맷팅할 날짜 또는 날짜 문자열
 * @param format 사용할 포맷 (기본값: YYYY-MM-DD)
 * @returns 포맷팅된 날짜 문자열
 */
export function formatDate(date: Date | string, format = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format);
}

/**
 * 날짜와 시간을 YYYY-MM-DD HH:mm 형식으로 포맷팅합니다.
 * @param dateTime 포맷팅할 날짜와 시간
 * @param format 사용할 포맷 (기본값: YYYY-MM-DD HH:mm)
 * @returns 포맷팅된 날짜와 시간 문자열
 */
export function formatDateTime(dateTime: Date | string, format = 'YYYY-MM-DD HH:mm'): string {
  return dayjs(dateTime).format(format);
}

/**
 * 시간을 HH:mm 형식으로 포맷팅합니다.
 * @param time 포맷팅할 시간
 * @param format 사용할 포맷 (기본값: HH:mm)
 * @returns 포맷팅된 시간 문자열
 */
export function formatTime(time: Date | string, format = 'HH:mm'): string {
  // 시간 문자열만 있는 경우 (HH:mm:ss) 날짜를 추가하여 처리
  if (typeof time === 'string' && time.match(/^\d{1,2}:\d{1,2}(:\d{1,2})?$/)) {
    const today = new Date().toISOString().split('T')[0];
    return dayjs(`${today}T${time}`).format(format);
  }
  return dayjs(time).format(format);
}

/**
 * 날짜가 과거인지 확인합니다.
 * @param date 확인할 날짜
 * @returns 과거 날짜면 true, 아니면 false
 */
export function isDateInPast(date: Date): boolean {
  return dayjs(date).isBefore(dayjs(), 'day');
}

/**
 * 날짜가 오늘인지 확인합니다.
 * @param date 확인할 날짜
 * @returns 오늘이면 true, 아니면 false
 */
export function isDateToday(date: Date): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

/**
 * 날짜에 일수를 더합니다.
 * @param date 기준 날짜
 * @param days 더할 일수 (음수도 가능)
 * @returns 계산된 새 날짜
 */
export function addDays(date: Date, days: number): Date {
  return dayjs(date).add(days, 'day').toDate();
}

/**
 * 두 날짜 간의 일수 차이를 계산합니다.
 * @param date1 첫 번째 날짜
 * @param date2 두 번째 날짜
 * @returns 일수 차이 (양수: date1이 먼저, 음수: date2가 먼저)
 */
export function dateDiffInDays(date1: Date, date2: Date): number {
  const a = dayjs(date1);
  const b = dayjs(date2);
  return b.diff(a, 'day');
}

/**
 * 날짜를 로케일 기반으로 포맷팅합니다.
 * @param date 포맷팅할 날짜
 * @param options Intl.DateTimeFormat 옵션
 * @returns 로케일 기반으로 포맷팅된 날짜 문자열
 */
export function formatDateLocale(date: Date, options?: Intl.DateTimeFormatOptions): string {
  options = options || {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat('ko-KR', options).format(date);
}

/**
 * 날짜를 상대적 시간으로 포맷팅합니다 (예: "3일 전", "방금 전").
 * @param date 포맷팅할 날짜
 * @returns 상대적 시간 문자열
 */
export function formatRelativeTime(date: Date): string {
  const now = dayjs();
  const diff = now.diff(date, 'second');

  if (diff < 60) {
    return '방금 전';
  } else if (diff < 60 * 60) {
    const minutes = Math.floor(diff / 60);
    return `${minutes}분 전`;
  } else if (diff < 60 * 60 * 24) {
    const hours = Math.floor(diff / (60 * 60));
    return `${hours}시간 전`;
  } else {
    const days = Math.floor(diff / (60 * 60 * 24));
    return `${days}일 전`;
  }
}
