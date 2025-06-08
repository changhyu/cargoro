/**
 * 스마트카 어시스턴트 앱의 인증 프로바이더
 */
import React, { ReactNode, useContext, useMemo } from 'react';

import { ClerkProvider, useAuth as useClerkAuth } from '@cargoro/auth/mobile';
import { ActivityIndicator, View, Text } from 'react-native';

import type { User } from '@cargoro/types';

// AuthContext 타입 및 기본 값은 기존과 동일하게 유지하고,
// 내부 구현만 Clerk으로 변경합니다
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// 기존 useAuth를 그대로 re-export
export const useAuth = useClerkAuth;

interface AuthProviderProps {
  children: ReactNode;
}

// Clerk 기반으로 인증 제공자 구현
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Clerk의 publishableKey - env 변수에서 가져오기
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  // 항상 Hook 호출 (조건부 처리 안에 넣지 않음)
  const clerkAuth = useClerkAuth();

  if (!publishableKey) {
    console.error('❌ EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY가 설정되지 않았습니다.');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, textAlign: 'center', color: 'red' }}>
          인증 설정 오류: Clerk 키가 설정되지 않았습니다.
        </Text>
      </View>
    );
  }

  // 로딩 상태 처리
  if (!clerkAuth.isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>인증 정보 로딩 중...</Text>
      </View>
    );
  }

  return <>{children}</>;
};

// ClerkMobileProvider로 감싸는 래퍼 컴포넌트
export const AuthProviderWithClerk: React.FC<{ children: ReactNode }> = ({ children }) => {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.error('❌ EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY가 설정되지 않았습니다.');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, textAlign: 'center', color: 'red' }}>
          인증 설정 오류: Clerk 키가 설정되지 않았습니다.
        </Text>
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <AuthProvider>{children}</AuthProvider>
    </ClerkProvider>
  );
};
