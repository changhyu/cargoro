/**
 * React Native (Expo) 앱에서 Clerk 인증 설정 예제
 *
 * 이 예제는 Expo 앱에서 Clerk 인증을 구성하는 방법을 보여줍니다.
 * 이 파일을 앱의 App.tsx 파일로 저장하세요.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MobileClerkProvider, useAuth } from '@cargoro/auth/mobile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

// 내비게이션 스택 생성
const Stack = createNativeStackNavigator();

// 로그인 화면
function SignInScreen() {
  // 여기에 SignIn 화면 구현...
  return (
    <View style={styles.container}>
      <Text>로그인 화면</Text>
    </View>
  );
}

// 회원가입 화면
function SignUpScreen() {
  // 여기에 SignUp 화면 구현...
  return (
    <View style={styles.container}>
      <Text>회원가입 화면</Text>
    </View>
  );
}

// 홈 화면
function HomeScreen() {
  const { profile, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>홈 화면</Text>
      {profile && (
        <View style={styles.profileContainer}>
          <Text style={styles.greeting}>안녕하세요, {profile.fullName}님!</Text>
          <Text style={styles.role}>역할: {profile.role}</Text>
        </View>
      )}
      {/* 로그아웃 버튼 등 구현... */}
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
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: '홈' }} />
      {/* 다른 인증된 화면들... */}
    </Stack.Navigator>
  );
}

// 내비게이션 컨테이너
function Navigation() {
  const { isSignedIn, isLoaded } = useAuth();

  // 로딩 중 처리
  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  return <NavigationContainer>{isSignedIn ? <AppStack /> : <AuthStack />}</NavigationContainer>;
}

// 앱 루트 컴포넌트
export default function App() {
  // 내비게이션 핸들러 (Clerk에서 사용)
  const handleNavigate = (to: string) => {
    // 내비게이션 구현...
    console.log('Navigate to:', to);
  };

  return (
    <MobileClerkProvider
      navigate={handleNavigate}
      appearance={
        {
          // Clerk UI 스타일링...
        }
      }
    >
      <Navigation />
      <StatusBar style="auto" />
    </MobileClerkProvider>
  );
}

// 스타일
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    width: '100%',
  },
  greeting: {
    fontSize: 18,
    marginBottom: 5,
  },
  role: {
    fontSize: 14,
    color: '#666',
  },
});
