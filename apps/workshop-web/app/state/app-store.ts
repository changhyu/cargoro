import { create } from 'zustand';

/**
 * 사이드바 상태 관리를 위한 인터페이스
 */
interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

/**
 * 테마 모드 상태 관리를 위한 인터페이스
 */
interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  setMode: (mode: 'light' | 'dark' | 'system') => void;
}

/**
 * 애플리케이션 상태 인터페이스
 * 사이드바와 테마 상태를 통합하여 관리합니다.
 */
interface AppState extends SidebarState, ThemeState {
  /**
   * 애플리케이션 초기화 상태
   */
  isInitialized: boolean;
  /**
   * 애플리케이션 초기화 함수
   */
  initialize: () => void;
}

/**
 * 애플리케이션 글로벌 상태 관리를 위한 Zustand 스토어
 * - 사이드바 상태
 * - 테마 모드 상태
 */
export const useAppStore = create<AppState>(set => ({
  // 사이드바 상태
  isOpen: false,
  toggle: () => set(state => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  // 테마 모드 상태
  mode: 'system',
  setMode: mode => set({ mode }),

  // 애플리케이션 초기화 상태
  isInitialized: false,
  initialize: () => set({ isInitialized: true }),
}));
