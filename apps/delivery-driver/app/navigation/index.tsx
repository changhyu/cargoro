import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// 화면 import
import ActiveDeliveryScreen from '../pages/active-delivery-screen';
import DeliveryCompletedScreen from '../pages/delivery-completed-screen';
import DeliveryDetailScreen from '../pages/delivery-detail-screen';
import DeliveryHistoryScreen from '../pages/delivery-history-screen';
import EditProfileScreen from '../pages/edit-profile-screen';
import HomeScreen from '../pages/home-screen';
import LocationScreen from '../pages/location-screen';
import LoginScreen from '../pages/login-screen';
import PaymentHistoryScreen from '../pages/payment-history-screen';
import ProfileScreen from '../pages/profile-screen';
import ScheduleScreen from '../pages/schedule-screen';
import SettingsScreen from '../pages/settings-screen';
import SupportScreen from '../pages/support-screen';

// 인증 상태 관리 훅
import { useAuth } from '../providers/auth-provider';

// 네비게이션 타입 정의
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  ActiveDelivery: { deliveryId?: string } | undefined;
  DeliveryDetail: { deliveryId?: string } | undefined;
  Location: undefined;
  Support: undefined;
  PaymentHistory: undefined;
  DeliveryHistory: undefined;
  Settings: { section?: string } | undefined;
  DeliveryCompleted: { deliveryId?: string } | undefined;
  EditProfile: { field?: string } | undefined;
  // TabNavigator 내부
  Home: undefined;
  Schedule: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// 탭 네비게이터
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          tabBarLabel: '일정',
          tabBarIcon: ({ color, size }) => <Icon name="calendar" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: '내 정보',
          tabBarIcon: ({ color, size }) => <Icon name="account" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

// 앱 전체 네비게이터
const AppNavigator = () => {
  const { session, isLoading } = useAuth();

  // 로딩 중 처리
  if (isLoading) {
    return null; // 또는 로딩 화면
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          // 인증되지 않은 사용자를 위한 스택
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          // 인증된 사용자를 위한 스택
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="ActiveDelivery" component={ActiveDeliveryScreen} />
            <Stack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} />
            <Stack.Screen name="Location" component={LocationScreen} />
            <Stack.Screen name="Support" component={SupportScreen} />
            <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
            <Stack.Screen name="DeliveryHistory" component={DeliveryHistoryScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="DeliveryCompleted" component={DeliveryCompletedScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
