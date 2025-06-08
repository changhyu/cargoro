import { describe, it, expect } from 'vitest';
import { objectUtils } from '../../src/utils/validators';

describe('objectUtils 테스트', () => {
  describe('deepClone', () => {
    it('원시 타입을 복사해야 함', () => {
      expect(objectUtils.deepClone(42)).toBe(42);
      expect(objectUtils.deepClone('hello')).toBe('hello');
      expect(objectUtils.deepClone(true)).toBe(true);
      expect(objectUtils.deepClone(null)).toBe(null);
    });

    it('날짜 객체를 복사해야 함', () => {
      const date = new Date('2025-01-01');
      const cloned = objectUtils.deepClone(date);

      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date); // 다른 인스턴스여야 함
      expect(cloned.getTime()).toBe(date.getTime());
    });

    it('배열을 깊은 복사해야 함', () => {
      const arr = [1, [2, 3], { a: 4 }];
      const cloned = objectUtils.deepClone(arr);

      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[1]).not.toBe(arr[1]);
      expect(cloned[2]).not.toBe(arr[2]);
    });

    it('객체를 깊은 복사해야 함', () => {
      const obj = {
        a: 1,
        b: { c: 2, d: [3, 4] },
        e: new Date('2025-01-01'),
      };
      const cloned = objectUtils.deepClone(obj);

      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
      expect(cloned.b.d).not.toBe(obj.b.d);
      expect(cloned.e).not.toBe(obj.e);
    });
  });

  describe('deepMerge', () => {
    it('단순 객체를 병합해야 함', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const result = objectUtils.deepMerge(target, source);

      expect(result).toEqual({ a: 1, b: 3, c: 4 });
      expect(result).toBe(target); // target을 수정함
    });

    it('중첩된 객체를 병합해야 함', () => {
      const target = { a: { b: 1, c: 2 } };
      const source = { a: { c: 3, d: 4 } };
      const result = objectUtils.deepMerge(target, source);

      expect(result).toEqual({ a: { b: 1, c: 3, d: 4 } });
    });

    it('여러 소스를 병합해야 함', () => {
      const target = { a: 1 };
      const source1 = { b: 2 };
      const source2 = { c: 3 };
      const result = objectUtils.deepMerge(target, source1, source2);

      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('배열은 덮어써야 함', () => {
      const target = { arr: [1, 2] };
      const source = { arr: [3, 4, 5] };
      const result = objectUtils.deepMerge(target, source);

      expect(result).toEqual({ arr: [3, 4, 5] });
    });

    it('소스가 없으면 타겟을 반환해야 함', () => {
      const target = { a: 1 };
      const result = objectUtils.deepMerge(target);

      expect(result).toBe(target);
    });
  });

  describe('pick', () => {
    it('지정된 키만 선택해야 함', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = objectUtils.pick(obj, ['a', 'c']);

      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('존재하지 않는 키는 무시해야 함', () => {
      const obj = { a: 1, b: 2 };
      const result = objectUtils.pick(obj, ['a', 'c' as keyof typeof obj]);

      expect(result).toEqual({ a: 1 });
    });

    it('빈 키 배열은 빈 객체를 반환해야 함', () => {
      const obj = { a: 1, b: 2 };
      const result = objectUtils.pick(obj, []);

      expect(result).toEqual({});
    });
  });

  describe('omit', () => {
    it('지정된 키를 제외해야 함', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = objectUtils.omit(obj, ['b', 'd']);

      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('존재하지 않는 키는 무시해야 함', () => {
      const obj = { a: 1, b: 2 };
      const result = objectUtils.omit(obj, ['c' as keyof typeof obj]);

      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('빈 키 배열은 전체 객체를 반환해야 함', () => {
      const obj = { a: 1, b: 2 };
      const result = objectUtils.omit(obj, []);

      expect(result).toEqual({ a: 1, b: 2 });
      expect(result).not.toBe(obj); // 새로운 객체여야 함
    });
  });
});
