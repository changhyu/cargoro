import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { EmergencyService } from '../../types/integrated-navigation';
import integratedNavigationService from '../../services/integrated-navigation-service';

export default function EmergencyServiceScreen() {
  const navigation = useNavigation();

  // 상태 관리
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isRequestingService, setIsRequestingService] = useState(false);

  // 긴급 서비스 목록
  const emergencyServices: EmergencyService[] = [
    {
      id: 'towing',
      type: 'towing',
      description: '차량 견인 서비스',
      estimatedArrival: 25,
      cost: 80000,
      provider: {
        name: '24시간 긴급견인',
        phone: '1588-1234',
        rating: 4.8,
      },
    },
    {
      id: 'battery_jump',
      type: 'battery_jump',
      description: '배터리 방전 점프 서비스',
      estimatedArrival: 15,
      cost: 30000,
      provider: {
        name: '스마트 배터리 서비스',
        phone: '1588-2345',
        rating: 4.7,
      },
    },
    {
      id: 'tire_change',
      type: 'tire_change',
      description: '타이어 교체/수리 서비스',
      estimatedArrival: 20,
      cost: 50000,
      provider: {
        name: '이동타이어 서비스',
        phone: '1588-3456',
        rating: 4.6,
      },
    },
    {
      id: 'lockout',
      type: 'lockout',
      description: '차량 열쇠 분실/잠김 해결',
      estimatedArrival: 18,
      cost: 60000,
      provider: {
        name: '24시간 열쇠 서비스',
        phone: '1588-4567',
        rating: 4.9,
      },
    },
    {
      id: 'fuel_delivery',
      type: 'fuel_delivery',
      description: '연료 부족 시 연료 배달',
      estimatedArrival: 22,
      cost: 25000,
      provider: {
        name: '이동주유 서비스',
        phone: '1588-5678',
        rating: 4.5,
      },
    },
  ];

  // 현재 위치 가져오기
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const location = await integratedNavigationService.getCurrentLocation();
        setCurrentLocation(location);
      } catch (error) {
        console.error('현재 위치 가져오기 실패:', error);
        Alert.alert('위치 오류', '현재 위치를 가져올 수 없습니다.');
      }
    };

    getCurrentLocation();
  }, []);

  // 서비스 아이콘 가져오기
  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'towing':
        return 'car-outline';
      case 'battery_jump':
        return 'flash-outline';
      case 'tire_change':
        return 'ellipse-outline';
      case 'lockout':
        return 'key-outline';
      case 'fuel_delivery':
        return 'water-outline';
      default:
        return 'build-outline';
    }
  };

  // 서비스 요청 처리
  const handleServiceRequest = async (service: EmergencyService) => {
    if (!currentLocation) {
      Alert.alert('위치 오류', '현재 위치를 확인할 수 없습니다.');
      return;
    }

    Alert.alert(
      '긴급 서비스 요청',
      `${service.description}\n\n예상 소요시간: ${service.estimatedArrival}분\n예상 비용: ₩${service.cost.toLocaleString()}\n\n서비스를 요청하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '요청하기',
          style: 'destructive',
          onPress: () => processServiceRequest(service),
        },
      ]
    );
  };

  // 서비스 요청 처리
  const processServiceRequest = async (service: EmergencyService) => {
    setIsRequestingService(true);
    setSelectedService(service.id);

    try {
      // 실제로는 서버에 요청을 보내야 함
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        '요청 완료',
        `${service.description} 요청이 완료되었습니다.\n\n담당자: ${service.provider.name}\n연락처: ${service.provider.phone}\n예상 도착시간: ${service.estimatedArrival}분`,
        [
          { text: '확인' },
          {
            text: '전화걸기',
            onPress: () => handleCall(service.provider.phone),
          },
        ]
      );
    } catch (error) {
      Alert.alert('오류', '서비스 요청 중 오류가 발생했습니다.');
    } finally {
      setIsRequestingService(false);
      setSelectedService(null);
    }
  };

  // 전화 걸기
  const handleCall = (phoneNumber: string) => {
    const cleanPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${cleanPhoneNumber}`);
  };

  // 긴급 신고 (112, 119)
  const handleEmergencyCall = (number: string) => {
    Alert.alert('긴급 신고', `${number}에 전화를 걸겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '전화걸기',
        style: 'destructive',
        onPress: () => Linking.openURL(`tel:${number}`),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>긴급 서비스</Text>
          <View style={styles.placeholder} />
        </View>

        {/* 긴급 신고 버튼들 */}
        <View style={styles.emergencyCallsContainer}>
          <Text style={styles.sectionTitle}>긴급 신고</Text>
          <View style={styles.emergencyCallsRow}>
            <TouchableOpacity
              style={[styles.emergencyCallButton, { backgroundColor: '#EF4444' }]}
              onPress={() => handleEmergencyCall('112')}
            >
              <Ionicons name="shield" size={24} color="#FFFFFF" />
              <Text style={styles.emergencyCallText}>112</Text>
              <Text style={styles.emergencyCallSubText}>경찰서</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.emergencyCallButton, { backgroundColor: '#F59E0B' }]}
              onPress={() => handleEmergencyCall('119')}
            >
              <Ionicons name="flame" size={24} color="#FFFFFF" />
              <Text style={styles.emergencyCallText}>119</Text>
              <Text style={styles.emergencyCallSubText}>소방서</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 위치 정보 */}
        <View style={styles.locationContainer}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={20} color="#6366F1" />
            <Text style={styles.locationTitle}>현재 위치</Text>
          </View>
          {currentLocation ? (
            <Text style={styles.locationText}>
              위도: {currentLocation.latitude.toFixed(6)}, 경도:{' '}
              {currentLocation.longitude.toFixed(6)}
            </Text>
          ) : (
            <Text style={styles.locationError}>위치 정보를 가져오는 중...</Text>
          )}
        </View>

        {/* 긴급 서비스 목록 */}
        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>긴급 출동 서비스</Text>
          {emergencyServices.map(service => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                selectedService === service.id && styles.selectedServiceCard,
              ]}
              onPress={() => handleServiceRequest(service)}
              disabled={isRequestingService}
            >
              <View style={styles.serviceHeader}>
                <View style={styles.serviceIconContainer}>
                  <Ionicons name={getServiceIcon(service.type) as any} size={24} color="#6366F1" />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.description}</Text>
                  <Text style={styles.serviceProvider}>{service.provider.name}</Text>
                </View>
                <View style={styles.serviceActions}>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCall(service.provider.phone)}
                  >
                    <Ionicons name="call" size={16} color="#10B981" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.serviceDetails}>
                <View style={styles.serviceDetailItem}>
                  <Ionicons name="time-outline" size={16} color="#6B7280" />
                  <Text style={styles.serviceDetailText}>약 {service.estimatedArrival}분</Text>
                </View>
                <View style={styles.serviceDetailItem}>
                  <Ionicons name="card-outline" size={16} color="#6B7280" />
                  <Text style={styles.serviceDetailText}>₩{service.cost.toLocaleString()}</Text>
                </View>
                <View style={styles.serviceDetailItem}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={styles.serviceDetailText}>{service.provider.rating}</Text>
                </View>
              </View>

              {isRequestingService && selectedService === service.id && (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>요청 처리 중...</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* 주의사항 */}
        <View style={styles.noticeContainer}>
          <View style={styles.noticeHeader}>
            <Ionicons name="information-circle" size={20} color="#F59E0B" />
            <Text style={styles.noticeTitle}>주의사항</Text>
          </View>
          <Text style={styles.noticeText}>
            • 긴급 서비스는 24시간 운영됩니다{'\n'}• 서비스 요청 후 취소 시 취소 수수료가 발생할 수
            있습니다{'\n'}• 실제 도착 시간과 비용은 상황에 따라 달라질 수 있습니다{'\n'}• 생명이
            위험한 응급상황에서는 즉시 119에 신고하세요
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 24,
  },
  emergencyCallsContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  emergencyCallsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  emergencyCallButton: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    minWidth: 100,
  },
  emergencyCallText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  emergencyCallSubText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
  locationContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  locationError: {
    fontSize: 14,
    color: '#EF4444',
  },
  servicesContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  serviceCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedServiceCard: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  serviceProvider: {
    fontSize: 12,
    color: '#6B7280',
  },
  serviceActions: {
    flexDirection: 'row',
  },
  callButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceDetailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  loadingContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  noticeContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 20,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 8,
  },
  noticeText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
