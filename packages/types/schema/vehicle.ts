import { z } from 'zod';

// 차량 상태 열거형 - 통합된 정의
export enum _VehicleStatusEnum {
  ACTIVE = 'active',
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  INACTIVE = 'inactive',
  RESERVED = 'reserved',
  OUT_OF_SERVICE = 'out_of_service',
}

// Zod 스키마용 VehicleStatus
export const VehicleStatusSchema = z.nativeEnum(_VehicleStatusEnum);

// 차량 유형 열거형
export enum VehicleType {
  SEDAN = 'sedan',
  SUV = 'suv',
  TRUCK = 'truck',
  VAN = 'van',
  MOTORCYCLE = 'motorcycle',
  BUS = 'bus',
  OTHER = 'other',
}

// 차량 Zod 스키마 정의
export const VehicleSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid().optional(),
  licensePlate: z.string(),
  plateNumber: z.string().optional(), // 기존 코드 호환성을 위해 추가
  make: z.string(),
  model: z.string(),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  vehicleType: z.nativeEnum(VehicleType).optional(),
  vin: z.string().optional(),
  color: z.string().optional(),
  status: VehicleStatusSchema,
  mileage: z.number().int(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  engine: z.string().optional(),
  features: z.array(z.string()).optional(),
  notes: z.string().optional(),
  ownerId: z.string().uuid().optional(),
  registrationDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 단일 Vehicle 타입 정의
export type Vehicle = z.infer<typeof VehicleSchema>;

// 차량 생성 입력값 스키마
export const CreateVehicleInputSchema = VehicleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateVehicleInput = z.infer<typeof CreateVehicleInputSchema>;

// 차량 업데이트 입력값 스키마
export const UpdateVehicleInputSchema = VehicleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type UpdateVehicleInput = z.infer<typeof UpdateVehicleInputSchema>;

// 차량 생성 DTO 타입 (기존 호환성 유지)
export type CreateVehicleDto = Omit<Vehicle, 'id' | 'status' | 'createdAt' | 'updatedAt'>;

// 차량 업데이트 DTO 타입 (기존 호환성 유지)
export type UpdateVehicleDto = Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>;

// 차량 위치 상태 열거형
export enum LocationStatus {
  ACTIVE = 'active',
  IDLE = 'idle',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service',
  OFFLINE = 'offline',
}

// 차량 위치 타입
export interface VehicleLocation {
  id: string;
  vehicleId: string;
  licensePlate?: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  status: 'active' | 'idle' | 'maintenance' | 'out_of_service' | 'offline';
  timestamp: number;
  createdAt: string;
  updatedAt: string;
}

// 차량 위치 생성 DTO 타입
export type CreateVehicleLocationDto = Omit<
  VehicleLocation,
  'id' | 'licensePlate' | 'timestamp' | 'createdAt' | 'updatedAt'
> & { timestamp?: number };

// 차량 위치 업데이트 DTO 타입
export type UpdateVehicleLocationDto = Partial<
  Omit<VehicleLocation, 'id' | 'vehicleId' | 'licensePlate' | 'createdAt' | 'updatedAt'>
>;
