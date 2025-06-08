import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDate, debounce, parseQueryString } from '../../src/utils';

// 테스트 스위트
describe('유틸리티 함수 테스트', () => {
  describe('formatDate', () => {
    it('날짜를 한국 형식으로 포맷팅해야 함', () => {
      const date = new Date('2025-06-07');
      const formatted = formatDate(date);
      expect(formatted).toBe('2025. 06. 07.');
    });

    it('유효하지 않은 날짜 처리', () => {
      const invalidDate = new Date('invalid');
      const formatted = formatDate(invalidDate);
      expect(formatted).toBe('Invalid Date');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('지정된 시간 후에 함수를 호출해야 함', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn('test');
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);
      expect(mockFn).toHaveBeenCalledWith('test');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('연속 호출 시 마지막 호출만 실행되어야 함', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn('first');
      vi.advanceTimersByTime(100);
      debouncedFn('second');
      vi.advanceTimersByTime(100);
      debouncedFn('third');

      vi.advanceTimersByTime(300);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('third');
    });
  });

  describe('parseQueryString', () => {
    it('쿼리 문자열을 객체로 파싱해야 함', () => {
      const queryString = 'name=홍길동&age=30&city=서울';
      const result = parseQueryString(queryString);

      expect(result).toEqual({
        name: '홍길동',
        age: '30',
        city: '서울',
      });
    });

    it('빈 쿼리 문자열 처리', () => {
      const result = parseQueryString('');
      expect(result).toEqual({});
    });

    it('특수 문자가 포함된 쿼리 처리', () => {
      const queryString = 'email=test%40example.com&redirect=%2Fhome';
      const result = parseQueryString(queryString);

      expect(result).toEqual({
        email: 'test@example.com',
        redirect: '/home',
      });
    });

    it('중복 키 처리 (마지막 값 사용)', () => {
      const queryString = 'key=value1&key=value2';
      const result = parseQueryString(queryString);

      expect(result).toEqual({
        key: 'value2',
      });
    });
  });
});
