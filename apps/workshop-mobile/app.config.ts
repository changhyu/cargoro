import { ExpoConfig, ConfigContext } from '@expo/config';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const defineConfig = (_ctx: ConfigContext): ExpoConfig => ({
  name: '카고로 워크샵',
  slug: 'workshop-mobile',
  scheme: 'cargoro-workshop',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#2563eb',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.cargoro.workshop',
    buildNumber: '1',
    infoPlist: {
      NSCameraUsageDescription: '차량 사진 촬영을 위해 카메라 접근이 필요합니다.',
      NSPhotoLibraryUsageDescription: '차량 사진 선택을 위해 사진 라이브러리 접근이 필요합니다.',
      NSLocationWhenInUseUsageDescription: '워크샵 위치 확인을 위해 위치 정보가 필요합니다.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#2563eb',
    },
    package: 'com.cargoro.workshop',
    versionCode: 1,
    permissions: [
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'ACCESS_FINE_LOCATION',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-camera',
      {
        cameraPermission: '차량 사진 촬영을 위해 카메라를 사용합니다.',
      },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: '워크샵 위치 확인을 위해 위치 정보를 사용합니다.',
      },
    ],
  ],
  extra: {
    clerkPublishableKey: CLERK_PUBLISHABLE_KEY,
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.cargoro.com',
    eas: {
      projectId: 'your-project-id',
    },
  },
});

export default defineConfig;
