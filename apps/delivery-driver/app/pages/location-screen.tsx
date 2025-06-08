import React, { useEffect, useState } from 'react';

import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '../navigation/index';
import { convertSpeedToKmh, LocationData } from '../services/location-service';
import { useLocationService } from '../hooks/useLocationService';

const LocationScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { currentLocation, isTracking, startTracking, stopTracking, isLocationEnabled } =
    useLocationService();
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);

  const [totalDistance, setTotalDistance] = useState(0);
  const [averageSpeed, setAverageSpeed] = useState(0);

  // 위치 기록 추가
  useEffect(() => {
    if (currentLocation) {
      setLocationHistory(prev => [currentLocation, ...prev].slice(0, 50)); // 최대 50개 기록
    }
  }, [currentLocation]);

  // 총 이동 거리 및 평균 속도 계산
  useEffect(() => {
    if (locationHistory.length > 1) {
      let distance = 0;
      let speedSum = 0;
      let speedCount = 0;

      for (let i = 0; i < locationHistory.length - 1; i++) {
        const current = locationHistory[i];
        const previous = locationHistory[i + 1];

        // 거리 계산 (간단한 유클리드 거리)
        const latDiff = current.latitude - previous.latitude;
        const lonDiff = current.longitude - previous.longitude;
        distance += Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111; // 대략적인 km 변환

        if (current.speed) {
          speedSum += convertSpeedToKmh(current.speed);
          speedCount++;
        }
      }

      setTotalDistance(distance);
      setAverageSpeed(speedCount > 0 ? speedSum / speedCount : 0);
    }
  }, [locationHistory]);

  const handleStartTracking = async () => {
    if (!isLocationEnabled) {
      Alert.alert('위치 권한 필요', '위치 추적 기능을 사용하려면 위치 권한이 필요합니다.', [
        { text: '확인' },
      ]);
      return;
    }

    await startTracking();
  };

  const handleStopTracking = () => {
    Alert.alert('위치 추적 중지', '위치 추적을 중지하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '중지', onPress: stopTracking },
    ]);
  };

  const formatCoordinate = (value: number): string => {
    return value.toFixed(6);
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString('ko-KR');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>실시간 위치</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 위치 추적 상태 */}
      <View style={styles.statusContainer}>
        <View
          style={[styles.statusIndicator, { backgroundColor: isTracking ? '#27ae60' : '#e74c3c' }]}
        >
          <Icon name={isTracking ? 'map-marker-check' : 'map-marker-off'} size={20} color="white" />
        </View>
        <Text style={styles.statusText}>{isTracking ? '위치 추적 중' : '위치 추적 중지됨'}</Text>
      </View>

      {/* 현재 위치 정보 */}
      {currentLocation && (
        <View style={styles.locationCard}>
          <Text style={styles.cardTitle}>현재 위치</Text>
          <View style={styles.coordinateRow}>
            <Text style={styles.coordinateLabel}>위도:</Text>
            <Text style={styles.coordinateValue}>{formatCoordinate(currentLocation.latitude)}</Text>
          </View>
          <View style={styles.coordinateRow}>
            <Text style={styles.coordinateLabel}>경도:</Text>
            <Text style={styles.coordinateValue}>
              {formatCoordinate(currentLocation.longitude)}
            </Text>
          </View>
          {currentLocation.speed !== undefined && (
            <View style={styles.coordinateRow}>
              <Text style={styles.coordinateLabel}>속도:</Text>
              <Text style={styles.coordinateValue}>
                {convertSpeedToKmh(currentLocation.speed).toFixed(1)} km/h
              </Text>
            </View>
          )}
          {currentLocation.accuracy && (
            <View style={styles.coordinateRow}>
              <Text style={styles.coordinateLabel}>정확도:</Text>
              <Text style={styles.coordinateValue}>±{currentLocation.accuracy.toFixed(0)}m</Text>
            </View>
          )}
          <View style={styles.coordinateRow}>
            <Text style={styles.coordinateLabel}>업데이트:</Text>
            <Text style={styles.coordinateValue}>{formatTime(currentLocation.timestamp)}</Text>
          </View>
        </View>
      )}

      {/* 이동 통계 */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="map-marker-distance" size={24} color="#3498db" />
          <Text style={styles.statValue}>{totalDistance.toFixed(2)} km</Text>
          <Text style={styles.statLabel}>총 이동거리</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="speedometer" size={24} color="#f39c12" />
          <Text style={styles.statValue}>{averageSpeed.toFixed(1)} km/h</Text>
          <Text style={styles.statLabel}>평균 속도</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="map-marker-multiple" size={24} color="#9b59b6" />
          <Text style={styles.statValue}>{locationHistory.length}</Text>
          <Text style={styles.statLabel}>기록된 위치</Text>
        </View>
      </View>

      {/* 위치 기록 목록 */}
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>최근 위치 기록</Text>
        {locationHistory.slice(0, 5).map((loc, index) => (
          <View key={loc.timestamp} style={styles.historyItem}>
            <View style={styles.historyInfo}>
              <Text style={styles.historyCoordinate}>
                {formatCoordinate(loc.latitude)}, {formatCoordinate(loc.longitude)}
              </Text>
              <Text style={styles.historyTime}>{formatTime(loc.timestamp)}</Text>
            </View>
            {loc.speed && (
              <Text style={styles.historySpeed}>
                {convertSpeedToKmh(loc.speed).toFixed(1)} km/h
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* 제어 버튼 */}
      <View style={styles.buttonContainer}>
        {!isTracking ? (
          <TouchableOpacity
            style={[styles.controlButton, styles.startButton]}
            onPress={handleStartTracking}
          >
            <Icon name="play" size={20} color="white" />
            <Text style={styles.buttonText}>추적 시작</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.controlButton, styles.stopButton]}
            onPress={handleStopTracking}
          >
            <Icon name="stop" size={20} color="white" />
            <Text style={styles.buttonText}>추적 중지</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  locationCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  coordinateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  coordinateLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  coordinateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  historyContainer: {
    flex: 1,
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyInfo: {
    flex: 1,
  },
  historyCoordinate: {
    fontSize: 12,
    color: '#2c3e50',
    fontFamily: 'monospace',
  },
  historyTime: {
    fontSize: 11,
    color: '#7f8c8d',
    marginTop: 2,
  },
  historySpeed: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 16,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButton: {
    backgroundColor: '#27ae60',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default LocationScreen;
