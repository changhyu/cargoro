export type IntegratedRootStackParamList = {
  Auth: undefined;
  Main: undefined;
  // 네비게이션 관련
  Navigation: undefined;
  MapDetail: {
    destination?: {
      latitude: number;
      longitude: number;
      name: string;
    };
  };

  // 정비 서비스 관련
  ServiceHub: undefined;
  MaintenanceBooking: { serviceType?: string };
  WorkshopSearch: {
    currentLocation?: { latitude: number; longitude: number };
    serviceType?: string;
  };
  EmergencyService: undefined;
  MaintenanceHistory: { vehicleId?: string };
  SmartDiagnosis: { vehicleId: string };

  // 기존 기능들
  VehicleDetail: { id: string };
  AddVehicle: undefined;
  WorkshopList: { serviceType?: string };
  BookingDetail: { id: string };
  ServiceHistory: { vehicleId: string };
  Notifications: undefined;
  LiveTracking: { bookingId: string };
  Profile: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  네비게이션: undefined;
  서비스허브: undefined;
  차량관리: undefined;
  프로필: undefined;
};

// 네비게이션 관련 타입들
export interface NavigationLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category?: 'workshop' | 'gas_station' | 'parking' | 'general';
  rating?: number;
  distance?: number;
  isOpen?: boolean;
  phoneNumber?: string;
}

export interface NavigationRoute {
  id: string;
  origin: NavigationLocation;
  destination: NavigationLocation;
  distance: number;
  duration: number;
  polyline: string;
  trafficStatus: 'smooth' | 'normal' | 'congested' | 'blocked';
}

// 스마트 진단 관련 타입들
export interface VehicleDiagnosticData {
  vehicleId: string;
  timestamp: Date;
  engineStatus: 'good' | 'warning' | 'critical';
  batteryLevel: number;
  fuelLevel: number;
  mileage: number;
  oilPressure: number;
  coolantTemperature: number;
  tirePressure: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  diagnosticCodes: string[];
  maintenanceRecommendations: MaintenanceRecommendation[];
}

export interface MaintenanceRecommendation {
  id: string;
  type: 'oil_change' | 'tire_rotation' | 'brake_check' | 'battery_replacement' | 'general';
  severity: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  estimatedCost: number;
  dueDate?: Date;
  mileageLimit?: number;
}

// 서비스 허브 관련 타입들
export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  isEmergency?: boolean;
}

export interface EmergencyService {
  id: string;
  type: 'towing' | 'battery_jump' | 'tire_change' | 'lockout' | 'fuel_delivery';
  description: string;
  estimatedArrival: number; // minutes
  cost: number;
  provider: {
    name: string;
    phone: string;
    rating: number;
  };
}
