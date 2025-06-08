import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// 스플래시 스크린 유지
SplashScreen.preventAutoHideAsync();

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// 토큰 캐시
const tokenCache = {
  getToken: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('토큰 가져오기 실패:', error);
      return null;
    }
  },
  saveToken: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('토큰 저장 실패:', error);
    }
  },
  deleteToken: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('토큰 삭제 실패:', error);
    }
  },
};

// 네비게이션 타입 정의
type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// 더미 스크린 컴포넌트
const SignInScreen = ({ navigation }: { navigation: any }) => (
  <View style={styles.container}>
    <Text style={styles.text}>로그인 화면</Text>
    <Text style={styles.link} onPress={() => navigation.navigate('SignUp')}>
      회원가입하기
    </Text>
    <Text style={styles.link} onPress={() => navigation.navigate('Dashboard')}>
      대시보드로 가기 (로그인 없이)
    </Text>
  </View>
);

const SignUpScreen = ({ navigation }: { navigation: any }) => (
  <View style={styles.container}>
    <Text style={styles.text}>회원가입 화면</Text>
    <Text style={styles.link} onPress={() => navigation.navigate('SignIn')}>
      로그인하기
    </Text>
  </View>
);

const DashboardScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>대시보드 화면</Text>
    <Text>환영합니다! 정비소 앱입니다.</Text>
  </View>
);

// 인증 라우터
const AuthRouter = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {isSignedIn ? (
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      ) : (
        <>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

function App(): React.ReactElement {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        // MaterialCommunityIcons 폰트는 벡터 아이콘 패키지에서 자동으로 로드됨
        // require() 사용을 피하기 위해 주석 처리
        // await Font.loadAsync({
        //   'Material Design Icons': require('react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
        // });
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('폰트 로딩 오류:', error);
      }
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY || ''} tokenCache={tokenCache}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <NavigationContainer>
          <AuthRouter />
        </NavigationContainer>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
    marginVertical: 10,
  },
});

export default App;
