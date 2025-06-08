import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// 화면 import (경로 수정)
import CustomerDetailScreen from '../pages/customer-detail-screen';
import CustomerListScreen from '../pages/customer-list-screen';
import HomeScreen from '../pages/home-screen';
import InventoryDetailScreen from '../pages/inventory-detail-screen';
import InventoryScreen from '../pages/inventory-screen';
import LoginScreen from '../pages/login-screen';
import ProfileScreen from '../pages/profile-screen';
import RepairDetailScreen from '../pages/repair-detail-screen';
import RepairListScreen from '../pages/repair-list-screen';
import SettingsScreen from '../pages/settings-screen';
import VehicleDetailScreen from '../pages/vehicle-detail-screen';

// 인증 상태 관리 훅
import { useAuth } from '../providers/auth-provider';

// 네비게이션 타입 정의
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  RepairDetail: { repairId: string };
  CustomerDetail: { customerId: string };
  Settings: undefined;
  VehicleDetail: { vehicleId: string };
  InventoryDetail: { itemId: string };
  RepairCreate: undefined;
  CustomerCreate: undefined;
};

export type TabParamList = {
  Home: undefined;
  Repairs: undefined;
  Customers: undefined;
  Inventory: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

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
        name="Repairs"
        component={RepairListScreen}
        options={{
          tabBarLabel: '정비',
          tabBarIcon: ({ color, size }) => <Icon name="wrench" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Customers"
        component={CustomerListScreen}
        options={{
          tabBarLabel: '고객',
          tabBarIcon: ({ color, size }) => <Icon name="account-group" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: '재고',
          tabBarIcon: ({ color, size }) => (
            <Icon name="package-variant-closed" color={color} size={size} />
          ),
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
  const { user, loading } = useAuth();

  // 로딩 중 처리
  if (loading) {
    return null; // 또는 로딩 화면
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // 인증되지 않은 사용자를 위한 스택
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          // 인증된 사용자를 위한 스택
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="RepairDetail" component={RepairDetailScreen} />
            <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} />
            <Stack.Screen name="InventoryDetail" component={InventoryDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
