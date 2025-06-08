/**
 * Vitest 전역 타입 정의
 */

// 전역 객체 확장
declare global {
  var mockDataByKey: {
    repairs: any[];
    parts: any[];
    [key: string]: any;
  };
}

export {};
