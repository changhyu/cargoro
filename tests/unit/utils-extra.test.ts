import { describe, it, expect } from 'vitest';
import { formatNumber, truncate } from '../../src/utils';

describe('추가 유틸리티 함수 테스트', () => {
  describe('formatNumber', () => {
    it('숫자를 한국 형식으로 포맷팅해야 함', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(123456789)).toBe('123,456,789');
    });

    it('소수점도 올바르게 처리해야 함', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56');
      expect(formatNumber(0.123)).toBe('0.123');
    });

    it('음수도 올바르게 처리해야 함', () => {
      expect(formatNumber(-1000)).toBe('-1,000');
      expect(formatNumber(-123456.789)).toBe('-123,456.789');
    });
  });

  describe('truncate', () => {
    it('짧은 문자열은 그대로 반환해야 함', () => {
      expect(truncate('안녕', 10)).toBe('안녕');
      expect(truncate('Hello', 10)).toBe('Hello');
    });

    it('긴 문자열은 잘라내고 ... 을 추가해야 함', () => {
      expect(truncate('안녕하세요 반갑습니다', 5)).toBe('안녕하세요...');
      expect(truncate('Hello World', 5)).toBe('Hello...');
    });

    it('정확히 길이와 같은 문자열은 그대로 반환해야 함', () => {
      expect(truncate('12345', 5)).toBe('12345');
      expect(truncate('가나다라마', 5)).toBe('가나다라마');
    });

    it('빈 문자열도 처리해야 함', () => {
      expect(truncate('', 10)).toBe('');
    });
  });
});
