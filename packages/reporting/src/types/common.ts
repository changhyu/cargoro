/**
 * 공통 타입 정의
 */

/**
 * 날짜 범위를 나타내는 타입
 * @cargoro/ui의 Calendar 컴포넌트와 호환되도록 정의
 */
export interface DateRange {
  from?: Date;
  to?: Date;
}

/**
 * 필수 날짜 범위 타입
 */
export interface RequiredDateRange {
  from: Date;
  to: Date;
}

/**
 * 날짜 범위 유틸리티 함수들
 */
export const DateRangeUtils = {
  /**
   * 날짜 범위가 유효한지 확인
   */
  isValid(range?: DateRange): range is RequiredDateRange {
    return Boolean(range?.from && range?.to);
  },

  /**
   * 날짜 범위를 문자열로 포맷
   */
  format(range: DateRange, locale: string = 'ko-KR'): string {
    if (!range.from || !range.to) {
      return '날짜 선택';
    }

    const fromStr = range.from.toLocaleDateString(locale);
    const toStr = range.to.toLocaleDateString(locale);

    return `${fromStr} - ${toStr}`;
  },

  /**
   * 두 날짜 범위가 겹치는지 확인
   */
  overlaps(range1: RequiredDateRange, range2: RequiredDateRange): boolean {
    return range1.from <= range2.to && range1.to >= range2.from;
  },

  /**
   * 날짜 범위의 일수 계산
   */
  getDays(range: RequiredDateRange): number {
    const diffTime = Math.abs(range.to.getTime() - range.from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // 시작일과 종료일 모두 포함
  },
};
