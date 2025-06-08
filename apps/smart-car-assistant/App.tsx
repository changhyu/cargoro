import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClerkProvider, useAuth, useUser } from '@cargoro/auth/mobile';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

// 네비게이션 타입 정의
type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Dashboard: undefined;
};

type SignInScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignIn'>;
type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;
type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

// 스택 네비게이터 생성
const Stack = createNativeStackNavigator<RootStackParamList>();

// 로그인 화면
function SignInScreen({ navigation }: { navigation: SignInScreenNavigationProp }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>스마트카 어시스턴트 로그인</Text>
      {/* 로그인 폼 컴포넌트 */}
    </View>
  );
}

// 회원가입 화면
function SignUpScreen({ navigation }: { navigation: SignUpScreenNavigationProp }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>스마트카 어시스턴트 회원가입</Text>
      {/* 회원가입 폼 컴포넌트 */}
    </View>
  );
}

// 메인 대시보드 화면
function DashboardScreen({ navigation }: { navigation: DashboardScreenNavigationProp }) {
  const { userId, isSignedIn } = useAuth();
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>스마트카 대시보드</Text>

      {user && (
        <View style={styles.profileContainer}>
          <Text style={styles.greeting}>안녕하세요, {user.firstName || '사용자'}님!</Text>
          <Text style={styles.role}>역할: 사용자</Text>
        </View>
      )}

      {/* 대시보드 콘텐츠 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>차량 상태</Text>
        <Text style={styles.cardContent}>배터리: 78%</Text>
        <Text style={styles.cardContent}>연료: 65%</Text>
        <Text style={styles.cardContent}>다음 정비일: 15일 후</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>알림</Text>
        <Text style={styles.cardContent}>타이어 공기압 점검 필요</Text>
        <Text style={styles.cardContent}>에어컨 필터 교체 시기</Text>
      </View>

      {/* 로그아웃 버튼 */}
    </View>
  );
}

// 인증되지 않은 사용자를 위한 스택
function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SignIn" component={SignInScreen} options={{ title: '로그인' }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: '회원가입' }} />
    </Stack.Navigator>
  );
}

// 인증된 사용자를 위한 스택
function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: '대시보드' }} />
      {/* 다른 인증된 화면들... */}
    </Stack.Navigator>
  );
}

// 메인 네비게이션
function Navigation() {
  const { isSignedIn, isLoaded } = useAuth();

  // 로딩 상태 처리
  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  return <NavigationContainer>{isSignedIn ? <AppStack /> : <AuthStack />}</NavigationContainer>;
}

// 앱 진입점
export default function App() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || ''}
      appearance={{
        // 스마트카 앱에 맞는 UI 스타일
        variables: {
          colorPrimary: '#10B981',
          colorBackground: '#FFFFFF',
          colorText: '#111827',
          colorDanger: '#EF4444',
        },
      }}
    >
      <Navigation />
      <StatusBar style="auto" />
    </ClerkProvider>
  );
}

// 스타일
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111827',
  },
  profileContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    width: '100%',
  },
  greeting: {
    fontSize: 18,
    marginBottom: 5,
    color: '#10B981',
  },
  role: {
    fontSize: 14,
    color: '#6B7280',
  },
  card: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    width: '100%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111827',
  },
  cardContent: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 5,
  },
});
