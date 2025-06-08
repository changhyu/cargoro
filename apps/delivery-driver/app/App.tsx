import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/Feather';

import DeliveryListTab from './(tabs)/delivery-list';
import HomeScreen from './pages/home-screen';
import RealtimeLocationScreen from './pages/realtime-location-screen';
import ProfileScreen from './pages/profile-screen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName = 'home';

            if (route.name === '홈') {
              iconName = 'home';
            } else if (route.name === '배송목록') {
              iconName = 'clipboard';
            } else if (route.name === '실시간위치') {
              iconName = 'map-pin';
            } else if (route.name === '프로필') {
              iconName = 'user';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: '#6b7280',
          headerStyle: {
            backgroundColor: '#f8fafc',
          },
          headerTintColor: '#1f2937',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen
          name="홈"
          component={HomeScreen}
          options={{
            title: '홈',
            headerTitle: 'CarGoro 탁송',
          }}
        />
        <Tab.Screen
          name="배송목록"
          component={DeliveryListTab}
          options={{
            title: '배송 목록',
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="실시간위치"
          component={RealtimeLocationScreen}
          options={{
            title: '위치 추적',
          }}
        />
        <Tab.Screen
          name="프로필"
          component={ProfileScreen}
          options={{
            title: '프로필',
          }}
        />
      </Tab.Navigator>
      <StatusBar style="dark" />
    </NavigationContainer>
  );
}
