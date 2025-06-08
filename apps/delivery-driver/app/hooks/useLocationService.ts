import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

interface UseLocationServiceReturn {
  currentLocation: LocationData | null;
  isLocationEnabled: boolean;
  isTracking: boolean;
  error: string | null;
  requestLocationPermission: () => Promise<boolean>;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  getCurrentLocation: () => Promise<LocationData | null>;
}

export const useLocationService = (): UseLocationServiceReturn => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationSubscription, setLocationSubscription] =
    useState<Location.LocationSubscription | null>(null);

  // 위치 권한 상태 확인
  const checkLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setIsLocationEnabled(status === 'granted');
      return status === 'granted';
    } catch (err) {
      console.error('Error checking location permission:', err);
      setError('위치 권한 확인 중 오류가 발생했습니다.');
      return false;
    }
  }, []);

  // 위치 권한 요청
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        Alert.alert(
          '위치 권한 필요',
          '배송 서비스를 이용하려면 위치 권한이 필요합니다. 설정에서 위치 권한을 허용해주세요.',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '설정으로 이동',
              onPress: () => {
                // 플랫폼별 설정 화면으로 이동
                if (Platform.OS === 'ios') {
                  // iOS 설정 화면으로 이동
                  // Linking.openURL('app-settings:');
                } else {
                  // Android 설정 화면으로 이동
                  // Linking.openSettings();
                }
              },
            },
          ]
        );
        return false;
      }

      // 백그라운드 위치 권한도 요청 (배송 추적을 위해)
      if (Platform.OS === 'android') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          Alert.alert(
            '백그라운드 위치 권한',
            '배송 중 지속적인 위치 추적을 위해 백그라운드 위치 권한이 필요합니다.',
            [{ text: '확인' }]
          );
        }
      }

      setIsLocationEnabled(true);
      return true;
    } catch (err) {
      console.error('Error requesting location permission:', err);
      setError('위치 권한 요청 중 오류가 발생했습니다.');
      return false;
    }
  }, []);

  // 현재 위치 가져오기
  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    try {
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        const granted = await requestLocationPermission();
        if (!granted) return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude || undefined,
        accuracy: location.coords.accuracy || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
        timestamp: location.timestamp,
      };

      setCurrentLocation(locationData);
      setError(null);
      return locationData;
    } catch (err) {
      console.error('Error getting current location:', err);
      setError('현재 위치를 가져올 수 없습니다.');
      return null;
    }
  }, [checkLocationPermission, requestLocationPermission]);

  // 위치 추적 시작
  const startTracking = useCallback(async () => {
    try {
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        const granted = await requestLocationPermission();
        if (!granted) return;
      }

      // 기존 구독이 있다면 중지
      if (locationSubscription) {
        locationSubscription.remove();
      }

      // 새로운 위치 추적 시작
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000, // 5초마다 업데이트
          distanceInterval: 10, // 10미터 이동 시 업데이트
        },
        location => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude || undefined,
            accuracy: location.coords.accuracy || undefined,
            heading: location.coords.heading || undefined,
            speed: location.coords.speed || undefined,
            timestamp: location.timestamp,
          };

          setCurrentLocation(locationData);
          setError(null);
        }
      );

      setLocationSubscription(subscription);
      setIsTracking(true);
    } catch (err) {
      console.error('Error starting location tracking:', err);
      setError('위치 추적을 시작할 수 없습니다.');
      setIsTracking(false);
    }
  }, [checkLocationPermission, requestLocationPermission, locationSubscription]);

  // 위치 추적 중지
  const stopTracking = useCallback(() => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setIsTracking(false);
  }, [locationSubscription]);

  // 컴포넌트 마운트 시 권한 확인
  useEffect(() => {
    checkLocationPermission();
  }, [checkLocationPermission]);

  // 컴포넌트 언마운트 시 추적 중지
  useEffect(() => {
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [locationSubscription]);

  return {
    currentLocation,
    isLocationEnabled,
    isTracking,
    error,
    requestLocationPermission,
    startTracking,
    stopTracking,
    getCurrentLocation,
  };
};
