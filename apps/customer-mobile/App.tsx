import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/Feather';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import 'react-native-gesture-handler';

// 개발 모드 경고 필터 적용
import './src/utils/dev-warning-filter';

// Provider imports
import { SessionProvider, useSession } from './src/providers/auth-provider';

// Screen imports
import WelcomeScreen from './src/screens/auth/welcome-screen';
import LoginScreen from './src/screens/auth/login-screen';
import SignupScreen from './src/screens/auth/signup-screen';
import VehiclesScreen from './src/screens/vehicles/vehicles-screen';
import ProfileScreen from './src/screens/profile/profile-screen';
import VehicleDetailScreen from './src/screens/vehicles/vehicle-detail-screen';
import AddVehicleScreen from './src/screens/vehicles/add-vehicle-screen';
import WorkshopListScreen from './src/screens/booking/workshop-list-screen';
import BookingDetailScreen from './src/screens/booking/booking-detail-screen';
import ServiceHistoryScreen from './src/screens/history/service-history-screen';
import NotificationsScreen from './src/screens/notifications/notifications-screen';
import LiveTrackingScreen from './src/screens/tracking/live-tracking-screen';

// 새로운 통합 화면들
import IntegratedNavigationScreen from './src/screens/navigation/integrated-navigation-screen';
import ServiceHubScreen from './src/screens/service/service-hub-screen';
import EmergencyServiceScreen from './src/screens/service/emergency-service-screen';
import MapDetailScreen from './src/screens/navigation/map-detail-screen';
import SmartDiagnosisScreen from './src/screens/service/smart-diagnosis-screen';
import MaintenanceBookingScreen from './src/screens/service/maintenance-booking-screen';
import WorkshopSearchScreen from './src/screens/service/workshop-search-screen';
import MaintenanceHistoryScreen from './src/screens/service/maintenance-history-screen';
import SmartHomeScreen from './src/screens/home/smart-home-screen';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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
  // 통합된 네비게이션 관련
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

// Create navigators
const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Auth Stack
function AuthStackScreen() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
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

          if (route.name === '네비게이션') {
            iconName = 'map';
          } else if (route.name === '서비스허브') {
            iconName = 'settings';
          } else if (route.name === '차량관리') {
            iconName = 'truck';
          } else if (route.name === '프로필') {
            iconName = 'user';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#6B7280',
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        },
        headerTintColor: '#1F2937',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="네비게이션"
        component={SmartHomeScreen}
        options={{
          headerTitle: '스마트 카 플랫폼',
        }}
      />
      <Tab.Screen
        name="서비스허브"
        component={ServiceHubScreen}
        options={{
          headerTitle: '서비스 허브',
        }}
      />
      <Tab.Screen
        name="차량관리"
        component={VehiclesScreen}
        options={{
          headerTitle: '내 차량',
        }}
      />
      <Tab.Screen
        name="프로필"
        component={ProfileScreen}
        options={{
          headerTitle: '내 정보',
        }}
      />
    </Tab.Navigator>
  );
}

// Loading Screen
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#6366F1" />
      <Text style={styles.loadingText}>로딩 중...</Text>
    </View>
  );
}

// Root Navigator
function RootNavigator() {
  const { isLoading } = useSession();

  useEffect(() => {
    // Request notification permissions with improved handling
    const requestPermissions = async () => {
      try {
        // 권한 상태 확인
        const { status: existingStatus } = await Notifications.getPermissionsAsync();

        // 아직 결정되지 않은 경우에만 요청
        if (existingStatus !== 'granted' && existingStatus !== 'denied') {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            console.warn('Notification permissions not granted');
          }
        } else if (existingStatus === 'denied') {
          // 이미 거부된 경우 로그만 남김
          console.warn('Notification permissions were previously denied');
        }
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
      }
    };

    requestPermissions();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' },
      }}
    >
      {/* 로그인 여부와 상관없이 메인 탭을 첫 화면으로 표시 */}
      <RootStack.Screen name="Main" component={MainTabs} />

      {/* 로그인 화면 */}
      <RootStack.Screen name="Auth" component={AuthStackScreen} />

      {/* 나머지 스크린들 */}
      <RootStack.Screen
        name="VehicleDetail"
        component={VehicleDetailScreen}
        options={{
          headerShown: true,
          title: '차량 상세',
          headerBackTitle: '뒤로',
        }}
      />
      <RootStack.Screen
        name="AddVehicle"
        component={AddVehicleScreen}
        options={{
          headerShown: true,
          title: '차량 등록',
          headerBackTitle: '뒤로',
        }}
      />
      <RootStack.Screen
        name="WorkshopList"
        component={WorkshopListScreen}
        options={{
          headerShown: true,
          title: '정비소 선택',
          headerBackTitle: '뒤로',
        }}
      />
      <RootStack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{
          headerShown: true,
          title: '예약 상세',
          headerBackTitle: '뒤로',
        }}
      />
      <RootStack.Screen
        name="ServiceHistory"
        component={ServiceHistoryScreen}
        options={{
          headerShown: true,
          title: '정비 이력',
          headerBackTitle: '뒤로',
        }}
      />
      <RootStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerShown: true,
          title: '알림',
          headerBackTitle: '뒤로',
        }}
      />
      <RootStack.Screen
        name="LiveTracking"
        component={LiveTrackingScreen}
        options={{
          headerShown: true,
          title: '실시간 추적',
          headerBackTitle: '뒤로',
        }}
      />

      {/* 새로운 통합 서비스 화면들 */}
      <RootStack.Screen
        name="Navigation"
        component={IntegratedNavigationScreen}
        options={{
          headerShown: true,
          title: '스마트 네비게이션',
          headerBackTitle: '뒤로',
        }}
      />
      <RootStack.Screen
        name="EmergencyService"
        component={EmergencyServiceScreen}
        options={{
          headerShown: true,
          title: '긴급 서비스',
          headerBackTitle: '뒤로',
        }}
      />
      <RootStack.Screen
        name="MapDetail"
        component={MapDetailScreen}
        options={{
          headerShown: true,
          title: '지도 상세',
          headerBackTitle: '뒤로',
        }}
      />
      <RootStack.Screen
        name="SmartDiagnosis"
        component={SmartDiagnosisScreen}
        options={{
          headerShown: true,
          title: '스마트 진단',
          headerBackTitle: '뒤로',
        }}
      />
      <RootStack.Screen
        name="MaintenanceBooking"
        component={MaintenanceBookingScreen}
        options={{
          headerShown: true,
          title: '정비 예약',
          headerBackTitle: '뒤로',
        }}
      />
      <RootStack.Screen
        name="WorkshopSearch"
        component={WorkshopSearchScreen}
        options={{
          headerShown: true,
          title: '정비소 검색',
          headerBackTitle: '뒤로',
        }}
      />
      <RootStack.Screen
        name="MaintenanceHistory"
        component={MaintenanceHistoryScreen}
        options={{
          headerShown: true,
          title: '정비 이력',
          headerBackTitle: '뒤로',
        }}
      />
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
          <StatusBar style="auto" />
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
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});
