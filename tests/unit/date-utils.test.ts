import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dateUtils } from '../../src/utils/string-date';

describe('dateUtils 테스트', () => {
  describe('daysBetween', () => {
    it('두 날짜 사이의 일수를 계산해야 함', () => {
      const date1 = new Date('2025-01-01');
      const date2 = new Date('2025-01-10');
      expect(dateUtils.daysBetween(date1, date2)).toBe(9);
    });

    it('순서와 관계없이 절대값을 반환해야 함', () => {
      const date1 = new Date('2025-01-10');
      const date2 = new Date('2025-01-01');
      expect(dateUtils.daysBetween(date1, date2)).toBe(9);
    });

    it('같은 날짜는 0을 반환해야 함', () => {
      const date = new Date('2025-01-01');
      expect(dateUtils.daysBetween(date, date)).toBe(0);
    });
  });

  describe('addDays', () => {
    it('날짜에 일수를 더해야 함', () => {
      const date = new Date('2025-01-01');
      const result = dateUtils.addDays(date, 5);
      expect(result.toISOString().split('T')[0]).toBe('2025-01-06');
    });

    it('음수 일수를 빼야 함', () => {
      const date = new Date('2025-01-10');
      const result = dateUtils.addDays(date, -5);
      expect(result.toISOString().split('T')[0]).toBe('2025-01-05');
    });

    it('원본 날짜는 변경하지 않아야 함', () => {
      const date = new Date('2025-01-01');
      const original = date.getTime();
      dateUtils.addDays(date, 5);
      expect(date.getTime()).toBe(original);
    });
  });

  describe('addMonths', () => {
    it('날짜에 월을 더해야 함', () => {
      const date = new Date('2025-01-15');
      const result = dateUtils.addMonths(date, 2);
      expect(result.toISOString().split('T')[0]).toBe('2025-03-15');
    });

    it('연도를 넘어가야 함', () => {
      const date = new Date('2025-11-15');
      const result = dateUtils.addMonths(date, 3);
      expect(result.toISOString().split('T')[0]).toBe('2026-02-15');
    });

    it('월말 처리를 해야 함', () => {
      const date = new Date('2025-01-31');
      const result = dateUtils.addMonths(date, 1);
      // 2월은 28일까지만 있으므로
      expect(result.getMonth()).toBe(2); // 3월 (0부터 시작)
    });
  });

  describe('addYears', () => {
    it('날짜에 연도를 더해야 함', () => {
      const date = new Date('2025-06-15');
      const result = dateUtils.addYears(date, 5);
      expect(result.toISOString().split('T')[0]).toBe('2030-06-15');
    });

    it('음수 연도를 빼야 함', () => {
      const date = new Date('2025-06-15');
      const result = dateUtils.addYears(date, -10);
      expect(result.toISOString().split('T')[0]).toBe('2015-06-15');
    });

    it('윤년 처리를 해야 함', () => {
      const date = new Date('2024-02-29');
      const result = dateUtils.addYears(date, 1);
      // 2025년은 윤년이 아니므로 3월 1일이 됨
      expect(result.toISOString().split('T')[0]).toBe('2025-03-01');
    });
  });

  describe('isWeekend', () => {
    it('주말을 판별해야 함', () => {
      const saturday = new Date('2025-01-04'); // 토요일
      const sunday = new Date('2025-01-05'); // 일요일
      expect(dateUtils.isWeekend(saturday)).toBe(true);
      expect(dateUtils.isWeekend(sunday)).toBe(true);
    });

    it('평일을 판별해야 함', () => {
      const monday = new Date('2025-01-06');
      const friday = new Date('2025-01-10');
      expect(dateUtils.isWeekend(monday)).toBe(false);
      expect(dateUtils.isWeekend(friday)).toBe(false);
    });
  });

  describe('isToday', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('오늘 날짜를 판별해야 함', () => {
      const mockDate = new Date('2025-06-07T10:00:00');
      vi.setSystemTime(mockDate);

      const today = new Date('2025-06-07T15:30:00');
      const notToday = new Date('2025-06-08T10:00:00');

      expect(dateUtils.isToday(today)).toBe(true);
      expect(dateUtils.isToday(notToday)).toBe(false);
    });
  });

  describe('format', () => {
    it('날짜를 지정된 형식으로 포맷팅해야 함', () => {
      const date = new Date('2025-06-07T14:30:45');

      expect(dateUtils.format(date, 'YYYY-MM-DD')).toBe('2025-06-07');
      expect(dateUtils.format(date, 'YYYY/MM/DD HH:mm:ss')).toBe('2025/06/07 14:30:45');
      expect(dateUtils.format(date, 'DD-MM-YYYY')).toBe('07-06-2025');
    });

    it('한 자리 숫자도 0으로 패딩해야 함', () => {
      const date = new Date('2025-01-05T09:05:08');
      expect(dateUtils.format(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2025-01-05 09:05:08');
    });
  });

  describe('getRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-06-07T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('상대적 시간을 표시해야 함', () => {
      expect(dateUtils.getRelativeTime(new Date('2025-06-07T11:59:30'))).toBe('방금 전');
      expect(dateUtils.getRelativeTime(new Date('2025-06-07T11:30:00'))).toBe('30분 전');
      expect(dateUtils.getRelativeTime(new Date('2025-06-07T09:00:00'))).toBe('3시간 전');
      expect(dateUtils.getRelativeTime(new Date('2025-06-05T12:00:00'))).toBe('2일 전');
      expect(dateUtils.getRelativeTime(new Date('2025-04-07T12:00:00'))).toBe('2개월 전');
      expect(dateUtils.getRelativeTime(new Date('2023-06-07T12:00:00'))).toBe('2년 전');
    });
  });
});
