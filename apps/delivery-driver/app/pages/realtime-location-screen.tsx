import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Feather';
import { useLocationService } from '../hooks/useLocationService';
import { useDeliveryStore } from '../state/delivery-store';

export default function RealtimeLocationScreen() {
  const mapRef = useRef<MapView>(null);
  const {
    currentLocation,
    isLocationEnabled,
    isTracking,
    error,
    requestLocationPermission,
    startTracking,
    stopTracking,
    getCurrentLocation,
  } = useLocationService();

  const { currentDelivery, updateDeliveryLocation } = useDeliveryStore();
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(true);

  useEffect(() => {
    // 화면 진입 시 위치 권한 확인 및 현재 위치 가져오기
    const initLocation = async () => {
      if (!isLocationEnabled) {
        const granted = await requestLocationPermission();
        if (granted) {
          await getCurrentLocation();
        }
      } else {
        await getCurrentLocation();
      }
    };

    initLocation();
  }, []);

  useEffect(() => {
    // 현재 진행 중인 배송이 있을 때만 위치 추적 시작
    if (currentDelivery?.status === 'in_progress' && !isTracking) {
      startTracking();
    }

    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, [currentDelivery]);

  useEffect(() => {
    // 위치가 업데이트될 때마다 서버에 전송
    if (currentLocation && currentDelivery?.status === 'in_progress') {
      updateDeliveryLocation(
        currentDelivery.id,
        currentLocation.latitude,
        currentLocation.longitude
      );
    }
  }, [currentLocation]);

  const handleCenterToLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleStartStopTracking = async () => {
    if (isTracking) {
      stopTracking();
      Alert.alert('위치 추적 중지', '실시간 위치 추적이 중지되었습니다.');
    } else {
      if (!currentDelivery) {
        Alert.alert('알림', '진행 중인 배송이 없습니다.');
        return;
      }
      await startTracking();
      Alert.alert('위치 추적 시작', '실시간 위치 추적이 시작되었습니다.');
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={getCurrentLocation}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>위치 정보를 가져오는 중...</Text>
      </View>
    );
  }

  const routeCoordinates = currentDelivery
    ? [
        {
          latitude: currentDelivery.pickupLatitude,
          longitude: currentDelivery.pickupLongitude,
        },
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        },
        {
          latitude: currentDelivery.deliveryLatitude,
          longitude: currentDelivery.deliveryLongitude,
        },
      ]
    : [];

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {/* 현재 위치 마커 */}
        <Marker
          coordinate={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          }}
          title="현재 위치"
          description={`속도: ${currentLocation.speed ? `${(currentLocation.speed * 3.6).toFixed(1)} km/h` : '측정 중'}`}
        >
          <View style={styles.currentLocationMarker}>
            <Icon name="navigation" size={20} color="#3B82F6" />
          </View>
        </Marker>

        {/* 배송 경로 및 마커 */}
        {currentDelivery && (
          <>
            {/* 픽업 위치 마커 */}
            <Marker
              coordinate={{
                latitude: currentDelivery.pickupLatitude,
                longitude: currentDelivery.pickupLongitude,
              }}
              title="픽업 위치"
              description={currentDelivery.pickupAddress}
            >
              <View style={styles.pickupMarker}>
                <Icon name="map-pin" size={20} color="#10B981" />
              </View>
            </Marker>

            {/* 배송 위치 마커 */}
            <Marker
              coordinate={{
                latitude: currentDelivery.deliveryLatitude,
                longitude: currentDelivery.deliveryLongitude,
              }}
              title="배송 위치"
              description={currentDelivery.deliveryAddress}
            >
              <View style={styles.deliveryMarker}>
                <Icon name="flag" size={20} color="#EF4444" />
              </View>
            </Marker>

            {/* 경로 표시 */}
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#3B82F6"
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          </>
        )}
      </MapView>

      {/* 지도 컨트롤 버튼 */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleCenterToLocation}>
          <Icon name="crosshair" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* 추적 상태 표시 */}
      <View style={styles.trackingStatus}>
        <View
          style={[styles.statusIndicator, { backgroundColor: isTracking ? '#10B981' : '#6B7280' }]}
        />
        <Text style={styles.statusText}>{isTracking ? '위치 추적 중' : '위치 추적 중지됨'}</Text>
      </View>

      {/* 하단 정보 패널 */}
      <View style={styles.bottomPanel}>
        {currentDelivery && showDeliveryInfo && (
          <TouchableOpacity
            style={styles.deliveryInfoCard}
            onPress={() => setShowDeliveryInfo(false)}
          >
            <View style={styles.deliveryInfoHeader}>
              <Text style={styles.deliveryInfoTitle}>현재 배송</Text>
              <Icon name="x" size={20} color="#6B7280" />
            </View>
            <Text style={styles.customerName}>{currentDelivery.customerName}</Text>
            <Text style={styles.vehicleNumber}>{currentDelivery.vehicleNumber}</Text>
            <View style={styles.addressContainer}>
              <View style={styles.addressRow}>
                <Icon name="map-pin" size={14} color="#10B981" />
                <Text style={styles.addressText} numberOfLines={1}>
                  {currentDelivery.pickupAddress}
                </Text>
              </View>
              <View style={styles.addressRow}>
                <Icon name="flag" size={14} color="#EF4444" />
                <Text style={styles.addressText} numberOfLines={1}>
                  {currentDelivery.deliveryAddress}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* 위치 정보 */}
        <View style={styles.locationInfo}>
          <View style={styles.locationInfoRow}>
            <Text style={styles.locationLabel}>위도:</Text>
            <Text style={styles.locationValue}>{currentLocation.latitude.toFixed(6)}</Text>
          </View>
          <View style={styles.locationInfoRow}>
            <Text style={styles.locationLabel}>경도:</Text>
            <Text style={styles.locationValue}>{currentLocation.longitude.toFixed(6)}</Text>
          </View>
          {currentLocation.speed !== undefined && (
            <View style={styles.locationInfoRow}>
              <Text style={styles.locationLabel}>속도:</Text>
              <Text style={styles.locationValue}>
                {(currentLocation.speed * 3.6).toFixed(1)} km/h
              </Text>
            </View>
          )}
          {currentLocation.accuracy !== undefined && (
            <View style={styles.locationInfoRow}>
              <Text style={styles.locationLabel}>정확도:</Text>
              <Text style={styles.locationValue}>±{currentLocation.accuracy.toFixed(0)}m</Text>
            </View>
          )}
        </View>

        {/* 추적 제어 버튼 */}
        <TouchableOpacity
          style={[styles.trackingButton, { backgroundColor: isTracking ? '#EF4444' : '#3B82F6' }]}
          onPress={handleStartStopTracking}
        >
          <Icon name={isTracking ? 'pause' : 'play'} size={20} color="#FFFFFF" />
          <Text style={styles.trackingButtonText}>{isTracking ? '추적 중지' : '추적 시작'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  mapControls: {
    position: 'absolute',
    top: 50,
    right: 16,
  },
  controlButton: {
    backgroundColor: '#FFFFFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackingStatus: {
    position: 'absolute',
    top: 50,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  deliveryInfoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  deliveryInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  vehicleNumber: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  addressContainer: {
    gap: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 12,
    color: '#4B5563',
    marginLeft: 6,
    flex: 1,
  },
  locationInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  locationInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 4,
  },
  locationValue: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '500',
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  trackingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  currentLocationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  pickupMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#10B981',
  },
  deliveryMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#EF4444',
  },
});
