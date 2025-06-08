import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { ClerkProvider } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { View, ActivityIndicator, Text, Alert } from 'react-native';

// 환경 변수 검증 유틸리티
const validateEnvironmentVariables = () => {
  const requiredVars = {
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key);

  if (missingVars.length > 0) {
    const errorMessage = `필수 환경 변수가 누락되었습니다: ${missingVars.join(', ')}`;
    console.error(errorMessage);

    if (__DEV__) {
      Alert.alert('환경 변수 오류', errorMessage);
    }
    return false;
  }

  // Clerk 키 유효성 검사
  const publishableKey = requiredVars.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey?.startsWith('pk_')) {
    console.error('유효하지 않은 Clerk publishable key 형식');
    return false;
  }

  return true;
};

// 보안 키 생성 (실제 운영환경에서는 더 안전한 방식으로 관리)
const ENCRYPTION_KEY = process.env.EXPO_PUBLIC_TOKEN_ENCRYPTION_KEY || 'cargoro-default-key-2024';

// 토큰 암호화/복호화 유틸리티
const encryptToken = (token: string): string => {
  try {
    return CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('토큰 암호화 실패:', error);
    return token; // 암호화 실패시 평문으로 폴백
  }
};

const decryptToken = (encryptedToken: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    // 복호화 결과가 비어있으면 원본 반환 (이미 평문일 가능성)
    return decrypted || encryptedToken;
  } catch (error) {
    console.error('토큰 복호화 실패:', error);
    return encryptedToken;
  }
};

// 토큰 캐시 관리를 위한 AsyncStorage 설정 (보안 강화)
const tokenCache = {
  async getToken(key: string) {
    try {
      const encryptedToken = await AsyncStorage.getItem(key);
      if (encryptedToken) {
        return decryptToken(encryptedToken);
      }
      return null;
    } catch (err) {
      console.error('토큰 조회 오류:', err);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      const encryptedToken = encryptToken(value);
      return AsyncStorage.setItem(key, encryptedToken);
    } catch (err) {
      console.error('토큰 저장 오류:', err);
      return;
    }
  },
  async clearToken(key: string) {
    try {
      return AsyncStorage.removeItem(key);
    } catch (err) {
      console.error('토큰 삭제 오류:', err);
      return;
    }
  },
};

// 인증 컨텍스트 타입 정의
interface ClerkAuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
  userId: string | null;
  sessionId: string | null;
  getToken: () => Promise<string | null>;
}

// 기본값으로 컨텍스트 생성
const ClerkAuthContext = createContext<ClerkAuthContextType>({
  isLoaded: false,
  isSignedIn: false,
  signOut: async () => {},
  userId: null,
  sessionId: null,
  getToken: async () => null,
});

export const useClerkAuth = () => useContext(ClerkAuthContext);

interface ClerkMobileProviderProps {
  children: ReactNode;
  publishableKey: string;
  // 최신 리다이렉트 URL 설정
  signInFallbackRedirectUrl?: string;
  signUpFallbackRedirectUrl?: string;
  signInForceRedirectUrl?: string;
  signUpForceRedirectUrl?: string;
  afterSignOutUrl?: string;
}

export const ClerkMobileProvider = ({
  children,
  publishableKey,
  signInFallbackRedirectUrl = '/',
  signUpFallbackRedirectUrl = '/',
  signInForceRedirectUrl,
  signUpForceRedirectUrl,
  afterSignOutUrl = '/sign-in',
}: ClerkMobileProviderProps) => {
  const [authState, setAuthState] = useState<{
    isLoaded: boolean;
    isSignedIn: boolean;
    userId: string | null;
    sessionId: string | null;
  }>({
    isLoaded: false,
    isSignedIn: false,
    userId: null,
    sessionId: null,
  });

  useEffect(() => {
    if (!validateEnvironmentVariables()) {
      console.error('환경 변수 검증 실패');
    }
  }, []);

  // 사용자가 로그인할 때까지 로딩 UI 표시
  if (!authState.isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>인증 정보 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
      signInFallbackRedirectUrl={signInFallbackRedirectUrl}
      signUpFallbackRedirectUrl={signUpFallbackRedirectUrl}
      signInForceRedirectUrl={signInForceRedirectUrl}
      signUpForceRedirectUrl={signUpForceRedirectUrl}
      afterSignOutUrl={afterSignOutUrl}
    >
      <ClerkAuthContext.Provider
        value={{
          isLoaded: authState.isLoaded,
          isSignedIn: authState.isSignedIn,
          userId: authState.userId,
          sessionId: authState.sessionId,
          signOut: async () => {
            // Clerk 세션 종료 로직
            try {
              // 여기에 Clerk의 signOut 호출 구현
              await tokenCache.clearToken('clerk-auth-token');
              setAuthState(prev => ({
                ...prev,
                isSignedIn: false,
                userId: null,
                sessionId: null,
              }));
            } catch (error) {
              console.error('로그아웃 중 오류 발생:', error);
            }
          },
          getToken: async () => {
            try {
              // 여기에 Clerk의 getToken 호출 구현
              return await tokenCache.getToken('clerk-auth-token');
            } catch (error) {
              console.error('토큰 가져오기 오류:', error);
              return null;
            }
          },
        }}
      >
        {children}
      </ClerkAuthContext.Provider>
    </ClerkProvider>
  );
};
