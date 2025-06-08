import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  VehicleDetail: { id: string };
  AddVehicle: undefined;
  WorkshopList: { serviceType?: string };
  BookingDetail: { id: string };
  ServiceHistory: { vehicleId: string };
  Notifications: undefined;
  LiveTracking: { bookingId: string };
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  홈: undefined;
  차량: undefined;
  예약: undefined;
  이력: undefined;
  프로필: undefined;
};

export type AuthScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export type MainTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;
