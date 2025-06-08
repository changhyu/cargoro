declare module '@env' {
  export const EXPO_PUBLIC_API_URL: string;
}

// Expo의 process.env 타입 확장
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_URL?: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {};
