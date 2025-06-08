import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/Feather';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Provider imports
import { SessionProvider, useSession } from './src/providers/auth-provider';

// Screen imports
import LoginScreen from './src/screens/auth/login-screen';
import HomeScreen from './src/screens/home/home-screen';
import WorkOrdersScreen from './src/screens/work-orders/work-orders-screen';
import InspectionScreen from './src/screens/inspection/inspection-screen';
import ProfileScreen from './src/screens/profile/profile-screen';
import WorkOrderDetailScreen from './src/screens/work-orders/work-order-detail-screen';
import VehicleInspectionScreen from './src/screens/inspection/vehicle-inspection-screen';
import PartsRequestScreen from './src/screens/parts/parts-request-screen';
import PhotoCaptureScreen from './src/screens/common/photo-capture-screen';
import QRScannerScreen from './src/screens/common/qr-scanner-screen';

// Initialize React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Navigator type definitions
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  WorkOrderDetail: { id: string };
  VehicleInspection: { workOrderId: string; vehicleId: string };
  PartsRequest: { workOrderId: string };
  PhotoCapture: { type: 'before' | 'after' | 'inspection'; workOrderId: string };
  QRScanner: { type: 'vehicle' | 'parts' };
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  홈: undefined;
  작업목록: undefined;
  점검: undefined;
  프로필: undefined;
};

// Create navigators
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Auth Stack
function AuthStackScreen() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';

          if (route.name === '홈') {
            iconName = 'home';
          } else if (route.name === '작업목록') {
            iconName = 'clipboard';
          } else if (route.name === '점검') {
            iconName = 'check-square';
          } else if (route.name === '프로필') {
            iconName = 'user';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#6B7280',
        headerStyle: {
          backgroundColor: '#F3F4F6',
        },
        headerTintColor: '#1F2937',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="홈"
        component={HomeScreen}
        options={{
          headerTitle: 'CarGoro 기술자',
        }}
      />
      <Tab.Screen
        name="작업목록"
        component={WorkOrdersScreen}
        options={{
          headerTitle: '작업 목록',
        }}
      />
      <Tab.Screen
        name="점검"
        component={InspectionScreen}
        options={{
          headerTitle: '차량 점검',
        }}
      />
      <Tab.Screen
        name="프로필"
        component={ProfileScreen}
        options={{
          headerTitle: '내 프로필',
        }}
      />
    </Tab.Navigator>
  );
}

// Loading Screen
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#10B981" />
      <Text style={styles.loadingText}>로딩 중...</Text>
    </View>
  );
}

// Root Navigator
function RootNavigator() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <>
          <RootStack.Screen name="Main" component={MainTabs} />
          <RootStack.Screen
            name="WorkOrderDetail"
            component={WorkOrderDetailScreen}
            options={{
              headerShown: true,
              headerTitle: '작업 상세',
              headerBackTitle: '뒤로',
            }}
          />
          <RootStack.Screen
            name="VehicleInspection"
            component={VehicleInspectionScreen}
            options={{
              headerShown: true,
              headerTitle: '차량 점검',
              headerBackTitle: '뒤로',
            }}
          />
          <RootStack.Screen
            name="PartsRequest"
            component={PartsRequestScreen}
            options={{
              headerShown: true,
              headerTitle: '부품 요청',
              headerBackTitle: '뒤로',
            }}
          />
          <RootStack.Screen
            name="PhotoCapture"
            component={PhotoCaptureScreen}
            options={{
              headerShown: true,
              headerTitle: '사진 촬영',
              headerBackTitle: '뒤로',
            }}
          />
          <RootStack.Screen
            name="QRScanner"
            component={QRScannerScreen}
            options={{
              headerShown: true,
              headerTitle: 'QR 스캔',
              headerBackTitle: '뒤로',
            }}
          />
        </>
      ) : (
        <RootStack.Screen name="Auth" component={AuthStackScreen} />
      )}
    </RootStack.Navigator>
  );
}

// Main App Component
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="dark" />
        </NavigationContainer>
      </SessionProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});
