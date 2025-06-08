/**
 * 앱 내비게이션 타입 정의
 */
import { StackNavigationProp } from '@react-navigation/stack';

// 루트 스택 내비게이션에서 사용할 스크린 이름들
export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Stations: undefined;
  Diagnosis: undefined;
  Maintenance: undefined;
  Reservation: undefined;
  Map: undefined;
  DrivingHistory: undefined;
  FullDiagnostics: undefined;
  ScheduleService: undefined;
  FindServiceCenter: undefined;
  MaintenanceHistory: undefined;
  Notifications: undefined;
};

// 각 스크린을 위한 네비게이션 prop 타입 정의
export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;
export type DiagnosisScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Diagnosis'>;
export type VehicleStatusScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Diagnosis'
>;

// @react-navigation/native 모듈 확장
declare module '@react-navigation/native' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface RootParamList extends RootStackParamList {}
}
