import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

// 위치 타입
export interface LocationData {
  latitude: number;
  longitude: number;
  heading?: number | null;
  speed?: number | null;
  timestamp?: number;
}

interface UseLocationTrackingOptions {
  // 위치 업데이트 간격 (밀리초)
  interval?: number;
  // 원하는 위치 정확도
  accuracy?: Location.Accuracy;
  // 위치 변경 콜백
  onLocationChange?: (location: LocationData) => void;
}

/**
 * 실시간 위치 추적을 위한 커스텀 훅
 */
const useLocationTracking = (options: UseLocationTrackingOptions = {}) => {
  const { interval = 5000, accuracy = Location.Accuracy.Balanced, onLocationChange } = options;

  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // 권한 요청 및 위치 추적 시작
  const startTracking = async () => {
    try {
      setErrorMsg(null);

      // 위치 권한 요청
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('위치 접근 권한이 거부되었습니다.');
        return false;
      }

      // 위치 추적 시작
      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy,
          timeInterval: interval,
          distanceInterval: 10, // 10미터 이상 움직였을 때 업데이트
        },
        newLocation => {
          const locationData: LocationData = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            heading: newLocation.coords.heading,
            speed: newLocation.coords.speed,
            timestamp: newLocation.timestamp,
          };

          setLocation(locationData);

          // 위치 변경 콜백 호출
          if (onLocationChange) {
            onLocationChange(locationData);
          }
        }
      );

      setIsTracking(true);

      // 클린업 함수 반환
      return () => {
        locationSubscription.remove();
        setIsTracking(false);
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '위치 추적 중 오류가 발생했습니다.';
      setErrorMsg(errorMessage);
      return false;
    }
  };

  // 위치 추적 정지
  const stopTracking = () => {
    setIsTracking(false);
  };

  // 현재 위치 한 번만 가져오기
  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      setErrorMsg(null);

      // 위치 권한 요청
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('위치 접근 권한이 거부되었습니다.');
        return null;
      }

      // 현재 위치 가져오기
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy,
      });

      const locationData: LocationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        heading: currentLocation.coords.heading,
        speed: currentLocation.coords.speed,
        timestamp: currentLocation.timestamp,
      };

      setLocation(locationData);
      return locationData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '위치 정보를 가져오는 중 오류가 발생했습니다.';
      setErrorMsg(errorMessage);
      return null;
    }
  };

  // 임시 더미 위치 생성 (테스트용)
  const generateDummyLocation = (): LocationData => {
    // 서울 중심 좌표
    const baseLatitude = 37.5665;
    const baseLongitude = 126.978;

    // 무작위 오프셋 (최대 5km)
    const latOffset = (Math.random() - 0.5) * 0.1;
    const lngOffset = (Math.random() - 0.5) * 0.1;

    return {
      latitude: baseLatitude + latOffset,
      longitude: baseLongitude + lngOffset,
      heading: Math.random() * 360,
      speed: Math.random() * 30, // 0~30 m/s
      timestamp: Date.now(),
    };
  };

  return {
    location,
    errorMsg,
    isTracking,
    startTracking,
    stopTracking,
    getCurrentLocation,
    generateDummyLocation,
  };
};

export default useLocationTracking;
