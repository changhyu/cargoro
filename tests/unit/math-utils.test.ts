import { describe, it, expect } from 'vitest';
import { mathUtils } from '../../src/utils/math';

describe('mathUtils 테스트', () => {
  describe('average', () => {
    it('숫자 배열의 평균을 계산해야 함', () => {
      expect(mathUtils.average([1, 2, 3, 4, 5])).toBe(3);
      expect(mathUtils.average([10, 20, 30])).toBe(20);
      expect(mathUtils.average([0])).toBe(0);
      expect(mathUtils.average([-5, 5])).toBe(0);
    });

    it('빈 배열은 0을 반환해야 함', () => {
      expect(mathUtils.average([])).toBe(0);
    });

    it('소수점도 올바르게 처리해야 함', () => {
      expect(mathUtils.average([1.5, 2.5, 3.5])).toBeCloseTo(2.5);
    });
  });

  describe('median', () => {
    it('홀수 개수의 중앙값을 계산해야 함', () => {
      expect(mathUtils.median([1, 2, 3, 4, 5])).toBe(3);
      expect(mathUtils.median([5, 2, 1, 4, 3])).toBe(3); // 정렬 후
      expect(mathUtils.median([7])).toBe(7);
    });

    it('짝수 개수의 중앙값을 계산해야 함', () => {
      expect(mathUtils.median([1, 2, 3, 4])).toBe(2.5);
      expect(mathUtils.median([10, 20, 30, 40])).toBe(25);
    });

    it('빈 배열은 0을 반환해야 함', () => {
      expect(mathUtils.median([])).toBe(0);
    });
  });

  describe('mode', () => {
    it('최빈값을 찾아야 함', () => {
      expect(mathUtils.mode([1, 2, 2, 3, 3, 3])).toEqual([3]);
      expect(mathUtils.mode([1, 1, 2, 2])).toEqual([1, 2]); // 여러 개
      expect(mathUtils.mode([1, 2, 3])).toEqual([1, 2, 3]); // 모두 같은 빈도
    });

    it('빈 배열은 빈 배열을 반환해야 함', () => {
      expect(mathUtils.mode([])).toEqual([]);
    });
  });

  describe('standardDeviation', () => {
    it('표준편차를 계산해야 함', () => {
      expect(mathUtils.standardDeviation([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2);
      expect(mathUtils.standardDeviation([10, 10, 10])).toBe(0); // 모두 같음
    });

    it('빈 배열은 0을 반환해야 함', () => {
      expect(mathUtils.standardDeviation([])).toBe(0);
    });
  });

  describe('factorial', () => {
    it('팩토리얼을 계산해야 함', () => {
      expect(mathUtils.factorial(0)).toBe(1);
      expect(mathUtils.factorial(1)).toBe(1);
      expect(mathUtils.factorial(5)).toBe(120);
      expect(mathUtils.factorial(10)).toBe(3628800);
    });

    it('음수는 에러를 던져야 함', () => {
      expect(() => mathUtils.factorial(-1)).toThrow('음수의 팩토리얼은 정의되지 않습니다');
    });

    it('너무 큰 수는 에러를 던져야 함', () => {
      expect(() => mathUtils.factorial(171)).toThrow('너무 큰 수입니다');
    });
  });

  describe('gcd', () => {
    it('최대공약수를 계산해야 함', () => {
      expect(mathUtils.gcd(12, 8)).toBe(4);
      expect(mathUtils.gcd(17, 19)).toBe(1); // 서로소
      expect(mathUtils.gcd(100, 50)).toBe(50);
    });

    it('음수도 처리해야 함', () => {
      expect(mathUtils.gcd(-12, 8)).toBe(4);
      expect(mathUtils.gcd(12, -8)).toBe(4);
      expect(mathUtils.gcd(-12, -8)).toBe(4);
    });

    it('0을 처리해야 함', () => {
      expect(mathUtils.gcd(0, 5)).toBe(5);
      expect(mathUtils.gcd(5, 0)).toBe(5);
    });
  });

  describe('lcm', () => {
    it('최소공배수를 계산해야 함', () => {
      expect(mathUtils.lcm(4, 6)).toBe(12);
      expect(mathUtils.lcm(3, 5)).toBe(15);
      expect(mathUtils.lcm(12, 8)).toBe(24);
    });

    it('0이 포함되면 0을 반환해야 함', () => {
      expect(mathUtils.lcm(0, 5)).toBe(0);
      expect(mathUtils.lcm(5, 0)).toBe(0);
    });
  });

  describe('isPrime', () => {
    it('소수를 판별해야 함', () => {
      expect(mathUtils.isPrime(2)).toBe(true);
      expect(mathUtils.isPrime(3)).toBe(true);
      expect(mathUtils.isPrime(5)).toBe(true);
      expect(mathUtils.isPrime(7)).toBe(true);
      expect(mathUtils.isPrime(11)).toBe(true);
      expect(mathUtils.isPrime(97)).toBe(true);
    });

    it('소수가 아닌 수를 판별해야 함', () => {
      expect(mathUtils.isPrime(1)).toBe(false);
      expect(mathUtils.isPrime(4)).toBe(false);
      expect(mathUtils.isPrime(6)).toBe(false);
      expect(mathUtils.isPrime(9)).toBe(false);
      expect(mathUtils.isPrime(100)).toBe(false);
    });

    it('음수와 0은 소수가 아님', () => {
      expect(mathUtils.isPrime(0)).toBe(false);
      expect(mathUtils.isPrime(-1)).toBe(false);
      expect(mathUtils.isPrime(-7)).toBe(false);
    });
  });

  describe('fibonacci', () => {
    it('피보나치 수를 계산해야 함', () => {
      expect(mathUtils.fibonacci(0)).toBe(0);
      expect(mathUtils.fibonacci(1)).toBe(1);
      expect(mathUtils.fibonacci(2)).toBe(1);
      expect(mathUtils.fibonacci(3)).toBe(2);
      expect(mathUtils.fibonacci(4)).toBe(3);
      expect(mathUtils.fibonacci(5)).toBe(5);
      expect(mathUtils.fibonacci(10)).toBe(55);
    });

    it('음수는 에러를 던져야 함', () => {
      expect(() => mathUtils.fibonacci(-1)).toThrow('음수 인덱스는 지원하지 않습니다');
    });
  });

  describe('power', () => {
    it('거듭제곱을 계산해야 함', () => {
      expect(mathUtils.power(2, 3)).toBe(8);
      expect(mathUtils.power(5, 2)).toBe(25);
      expect(mathUtils.power(10, 0)).toBe(1);
      expect(mathUtils.power(2, 10)).toBe(1024);
    });

    it('음수 지수를 처리해야 함', () => {
      expect(mathUtils.power(2, -1)).toBe(0.5);
      expect(mathUtils.power(4, -2)).toBe(0.0625);
    });

    it('1의 거듭제곱은 항상 1', () => {
      expect(mathUtils.power(1, 100)).toBe(1);
      expect(mathUtils.power(1, -100)).toBe(1);
    });
  });
});
