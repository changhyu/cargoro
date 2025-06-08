import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import {
  IntegratedRootStackParamList,
  NavigationLocation,
  NavigationRoute,
} from '../../types/integrated-navigation';
import integratedNavigationService from '../../services/integrated-navigation-service';

type MapDetailScreenProps = StackNavigationProp<IntegratedRootStackParamList, 'MapDetail'>;
type MapDetailRouteProps = RouteProp<IntegratedRootStackParamList, 'MapDetail'>;

export default function MapDetailScreen() {
  const navigation = useNavigation<MapDetailScreenProps>();
  const route = useRoute<MapDetailRouteProps>();

  // 상태 관리
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [calculatedRoute, setCalculatedRoute] = useState<NavigationRoute | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const { destination } = route.params;

  // 현재 위치 가져오기 및 경로 계산
  useEffect(() => {
    const initializeMap = async () => {
      try {
        // 현재 위치 가져오기
        const location = await integratedNavigationService.getCurrentLocation();
        setCurrentLocation(location);

        // 목적지가 있으면 경로 계산
        if (destination) {
          setIsCalculatingRoute(true);

          const origin: NavigationLocation = {
            id: 'current',
            name: '현재 위치',
            address: '현재 위치',
            latitude: location.latitude,
            longitude: location.longitude,
          };

          const dest: NavigationLocation = {
            id: 'destination',
            name: destination.name,
            address: destination.name,
            latitude: destination.latitude,
            longitude: destination.longitude,
          };

          const route = await integratedNavigationService.calculateRoute(origin, dest);
          setCalculatedRoute(route);
        }
      } catch (error) {
        console.error('지도 초기화 실패:', error);
        Alert.alert('오류', '지도를 초기화하는 중 오류가 발생했습니다.');
      } finally {
        setIsCalculatingRoute(false);
      }
    };

    initializeMap();
  }, [destination]);

  // 네비게이션 시작
  const handleStartNavigation = () => {
    if (!calculatedRoute) {
      Alert.alert('오류', '경로 정보가 없습니다.');
      return;
    }

    Alert.alert(
      '네비게이션 시작',
      `${destination?.name}까지 안내를 시작하시겠습니까?\n\n예상 거리: ${(calculatedRoute.distance / 1000).toFixed(1)}km\n예상 시간: ${Math.round(calculatedRoute.duration / 60)}분`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '시작',
          onPress: () => {
            setIsNavigating(true);
            // 실제 네비게이션 시작 로직
            Alert.alert('네비게이션', '네비게이션이 시작되었습니다.');
          },
        },
      ]
    );
  };

  // 네비게이션 중지
  const handleStopNavigation = () => {
    Alert.alert('네비게이션 중지', '네비게이션을 중지하시겠습니까?', [
      { text: '계속', style: 'cancel' },
      {
        text: '중지',
        style: 'destructive',
        onPress: () => setIsNavigating(false),
      },
    ]);
  };

  // 즐겨찾기 추가
  const handleAddToFavorites = async () => {
    if (!destination) return;

    try {
      const location: NavigationLocation = {
        id: `fav_${Date.now()}`,
        name: destination.name,
        address: destination.name,
        latitude: destination.latitude,
        longitude: destination.longitude,
      };

      await integratedNavigationService.addFavoriteLocation(location);
      Alert.alert('완료', '즐겨찾기에 추가되었습니다.');
    } catch (error) {
      Alert.alert('오류', '즐겨찾기 추가에 실패했습니다.');
    }
  };

  // 교통상황에 따른 색상
  const getTrafficColor = (status: string) => {
    switch (status) {
      case 'smooth':
        return '#10B981';
      case 'normal':
        return '#F59E0B';
      case 'congested':
        return '#EF4444';
      case 'blocked':
        return '#7C3AED';
      default:
        return '#6B7280';
    }
  };

  const getTrafficText = (status: string) => {
    switch (status) {
      case 'smooth':
        return '원활';
      case 'normal':
        return '보통';
      case 'congested':
        return '정체';
      case 'blocked':
        return '차단';
      default:
        return '알 수 없음';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>지도</Text>
        <TouchableOpacity onPress={handleAddToFavorites}>
          <Ionicons name="heart-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* 지도 영역 (실제 구현에서는 MapView 컴포넌트 사용) */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={80} color="#9CA3AF" />
          <Text style={styles.mapPlaceholderText}>지도 영역</Text>
          {destination && (
            <View style={styles.destinationInfo}>
              <Ionicons name="location" size={20} color="#EF4444" />
              <Text style={styles.destinationName}>{destination.name}</Text>
            </View>
          )}
        </View>
      </View>

      {/* 경로 정보 */}
      {isCalculatingRoute && (
        <View style={styles.routeInfoContainer}>
          <Text style={styles.calculatingText}>경로 계산 중...</Text>
        </View>
      )}

      {calculatedRoute && !isCalculatingRoute && (
        <View style={styles.routeInfoContainer}>
          <View style={styles.routeHeader}>
            <View style={styles.routeDetails}>
              <Text style={styles.routeDistance}>
                {(calculatedRoute.distance / 1000).toFixed(1)}km
              </Text>
              <Text style={styles.routeDuration}>
                약 {Math.round(calculatedRoute.duration / 60)}분
              </Text>
            </View>
            <View
              style={[
                styles.trafficStatus,
                { backgroundColor: getTrafficColor(calculatedRoute.trafficStatus) },
              ]}
            >
              <Text style={styles.trafficStatusText}>
                {getTrafficText(calculatedRoute.trafficStatus)}
              </Text>
            </View>
          </View>

          <View style={styles.routePath}>
            <View style={styles.pathItem}>
              <Ionicons name="radio-button-on" size={16} color="#10B981" />
              <Text style={styles.pathText}>출발지: 현재 위치</Text>
            </View>
            <View style={styles.pathLine} />
            <View style={styles.pathItem}>
              <Ionicons name="location" size={16} color="#EF4444" />
              <Text style={styles.pathText}>도착지: {destination?.name}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 네비게이션 상태 */}
      {isNavigating && (
        <View style={styles.navigationStatus}>
          <View style={styles.navigationHeader}>
            <Ionicons name="navigate" size={20} color="#FFFFFF" />
            <Text style={styles.navigationText}>네비게이션 진행 중</Text>
          </View>
          <Text style={styles.navigationSubText}>
            목적지까지 {calculatedRoute && Math.round(calculatedRoute.duration / 60)}분 남음
          </Text>
        </View>
      )}

      {/* 액션 버튼들 */}
      <View style={styles.actionButtonsContainer}>
        {!isNavigating ? (
          <TouchableOpacity
            style={styles.startNavigationButton}
            onPress={handleStartNavigation}
            disabled={!calculatedRoute}
          >
            <Ionicons name="play" size={20} color="#FFFFFF" />
            <Text style={styles.startNavigationText}>네비게이션 시작</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopNavigationButton} onPress={handleStopNavigation}>
            <Ionicons name="stop" size={20} color="#FFFFFF" />
            <Text style={styles.stopNavigationText}>네비게이션 중지</Text>
          </TouchableOpacity>
        )}

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="refresh" size={20} color="#6366F1" />
            <Text style={styles.actionButtonText}>경로 재검색</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color="#6366F1" />
            <Text style={styles.actionButtonText}>공유</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  destinationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  destinationName: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 8,
    fontWeight: '500',
  },
  routeInfoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  calculatingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeDetails: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  routeDistance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 12,
  },
  routeDuration: {
    fontSize: 16,
    color: '#6B7280',
  },
  trafficStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trafficStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  routePath: {
    paddingLeft: 8,
  },
  pathItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pathText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 8,
  },
  pathLine: {
    width: 2,
    height: 16,
    backgroundColor: '#D1D5DB',
    marginLeft: 7,
    marginVertical: 4,
  },
  navigationStatus: {
    backgroundColor: '#6366F1',
    padding: 16,
    margin: 20,
    borderRadius: 12,
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  navigationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  navigationSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  actionButtonsContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  startNavigationButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  startNavigationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  stopNavigationButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  stopNavigationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
});
