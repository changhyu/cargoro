import type { VehicleLocationResponse } from '@/app/features/vehicles/vehicle-tracking/types';

export type { VehicleLocationResponse };

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
