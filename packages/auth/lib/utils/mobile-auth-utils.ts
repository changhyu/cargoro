import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export async function saveAuthToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function getAuthToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  } else {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  }
}

export async function clearAuthToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export async function saveUserData(userData: any): Promise<void> {
  const userDataString = JSON.stringify(userData);

  if (Platform.OS === 'web') {
    localStorage.setItem(USER_KEY, userDataString);
  } else {
    await SecureStore.setItemAsync(USER_KEY, userDataString);
  }
}

export async function getUserData(): Promise<any | null> {
  try {
    let userDataString: string | null;

    if (Platform.OS === 'web') {
      userDataString = localStorage.getItem(USER_KEY);
    } else {
      userDataString = await SecureStore.getItemAsync(USER_KEY);
    }

    return userDataString ? JSON.parse(userDataString) : null;
  } catch {
    return null;
  }
}

export async function clearUserData(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(USER_KEY);
  } else {
    await SecureStore.deleteItemAsync(USER_KEY);
  }
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() >= exp;
  } catch {
    return true;
  }
}
