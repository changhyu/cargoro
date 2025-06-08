import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
// import { Redirect } from 'expo-router';
// TODO: expo-router 패키지 설치 필요

interface MobileAuthGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
  loadingComponent?: React.ReactNode;
}

export function MobileAuthGuard({
  children,
  fallbackPath = '/sign-in',
  loadingComponent,
}: MobileAuthGuardProps) {
  const { isLoaded, isSignedIn } = useAuth();

  // 로딩 중
  if (!isLoaded) {
    return (
      loadingComponent || (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ marginTop: 10 }}>로딩 중...</Text>
        </View>
      )
    );
  }

  // 인증되지 않은 경우
  if (!isSignedIn) {
    // return <Redirect href={fallbackPath} />;
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>로그인이 필요합니다</Text>
      </View>
    );
  }

  // 인증된 경우
  return <>{children}</>;
}
