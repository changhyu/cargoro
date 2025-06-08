// React Native 전역 변수 타입 정의
declare const __DEV__: boolean;

// 환경 변수 타입 정의
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  }
}
