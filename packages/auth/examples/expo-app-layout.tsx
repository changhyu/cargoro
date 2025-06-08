import { ClerkProvider, useAuth } from '@cargoro/auth/mobile';
// import { useClerkTokenCache } from '@cargoro/auth/hooks/useClerkTokenCache';
// TODO: expo-router 패키지 설치 필요
import { useEffect } from 'react';
import { View, Text } from 'react-native';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    // TODO: expo-router 설치 후 라우팅 로직 구현
  }, [isSignedIn, isLoaded]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Expo App Layout Example</Text>
    </View>
  );
}

export default function RootLayout() {
  // const tokenCache = useClerkTokenCache();

  if (!CLERK_PUBLISHABLE_KEY) {
    throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      // tokenCache={tokenCache}
    >
      <InitialLayout />
    </ClerkProvider>
  );
}
