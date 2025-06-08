import '@testing-library/jest-dom';
import React from 'react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './tests/mocks/server';
import { vi } from 'vitest';

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

// Expo Location 모킹
vi.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: vi.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: vi.fn().mockResolvedValue({
    coords: {
      latitude: 37.5326,
      longitude: 127.0246,
    },
  }),
  watchPositionAsync: vi.fn().mockReturnValue({
    remove: vi.fn(),
  }),
}));

// GraphQL 클라이언트 모킹
vi.mock('@cargoro/api-client', async () => {
  const mockGraphQLClient = {
    query: vi.fn().mockResolvedValue({}),
    mutate: vi.fn().mockResolvedValue({}),
    setAuthToken: vi.fn(),
  };

  return {
    configureGraphQLClient: vi.fn().mockReturnValue(mockGraphQLClient),
    getGraphQLClient: vi.fn().mockReturnValue(mockGraphQLClient),
    apiClient: {
      get: vi.fn().mockResolvedValue({}),
      post: vi.fn().mockResolvedValue({}),
      put: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
      setAuthToken: vi.fn(),
      clearAuthToken: vi.fn(),
    },
  };
});

// 전역 객체 모킹
if (!(global as any).navigator) {
  (global as any).navigator = {};
}
(global as any).navigator.geolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn().mockReturnValue(123),
  clearWatch: vi.fn(),
};

// MSW 설정
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// 콘솔 에러 억제
console.error = vi.fn();
