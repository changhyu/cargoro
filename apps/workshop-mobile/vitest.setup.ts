/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import { server } from './tests/mocks/server';
import React from 'react';

// MSW 서버 설정
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// React Native 및 관련 라이브러리 전역 모킹
vi.mock('react-native-gesture-handler', () => ({
  State: {},
  PanGestureHandler: 'PanGestureHandler',
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
  gestureHandlerRootHOC: vi.fn((component: unknown) => component),
  TouchableOpacity: 'TouchableOpacity',
}));

vi.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: vi.fn(
      (obj: { ios?: unknown; android?: unknown; default?: unknown }) => obj.ios || obj.default
    ),
  },
  Dimensions: {
    get: vi.fn(() => ({ width: 375, height: 812 })),
  },
  StyleSheet: {
    create: (styles: Record<string, unknown>) => styles,
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  ActivityIndicator: 'ActivityIndicator',
  Alert: {
    alert: vi.fn(),
  },
}));

vi.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 44, right: 0, bottom: 34, left: 0 }),
}));

// API client 모킹
vi.mock('@cargoro/api-client', async (importOriginal: () => Promise<Record<string, unknown>>) => {
  const actual = await importOriginal();
  return {
    ...actual,
    graphqlClient: {
      request: vi.fn(),
    },
    useQuery: vi.fn(),
    useMutation: vi.fn(),
  };
});

// window.navigator.geolocation 모킹
Object.defineProperty(global.navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  },
  writable: true,
});

// 전역 fetch 모킹 (MSW와 함께 작동)
global.fetch = vi.fn();

// ResizeObserver 모킹
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
