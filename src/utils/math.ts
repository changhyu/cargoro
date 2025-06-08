// 수학 유틸리티
export const mathUtils = {
  // 평균 계산
  average: (numbers: number[]): number => {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  },

  // 중앙값 계산
  median: (numbers: number[]): number => {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  },

  // 최빈값 계산
  mode: (numbers: number[]): number[] => {
    if (numbers.length === 0) return [];

    const frequency: Record<number, number> = {};
    let maxFreq = 0;

    numbers.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1;
      maxFreq = Math.max(maxFreq, frequency[num]);
    });

    return Object.entries(frequency)
      .filter(([_, freq]) => freq === maxFreq)
      .map(([num]) => Number(num));
  },

  // 표준편차 계산
  standardDeviation: (numbers: number[]): number => {
    if (numbers.length === 0) return 0;

    const avg = mathUtils.average(numbers);
    const squaredDiffs = numbers.map(num => Math.pow(num - avg, 2));
    const avgSquaredDiff = mathUtils.average(squaredDiffs);

    return Math.sqrt(avgSquaredDiff);
  },

  // 팩토리얼
  factorial: (n: number): number => {
    if (n < 0) throw new Error('음수의 팩토리얼은 정의되지 않습니다');
    if (n === 0 || n === 1) return 1;
    if (n > 170) throw new Error('너무 큰 수입니다');

    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  },

  // 최대공약수
  gcd: (a: number, b: number): number => {
    a = Math.abs(a);
    b = Math.abs(b);

    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  },

  // 최소공배수
  lcm: (a: number, b: number): number => {
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / mathUtils.gcd(a, b);
  },

  // 소수 판별
  isPrime: (n: number): boolean => {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;

    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) {
        return false;
      }
    }
    return true;
  },

  // 피보나치 수열
  fibonacci: (n: number): number => {
    if (n < 0) throw new Error('음수 인덱스는 지원하지 않습니다');
    if (n === 0) return 0;
    if (n === 1) return 1;

    let prev = 0;
    let current = 1;

    for (let i = 2; i <= n; i++) {
      const next = prev + current;
      prev = current;
      current = next;
    }

    return current;
  },

  // 거듭제곱 (효율적인 방법)
  power: (base: number, exponent: number): number => {
    if (exponent === 0) return 1;
    if (exponent < 0) return 1 / mathUtils.power(base, -exponent);

    let result = 1;
    let currentBase = base;
    let currentExp = exponent;

    while (currentExp > 0) {
      if (currentExp % 2 === 1) {
        result *= currentBase;
      }
      currentBase *= currentBase;
      currentExp = Math.floor(currentExp / 2);
    }

    return result;
  },
};
