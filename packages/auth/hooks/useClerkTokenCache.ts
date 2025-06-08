// import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// SecureStore 모킹 (패키지 설치 전)
const SecureStore = {
  getItemAsync: async (key: string) => null,
  setItemAsync: async (key: string, value: string) => {},
  deleteItemAsync: async (key: string) => {},
};

// Expo 앱용 토큰 캐시 훅
export const useClerkTokenCache = () => {
  // iOS/Android에서는 SecureStore 사용
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return {
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
  }

  // 웹에서는 AsyncStorage 사용 (Expo Web)
  return {
    getToken: async (key: string) => {
      try {
        return await AsyncStorage.getItem(key);
      } catch (error) {
        console.error('토큰 가져오기 실패:', error);
        return null;
      }
    },
    saveToken: async (key: string, value: string) => {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        console.error('토큰 저장 실패:', error);
      }
    },
    deleteToken: async (key: string) => {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.error('토큰 삭제 실패:', error);
      }
    },
  };
};
