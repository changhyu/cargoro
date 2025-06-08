import { vi } from 'vitest';
import React from 'react';
// import '@testing-library/jest-dom'; // 타입 정의가 설치될 때까지 주석 처리
// import 'react-native-gesture-handler/jestSetup'; // 제거: Vitest 환경에서 Jest 전역 객체 오류 발생
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react-native';
import { server } from './tests/mocks/server';

// React Native Gesture Handler 직접 모킹 (jestSetup 대신)
vi.mock('react-native-gesture-handler', () => ({
  PanGestureHandler: 'PanGestureHandler',
  TapGestureHandler: 'TapGestureHandler',
  State: {
    BEGAN: 'BEGAN',
    ACTIVE: 'ACTIVE',
    END: 'END',
    CANCELLED: 'CANCELLED',
    FAILED: 'FAILED',
  },
  gestureHandlerRootHOC: vi.fn(component => component),
}));

// React Native 관련 모킹
vi.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Reanimated 모킹
vi.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// AsyncStorage 모킹
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
}));

// React Native 모킹
vi.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
      select: vi.fn(obj => obj.ios),
    },
    NativeModules: {},
    Animated: {
      Value: vi.fn(() => ({
        interpolate: vi.fn(),
      })),
    },
  };
});

// 스마트카 관련 특화 모킹
vi.mock('@cargoro/gps-obd-lib', () => ({
  initOBD: vi.fn().mockResolvedValue(true),
  readDiagnosticData: vi.fn().mockResolvedValue({
    rpm: 1500,
    speed: 60,
    engineTemp: 90,
    batteryVoltage: 12.6,
    fuelLevel: 75,
    oilTemp: 95,
    engineLoad: 45,
  }),
  readBatteryStatus: vi.fn().mockResolvedValue({
    voltage: 12.6,
    current: 5.2,
    temperature: 25,
    chargeState: 'normal',
  }),
  readEngineStatus: vi.fn().mockResolvedValue({
    rpm: 1500,
    temp: 90,
    load: 45,
    fuelConsumption: 8.5,
  }),
  connectOBDDevice: vi.fn().mockResolvedValue(true),
}));

// GraphQL 클라이언트 모킹
vi.mock('@cargoro/api-client', async (importOriginal: () => Promise<Record<string, unknown>>) => {
  const actual = await importOriginal();
  const mockGraphQLClient = {
    query: vi.fn().mockResolvedValue({}),
    mutate: vi.fn().mockResolvedValue({}),
    setAuthToken: vi.fn(),
  };

  return {
    ...(actual as Record<string, unknown>),
    configureGraphQLClient: vi.fn().mockReturnValue(mockGraphQLClient),
    getGraphQLClient: vi.fn().mockReturnValue(mockGraphQLClient),
  };
});

// 전역 객체 모킹
Object.defineProperty(global.navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn().mockReturnValue(123),
    clearWatch: vi.fn(),
  },
  writable: true,
  configurable: true,
});

// MSW 설정
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// 콘솔 에러 억제
console.error = vi.fn();
