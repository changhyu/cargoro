// Zustand 타입 확장
declare module 'zustand' {
  export * from 'zustand';
}

// 전역 타입
declare global {
  interface Window {
    fs?: {
      readFile: (path: string, options?: { encoding?: string }) => Promise<any>;
    };
  }
}

export {};
