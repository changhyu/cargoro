// API 서비스 관련 타입 정의
export interface Vehicle {
  id: string;
  licensePlate: string;
  model: string;
  manufacturer: string;
  year: number;
  type: string;
  status: 'active' | 'idle' | 'maintenance' | 'out_of_service' | 'inactive';
  fuelType: string;
  mileage: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt?: Date;
  make?: string;
  plateNumber?: string;
  vehicleId?: string; // 추가된 필드
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  isActive: boolean;
  department?: string;
  position?: string;
  emergencyContact?: string;
  licenseType?: string;
  restrictions?: string[];
  notes?: string;
}

export interface DriverFilters {
  search?: string;
  isActive?: boolean;
  department?: string;
  licenseExpiringSoon?: boolean;
}

export interface CreateDriverInput {
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  isActive?: boolean;
  department?: string;
  position?: string;
  emergencyContact?: string;
  notes?: string;
  licenseType?: string;
  restrictions?: string[];
}

export interface UpdateDriverInput extends Partial<CreateDriverInput> {
  id: string;
}

export interface ExtendedDriver extends Driver {
  vehicleAssignments?: VehicleAssignment[];
  performanceMetrics?: PerformanceMetrics;
  licenseType?: string;
  restrictions?: string[];
  notes?: string;
}

export interface VehicleAssignment {
  id: string;
  driverId: string;
  vehicleId: string;
  assignedAt: string;
  unassignedAt?: string;
  isActive: boolean;
}

export interface Maintenance {
  id: string;
  vehicleId: string;
  type: 'scheduled' | 'repair' | 'inspection';
  description: string;
  cost: number;
  scheduledDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  parts?: MaintenancePart[];
}

export interface MaintenancePart {
  id: string;
  name: string;
  quantity: number;
  cost: number;
}

export interface MaintenanceFilters {
  vehicleId?: string;
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface MaintenanceListResponse {
  data: Maintenance[];
  total: number;
  page: number;
  limit: number;
  items?: Maintenance[]; // 추가 필드
  pageSize?: number; // 추가 필드
  totalPages?: number; // 추가 필드
}

export interface PerformanceMetrics {
  driverId: string;
  period: string;
  totalDistance: number;
  fuelEfficiency: number;
  safetyScore: number;
  accidentCount: number;
  violationCount: number;
  overallScore?: number;
}

export interface DrivingRecord {
  id: string;
  driverId: string;
  vehicleId: string;
  startTime: string;
  endTime: string;
  distance: number;
  route: string;
  fuelUsed: number;
  averageSpeed: number;
  maxSpeed: number;
  status?: 'ongoing' | 'completed' | 'cancelled';
  violations?: ViolationRecord[];
  vehicle?: {
    make: string;
    model: string;
    plateNumber: string;
  };
  startLocation?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  endLocation?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  purpose?: string;
  fuelConsumption?: number;
}

export interface ViolationRecord {
  id: string;
  type: string;
  description: string;
  location: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'license_expiry';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  userId?: string;
  targetType?: 'driver' | 'vehicle' | 'maintenance';
  targetId?: string; // 추가 필드
  isRead?: boolean;
  updatedAt?: string;
}

// Mock 서비스들
export const driverService = {
  async getDrivers(filters?: DriverFilters): Promise<{ items: ExtendedDriver[] }> {
    // Mock implementation with items wrapper
    return { items: [] };
  },

  async getDriver(id: string): Promise<Driver | null> {
    return null;
  },

  async createDriver(data: CreateDriverInput): Promise<Driver> {
    return {} as Driver;
  },

  async updateDriver(id: string, data: UpdateDriverInput): Promise<Driver> {
    return {} as Driver;
  },

  async deleteDriver(id: string): Promise<void> {
    // Mock implementation
  },

  async exportDriversToExcel(drivers: Driver[]): Promise<Blob> {
    return new Blob();
  },

  async assignVehicle(driverId: string, vehicleId: string): Promise<VehicleAssignment> {
    return {} as VehicleAssignment;
  },

  async unassignVehicle(driverId: string, vehicleId: string): Promise<void> {
    // Mock implementation
  },
};

export const vehicleAssignmentService = {
  async getAssignments(driverId: string): Promise<VehicleAssignment[]> {
    return [];
  },

  async assignVehicle(driverId: string, vehicleId: string): Promise<VehicleAssignment> {
    return {} as VehicleAssignment;
  },

  async unassignVehicle(assignmentId: string): Promise<void> {
    // Mock implementation
  },

  async getAssignmentsByDriver(driverId: string): Promise<VehicleAssignment[]> {
    return [];
  },

  async getAvailableVehicles(): Promise<Vehicle[]> {
    return [];
  },
};

export const drivingRecordService = {
  async getRecords(driverId: string): Promise<DrivingRecord[]> {
    return [];
  },

  async getRecordsByDriver(driverId: string, filters?: any): Promise<DrivingRecord[]> {
    return [];
  },
};

export const performanceService = {
  async getMetrics(driverId: string, period: string): Promise<PerformanceMetrics> {
    return {} as PerformanceMetrics;
  },

  async getDriverMetrics(driverId: string, options?: any): Promise<any> {
    return { summary: {} as PerformanceMetrics };
  },
};

export const maintenanceService = {
  async getMaintenances(filters?: MaintenanceFilters): Promise<MaintenanceListResponse> {
    return {
      data: [],
      items: [], // 추가된 필드
      total: 0,
      page: 1,
      limit: 10,
      pageSize: 10, // 추가된 필드
      totalPages: 0, // 추가된 필드
    };
  },

  async getMaintenance(id: string): Promise<Maintenance | null> {
    return null;
  },

  async getMaintenanceById(id: string): Promise<Maintenance | null> {
    return null;
  },

  async createMaintenance(data: Omit<Maintenance, 'id'>): Promise<Maintenance> {
    return {} as Maintenance;
  },

  async updateMaintenance(id: string, data: Partial<Maintenance>): Promise<Maintenance> {
    return {} as Maintenance;
  },

  async updateMaintenanceStatus(id: string, status: string): Promise<Maintenance> {
    return {} as Maintenance;
  },

  async deleteMaintenance(id: string): Promise<void> {
    // Mock implementation
  },

  async getVehicleMaintenanceHistory(
    vehicleId: string,
    filters?: Partial<MaintenanceFilters>
  ): Promise<MaintenanceListResponse> {
    return {
      data: [],
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      pageSize: 10,
      totalPages: 0,
    };
  },
};

export const notificationService = {
  async getNotifications(userId?: string): Promise<Notification[]> {
    return [];
  },

  async markAsRead(notificationId: string): Promise<void> {
    // Mock implementation
  },

  async createNotification(data: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    return {} as Notification;
  },

  async getLicenseExpiryAlerts(): Promise<Notification[]> {
    return [];
  },

  async markAllAsRead(): Promise<void> {
    // Mock implementation
  },
};
