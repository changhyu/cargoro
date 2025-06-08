import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import NavigationScreen from '../features/navigation';
import HomeScreen from '../pages/home-screen';
import VehicleStatusScreen from '../pages/vehicle-status-screen';
import { RootStackParamList } from '../types/navigation';

// 네비게이션 스택 생성
const Stack = createStackNavigator<RootStackParamList>();

/**
 * 앱 전체 네비게이션 구조
 * 메인 스택 네비게이터는 앱의 모든 화면을 포함
 */
const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Map" component={NavigationScreen} />
      <Stack.Screen name="Diagnosis" component={VehicleStatusScreen} />
      {/* 아직 구현되지 않은 화면들은 임시로 HomeScreen으로 연결 */}
      <Stack.Screen name="Profile" component={HomeScreen} />
      <Stack.Screen name="Stations" component={HomeScreen} />
      <Stack.Screen name="Maintenance" component={HomeScreen} />
      <Stack.Screen name="Reservation" component={HomeScreen} />
      <Stack.Screen name="DrivingHistory" component={HomeScreen} />
      <Stack.Screen name="FullDiagnostics" component={HomeScreen} />
      <Stack.Screen name="ScheduleService" component={HomeScreen} />
      <Stack.Screen name="FindServiceCenter" component={HomeScreen} />
      <Stack.Screen name="MaintenanceHistory" component={HomeScreen} />
      <Stack.Screen name="Notifications" component={HomeScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
