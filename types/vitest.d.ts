/**
 * Vitest 전역 타입 정의
 */

interface MockDataByKey {
  repairs: any[];
  parts: any[];
  users: any[];
  vehicles: any[];
  contracts: any[];
  organizations: any[];
  [key: string]: any;
}

// 전역 객체 확장
declare global {
  var mockDataByKey: MockDataByKey;
}

export {};
