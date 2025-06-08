import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/Feather';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

// Auth Provider 임포트
import { useSession, SessionProvider } from './app/providers/auth-provider';

// 화면 임포트
import LoginScreen from './app/pages/login-screen';
import HomeScreen from './app/pages/home-screen';
import DeliveryListScreen from './app/features/delivery-list/delivery-list-screen';
import DeliveryDetailScreen from './app/pages/delivery-detail-screen';
import ActiveDeliveryScreen from './app/pages/active-delivery-screen';
import RealtimeLocationScreen from './app/pages/realtime-location-screen';
import ProfileScreen from './app/pages/profile-screen';
import EditProfileScreen from './app/pages/edit-profile-screen';
import ScheduleScreen from './app/pages/schedule-screen';
import DeliveryHistoryScreen from './app/pages/delivery-history-screen';
import PaymentHistoryScreen from './app/pages/payment-history-screen';
import SettingsScreen from './app/pages/settings-screen';
import SupportScreen from './app/pages/support-screen';

// 웹 브라우저 워밍업
WebBrowser.maybeCompleteAuthSession();

// 네비게이터 타입 정의
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  DeliveryDetail: { deliveryId?: string };
  ActiveDelivery: undefined;
  EditProfile: { field?: string } | undefined;
  Schedule: undefined;
  DeliveryHistory: undefined;
  PaymentHistory: undefined;
  Settings: { section?: string } | undefined;
  Support: undefined;
  Login: undefined;
  DeliveryList: undefined;
  About: undefined;
  배송목록: undefined;
  DeliveryCompleted: { deliveryId?: string };
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  홈: undefined;
  배송목록: undefined;
  실시간위치: undefined;
  프로필: undefined;
};

// 전체 라우트에 대한 타입 정의
export type AllRoutes = keyof RootStackParamList | keyof MainTabParamList;

// 스택 네비게이터 생성
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// 인증 스택
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

// 메인 탭 네비게이터
function MainTabs() {
  return (
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
        component={DeliveryListScreen}
        options={{
          title: '배송 목록',
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
  );
}

// 로딩 화면
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.loadingText}>로딩 중...</Text>
    </View>
  );
}

// 루트 네비게이터
function RootNavigator() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        // 인증된 사용자 스택
        <>
          <RootStack.Screen name="Main" component={MainTabs} />
          <RootStack.Screen
            name="DeliveryDetail"
            component={DeliveryDetailScreen}
            options={{
              headerShown: true,
              headerTitle: '배송 상세',
              headerBackTitle: '뒤로',
            }}
          />
          <RootStack.Screen
            name="ActiveDelivery"
            component={ActiveDeliveryScreen}
            options={{
              headerShown: true,
              headerTitle: '진행중인 배송',
              headerBackTitle: '뒤로',
            }}
          />
          <RootStack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{
              headerShown: true,
              headerTitle: '프로필 수정',
              headerBackTitle: '뒤로',
            }}
          />
          <RootStack.Screen
            name="Schedule"
            component={ScheduleScreen}
            options={{
              headerShown: true,
              headerTitle: '일정 관리',
              headerBackTitle: '뒤로',
            }}
          />
          <RootStack.Screen
            name="DeliveryHistory"
            component={DeliveryHistoryScreen}
            options={{
              headerShown: true,
              headerTitle: '배송 이력',
              headerBackTitle: '뒤로',
            }}
          />
          <RootStack.Screen
            name="PaymentHistory"
            component={PaymentHistoryScreen}
            options={{
              headerShown: true,
              headerTitle: '수익 내역',
              headerBackTitle: '뒤로',
            }}
          />
          <RootStack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerShown: true,
              headerTitle: '설정',
              headerBackTitle: '뒤로',
            }}
          />
          <RootStack.Screen
            name="Support"
            component={SupportScreen}
            options={{
              headerShown: true,
              headerTitle: '고객 지원',
              headerBackTitle: '뒤로',
            }}
          />
        </>
      ) : (
        // 인증되지 않은 사용자 스택
        <RootStack.Screen name="Auth" component={AuthStackScreen} />
      )}
    </RootStack.Navigator>
  );
}

// 앱 진입점
export default function App() {
  useEffect(() => {
    // 웹 브라우저 예열 (OAuth 인증 속도 향상)
    WebBrowser.warmUpAsync();

    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  return (
    <SessionProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="dark" />
      </NavigationContainer>
    </SessionProvider>
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
