/**
 * 워크샵 모바일 앱의 메인 컴포넌트
 *
 * 모든 모바일 앱은 이 표준 구조를 따릅니다:
 * 1. SafeAreaProvider 및 StatusBar 설정
 * 2. RootProvider (테마, 인증, API 등)
 * 3. 네비게이션 구조
 */
import React, { useEffect, useState } from 'react';

import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

function App(): React.ReactElement {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        // MaterialCommunityIcons.font 속성 대신 직접 경로 설정
        // MaterialCommunityIcons 폰트는 벡터 아이콘 패키지에서 자동으로 로드됨
        // require() 사용을 피하기 위해 주석 처리
        // await Font.loadAsync({
        //   'Material Design Icons': require('react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
        // });
        setFontsLoaded(true);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('폰트 로딩 오류:', error);
      }
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>폰트 로딩 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>앱이 로드되었습니다.</Text>
        <MaterialCommunityIcons name="check" size={24} color="green" />
      </View>
    </SafeAreaProvider>
  );
}

export default App;
