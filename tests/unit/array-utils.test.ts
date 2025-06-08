import { describe, it, expect } from 'vitest';
import { arrayUtils } from '../../src/utils/validators';

describe('arrayUtils 테스트', () => {
  describe('unique', () => {
    it('중복된 요소를 제거해야 함', () => {
      expect(arrayUtils.unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(arrayUtils.unique(['a', 'b', 'b', 'c'])).toEqual(['a', 'b', 'c']);
      expect(arrayUtils.unique([])).toEqual([]);
    });

    it('중복이 없는 배열은 그대로 반환해야 함', () => {
      expect(arrayUtils.unique([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('shuffle', () => {
    it('배열을 섞어야 함', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = arrayUtils.shuffle(original);

      // 원본 배열은 변경되지 않아야 함
      expect(original).toEqual([1, 2, 3, 4, 5]);

      // 섞인 배열은 같은 요소를 가져야 함
      expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);

      // 길이는 같아야 함
      expect(shuffled.length).toBe(original.length);
    });

    it('빈 배열도 처리해야 함', () => {
      expect(arrayUtils.shuffle([])).toEqual([]);
    });
  });

  describe('chunk', () => {
    it('배열을 지정된 크기로 나누어야 함', () => {
      expect(arrayUtils.chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(arrayUtils.chunk([1, 2, 3, 4, 5, 6], 3)).toEqual([
        [1, 2, 3],
        [4, 5, 6],
      ]);
      expect(arrayUtils.chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    });

    it('배열보다 큰 크기로도 처리해야 함', () => {
      expect(arrayUtils.chunk([1, 2, 3], 5)).toEqual([[1, 2, 3]]);
    });

    it('빈 배열도 처리해야 함', () => {
      expect(arrayUtils.chunk([], 3)).toEqual([]);
    });

    it('잘못된 크기에 대해 에러를 던져야 함', () => {
      expect(() => arrayUtils.chunk([1, 2, 3], 0)).toThrow('청크 크기는 0보다 커야 합니다');
      expect(() => arrayUtils.chunk([1, 2, 3], -1)).toThrow('청크 크기는 0보다 커야 합니다');
    });
  });

  describe('groupBy', () => {
    it('키 함수에 따라 그룹화해야 함', () => {
      const users = [
        { name: '홍길동', age: 20 },
        { name: '김철수', age: 20 },
        { name: '이영희', age: 30 },
      ];

      const grouped = arrayUtils.groupBy(users, user => user.age);

      expect(grouped).toEqual({
        20: [
          { name: '홍길동', age: 20 },
          { name: '김철수', age: 20 },
        ],
        30: [{ name: '이영희', age: 30 }],
      });
    });

    it('빈 배열도 처리해야 함', () => {
      expect(arrayUtils.groupBy([], (x: any) => x.key)).toEqual({});
    });
  });

  describe('intersection', () => {
    it('두 배열의 교집합을 반환해야 함', () => {
      expect(arrayUtils.intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
      expect(arrayUtils.intersection(['a', 'b', 'c'], ['b', 'c', 'd'])).toEqual(['b', 'c']);
    });

    it('교집합이 없으면 빈 배열을 반환해야 함', () => {
      expect(arrayUtils.intersection([1, 2, 3], [4, 5, 6])).toEqual([]);
    });

    it('빈 배열도 처리해야 함', () => {
      expect(arrayUtils.intersection([], [1, 2, 3])).toEqual([]);
      expect(arrayUtils.intersection([1, 2, 3], [])).toEqual([]);
    });
  });

  describe('difference', () => {
    it('두 배열의 차집합을 반환해야 함', () => {
      expect(arrayUtils.difference([1, 2, 3], [2, 3, 4])).toEqual([1]);
      expect(arrayUtils.difference(['a', 'b', 'c'], ['b', 'c', 'd'])).toEqual(['a']);
    });

    it('두 번째 배열이 첫 번째 배열을 포함하면 빈 배열을 반환해야 함', () => {
      expect(arrayUtils.difference([1, 2], [1, 2, 3])).toEqual([]);
    });

    it('빈 배열도 처리해야 함', () => {
      expect(arrayUtils.difference([], [1, 2, 3])).toEqual([]);
      expect(arrayUtils.difference([1, 2, 3], [])).toEqual([1, 2, 3]);
    });
  });
});
