import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// 루트 스택 파라미터 정의
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  BookingDetails: { bookingId: string };
  VehicleDetails: { vehicleId: string };
  // 기타 스크린들 추가
};

// 메인 탭 파라미터 정의
export type MainTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Vehicles: undefined;
  Profile: undefined;
  // 기타 탭들 추가
};

// 인증 스택 파라미터 정의
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Verification: { email: string };
};

// 스크린 Props 타입 정의
export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

export type MainTabScreenProps<Screen extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  Screen
>;

export type AuthStackScreenProps<Screen extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  Screen
>;

// 전역 네비게이션 타입 선언
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {
      // React Navigation의 전역 타입 확장
    }
  }
}
