'use client';

import { create } from 'zustand';

import type { Vehicle as ApiVehicle } from '../services/api';

type VehicleStatus = 'active' | 'idle' | 'maintenance' | 'offline' | 'out_of_service';

interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  status: VehicleStatus;
  imageUrl?: string;
}

interface VehicleStore {
  // 상태
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  loading: boolean;
  error: string | null;

  // 액션
  setVehicles: (vehicles: ApiVehicle[]) => void;
  selectVehicle: (id: string | null) => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useVehicleStore = create<VehicleStore>(set => ({
  // 초기 상태
  vehicles: [],
  selectedVehicleId: null,
  loading: false,
  error: null,

  // 액션
  setVehicles: apiVehicles => {
    // API 응답의 Vehicle 타입을 내부 Vehicle 타입으로 변환
    const vehicles = apiVehicles.map(v => ({
      id: v.id,
      plateNumber: v.plateNumber || v.licensePlate || '',
      make: v.make || v.brand || '',
      model: v.model || '',
      year: v.year || 0,
      status: v.status as VehicleStatus,
      imageUrl: v.imageUrl,
    }));
    set({ vehicles });
  },

  selectVehicle: id => set({ selectedVehicleId: id }),

  addVehicle: vehicle =>
    set(state => ({
      vehicles: [...state.vehicles, vehicle],
    })),

  updateVehicle: (id, updates) =>
    set(state => ({
      vehicles: state.vehicles.map(vehicle =>
        vehicle.id === id ? { ...vehicle, ...updates } : vehicle
      ),
    })),

  removeVehicle: id =>
    set(state => ({
      vehicles: state.vehicles.filter(vehicle => vehicle.id !== id),
      selectedVehicleId: state.selectedVehicleId === id ? null : state.selectedVehicleId,
    })),

  setLoading: loading => set({ loading }),

  setError: error => set({ error }),
}));
