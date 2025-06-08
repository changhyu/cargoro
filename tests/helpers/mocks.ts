import { vi } from 'vitest';

// Next.js 라우터 모킹
export const mockRouter = {
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  push: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
  back: vi.fn(),
  prefetch: vi.fn(),
  beforePopState: vi.fn(),
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
};

// 사용자 데이터 모킹
export const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: '테스트 사용자',
  role: 'USER',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

// API 응답 모킹 헬퍼
export const createMockResponse = <T>(data: T, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  headers: new Headers({
    'content-type': 'application/json',
  }),
  json: vi.fn().mockResolvedValue(data),
  text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  blob: vi.fn().mockResolvedValue(new Blob([JSON.stringify(data)])),
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
  formData: vi.fn().mockResolvedValue(new FormData()),
  clone: vi.fn().mockReturnThis(),
});

// 에러 응답 모킹
export const createMockErrorResponse = (message: string, status = 400) =>
  createMockResponse({ error: message }, status);

// 파일 모킹
export const createMockFile = (name: string, size: number, type: string): File => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// 이미지 모킹
export const createMockImage = (width: number, height: number) => {
  const img = new Image();
  Object.defineProperty(img, 'naturalWidth', { value: width });
  Object.defineProperty(img, 'naturalHeight', { value: height });
  return img;
};

// LocalStorage 모킹
export const mockLocalStorage = () => {
  const storage: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
    get length() {
      return Object.keys(storage).length;
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(storage);
      return keys[index] || null;
    }),
  };
};

// Geolocation 모킹
export const mockGeolocation = () => ({
  getCurrentPosition: vi.fn(success => {
    success({
      coords: {
        latitude: 37.5665,
        longitude: 126.978,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    });
  }),
  watchPosition: vi.fn(() => 1),
  clearWatch: vi.fn(),
});

// Performance API 모킹
export const mockPerformance = () => ({
  mark: vi.fn(),
  measure: vi.fn(),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  getEntriesByName: vi.fn(() => []),
  getEntriesByType: vi.fn(() => []),
  now: vi.fn(() => Date.now()),
});
