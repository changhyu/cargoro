/**
 * 스마트 카 어시스턴트 앱의 메인 컴포넌트
 *
 * 모든 모바일 앱은 이 표준 구조를 따릅니다:
 * 1. SafeAreaProvider 및 StatusBar 설정
 * 2. RootProvider (테마, 인증, API 등)
 * 3. 네비게이션 구조
 */
import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './navigation';
import RootProvider from './providers/root-provider';

function App(): React.ReactElement {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <RootProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </RootProvider>
    </SafeAreaProvider>
  );
}

export default App;
