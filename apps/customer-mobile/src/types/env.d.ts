/// <reference types="react" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly EXPO_PUBLIC_API_URL?: string;
  }
}
