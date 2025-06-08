import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiagnosticResult } from '../types/diagnostic';

/**
 * 차량 정보 타입
 */
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
}

/**
 * 사용자 정보 타입
 */
interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}

/**
 * 앱 상태 타입
 */
interface AppState {
  // 인증 관련
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;

  // 차량 관련
  vehicles: Vehicle[];
  selectedVehicle: {
    vehicleId: string | null;
    lastSelected: string | null;
  };

  // 진단 관련
  diagnosticResults: DiagnosticResult[];
  diagnosticHistory: Array<{
    id: string;
    date: string;
    results: DiagnosticResult[];
  }>;

  // 상태 액션
  login: (user: User, token: string) => void;
  logout: () => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  selectVehicle: (vehicleId: string) => void;
  setDiagnosticResults: (results: DiagnosticResult[]) => void;
  clearDiagnosticResults: () => void;
  addDiagnosticHistory: (history: {
    id: string;
    date: string;
    results: DiagnosticResult[];
  }) => void;
}

/**
 * Zustand 스토어 생성
 * - 영구 저장소 미들웨어 사용
 * - AsyncStorage 사용하여 데이터 유지
 */
export const useStore = create<AppState>()(
  persist(
    set => ({
      // 초기 상태
      isAuthenticated: false,
      user: null,
      token: null,
      vehicles: [],
      selectedVehicle: {
        vehicleId: null,
        lastSelected: null,
      },
      diagnosticResults: [],
      diagnosticHistory: [],

      // 액션
      login: (user, token) =>
        set(() => ({
          isAuthenticated: true,
          user,
          token,
        })),

      logout: () => {
        // 로그아웃 이벤트 발생
        const logoutEvent = new CustomEvent('auth:logout', {
          detail: { timestamp: new Date().toISOString() },
        });

        // 이벤트 디스패치
        if (typeof window !== 'undefined') {
          window.dispatchEvent(logoutEvent);
        }

        // 상태 초기화
        set(() => ({
          isAuthenticated: false,
          user: null,
          token: null,
        }));
      },

      setVehicles: vehicles => set(() => ({ vehicles })),

      selectVehicle: vehicleId =>
        set(state => ({
          selectedVehicle: {
            vehicleId,
            lastSelected: new Date().toISOString(),
          },
        })),

      setDiagnosticResults: results =>
        set(() => ({
          diagnosticResults: results,
        })),

      clearDiagnosticResults: () =>
        set(() => ({
          diagnosticResults: [],
        })),

      addDiagnosticHistory: history =>
        set(state => ({
          diagnosticHistory: [history, ...state.diagnosticHistory.slice(0, 9)],
        })),
    }),
    {
      name: 'cargoro-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        vehicles: state.vehicles,
        selectedVehicle: state.selectedVehicle,
        diagnosticHistory: state.diagnosticHistory,
      }),
    }
  )
);

export default useStore;
