import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../../../App';
import { ServiceCategory, VehicleDiagnosticData } from '../../types/integrated-navigation';
import integratedNavigationService from '../../services/integrated-navigation-service';
import { getDiagnosticData, getVehicleStatus, connectToOBD } from '../../utils/obd-connector';

type ServiceHubScreenProps = StackNavigationProp<RootStackParamList>;

export default function ServiceHubScreen() {
  const navigation = useNavigation<ServiceHubScreenProps>();

  // 상태 관리
  const [diagnosticData, setDiagnosticData] = useState<VehicleDiagnosticData | null>(null);

  // 서비스 카테고리 정의
  const serviceCategories: ServiceCategory[] = [
    {
      id: 'maintenance_booking',
      name: '정비 예약',
      icon: 'calendar-outline',
      description: '정기점검 및 수리 예약',
    },
    {
      id: 'workshop_search',
      name: '정비소 찾기',
      icon: 'location-outline',
      description: '주변 정비소 검색',
    },
    {
      id: 'emergency_service',
      name: '긴급 서비스',
      icon: 'warning-outline',
      description: '24시간 긴급출동',
      isEmergency: true,
    },
    {
      id: 'smart_diagnosis',
      name: '스마트 진단',
      icon: 'analytics-outline',
      description: 'AI 기반 차량 진단',
    },
    {
      id: 'maintenance_history',
      name: '정비 이력',
      icon: 'document-text-outline',
      description: '과거 정비 기록 조회',
    },
    {
      id: 'parts_order',
      name: '부품 주문',
      icon: 'cube-outline',
      description: '자동차 부품 온라인 주문',
    },
  ];

  // 차량 진단 데이터 로드
  useEffect(() => {
    const loadDiagnosticData = async () => {
      try {
        // OBD 연결 시도
        const connected = await connectToOBD();

        if (connected) {
          // OBD에서 실시간 데이터 가져오기
          await getVehicleStatus();
          const diagnostics = await getDiagnosticData();

          // 진단 데이터를 VehicleDiagnosticData 형식으로 변환
          const transformedData: VehicleDiagnosticData = {
            vehicleId: 'vehicle_1',
            timestamp: new Date(),
            batteryLevel: diagnostics?.batteryVoltage
              ? Math.round((diagnostics.batteryVoltage / 14.4) * 100)
              : 85,
            engineStatus: diagnostics?.engineTemp < 90 ? 'good' : 'warning',
            fuelLevel: diagnostics?.fuelLevel || 65,
            mileage: 45000,
            oilPressure: 40, // OBD에서 직접 제공되지 않으므로 기본값 사용
            coolantTemperature: diagnostics?.engineTemp || 85,
            tirePressure: diagnostics?.tirePressure || {
              frontLeft: 32,
              frontRight: 32,
              rearLeft: 30,
              rearRight: 30,
            },
            diagnosticCodes: diagnostics?.diagnosticTroubleCodes || [],
            maintenanceRecommendations: [],
          };

          setDiagnosticData(transformedData);
        } else {
          // OBD 연결 실패 시 기본 데이터 사용
          const data = await integratedNavigationService.getVehicleDiagnostics('vehicle_1');
          setDiagnosticData(data);
        }
      } catch (error) {
        console.error('진단 데이터 로드 실패:', error);
        // 에러 시 기본 데이터 사용
        try {
          const data = await integratedNavigationService.getVehicleDiagnostics('vehicle_1');
          setDiagnosticData(data);
        } catch (fallbackError) {
          console.error('기본 데이터 로드도 실패:', fallbackError);
        }
      }
    };

    loadDiagnosticData();
  }, []);

  // 서비스 카테고리 선택 처리
  const handleServiceSelection = (serviceId: string) => {
    switch (serviceId) {
      case 'maintenance_booking':
        (navigation as any).navigate('MaintenanceBooking');
        break;
      case 'workshop_search':
        (navigation as any).navigate('WorkshopSearch', {});
        break;
      case 'emergency_service':
        (navigation as any).navigate('EmergencyService');
        break;
      case 'smart_diagnosis':
        (navigation as any).navigate('SmartDiagnosis', { vehicleId: 'vehicle_1' });
        break;
      case 'maintenance_history':
        (navigation as any).navigate('MaintenanceHistory');
        break;
      case 'parts_order':
        Alert.alert('준비중', '부품 주문 기능은 준비 중입니다.');
        break;
      default:
        Alert.alert('알림', '해당 서비스는 준비 중입니다.');
    }
  };

  // 긴급 서비스 호출
  const handleEmergencyCall = () => {
    Alert.alert('긴급 출동 서비스', '24시간 긴급 출동 서비스를 호출하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '호출하기',
        style: 'destructive',
        onPress: () => (navigation as any).navigate('EmergencyService'),
      },
    ]);
  };

  // 차량 상태 텍스트 가져오기
  const getStatusText = (status: string) => {
    switch (status) {
      case 'good':
        return '양호';
      case 'warning':
        return '주의';
      case 'critical':
        return '위험';
      default:
        return '알 수 없음';
    }
  };

  // 차량 상태에 따른 경고 색상 결정
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'critical':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>서비스 허브</Text>
          <TouchableOpacity onPress={handleEmergencyCall} style={styles.emergencyButton}>
            <Ionicons name="call" size={20} color="#FFFFFF" />
            <Text style={styles.emergencyText}>긴급호출</Text>
          </TouchableOpacity>
        </View>

        {/* 차량 상태 요약 */}
        {diagnosticData && (
          <View style={styles.vehicleStatusCard}>
            <View style={styles.statusHeader}>
              <Ionicons name="car-sport" size={24} color="#6366F1" />
              <Text style={styles.statusTitle}>차량 상태</Text>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: getStatusColor(diagnosticData.engineStatus) },
                ]}
              >
                <Text style={styles.statusText}>{getStatusText(diagnosticData.engineStatus)}</Text>
              </View>
            </View>

            <View style={styles.statusGrid}>
              <View style={styles.statusItem}>
                <Ionicons name="battery-half" size={20} color="#6B7280" />
                <Text style={styles.statusLabel}>배터리</Text>
                <Text style={styles.statusValue}>{diagnosticData.batteryLevel}%</Text>
              </View>
              <View style={styles.statusItem}>
                <Ionicons name="speedometer" size={20} color="#6B7280" />
                <Text style={styles.statusLabel}>연료</Text>
                <Text style={styles.statusValue}>{diagnosticData.fuelLevel}%</Text>
              </View>
              <View style={styles.statusItem}>
                <Ionicons name="thermometer" size={20} color="#6B7280" />
                <Text style={styles.statusLabel}>냉각수</Text>
                <Text style={styles.statusValue}>{diagnosticData.coolantTemperature}°C</Text>
              </View>
            </View>

            {diagnosticData.maintenanceRecommendations.length > 0 && (
              <View style={styles.recommendationBanner}>
                <Ionicons name="information-circle" size={20} color="#F59E0B" />
                <Text style={styles.recommendationText}>
                  {diagnosticData.maintenanceRecommendations[0].description}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 서비스 메뉴 */}
        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>정비 서비스</Text>
          <View style={styles.servicesGrid}>
            {serviceCategories.map(service => (
              <TouchableOpacity
                key={service.id}
                style={[styles.serviceCard, service.isEmergency && styles.emergencyServiceCard]}
                onPress={() => handleServiceSelection(service.id)}
              >
                <View
                  style={[
                    styles.serviceIconContainer,
                    service.isEmergency && styles.emergencyIconContainer,
                  ]}
                >
                  <Ionicons
                    name={service.icon as any}
                    size={28}
                    color={service.isEmergency ? '#FFFFFF' : '#6366F1'}
                  />
                </View>
                <Text
                  style={[styles.serviceName, service.isEmergency && styles.emergencyServiceName]}
                >
                  {service.name}
                </Text>
                <Text
                  style={[
                    styles.serviceDescription,
                    service.isEmergency && styles.emergencyServiceDescription,
                  ]}
                >
                  {service.description}
                </Text>
                {service.isEmergency && (
                  <View style={styles.emergencyBadge}>
                    <Text style={styles.emergencyBadgeText}>24시간</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 최근 서비스 이력 */}
        <View style={styles.recentServicesContainer}>
          <Text style={styles.sectionTitle}>최근 서비스</Text>
          <TouchableOpacity
            style={styles.historyCard}
            onPress={() => (navigation as any).navigate('MaintenanceHistory')}
          >
            <View style={styles.historyHeader}>
              <Ionicons name="construct" size={20} color="#6366F1" />
              <Text style={styles.historyTitle}>정기점검</Text>
              <Text style={styles.historyDate}>2024.01.15</Text>
            </View>
            <Text style={styles.historyDescription}>
              엔진오일 교체, 에어필터 교체, 전체 점검 완료
            </Text>
            <View style={styles.historyFooter}>
              <Text style={styles.historyWorkshop}>스마트카 정비소</Text>
              <Text style={styles.historyCost}>₩150,000</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>전체 이력 보기</Text>
            <Ionicons name="chevron-forward" size={16} color="#6366F1" />
          </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emergencyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  vehicleStatusCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
    flex: 1,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 2,
  },
  recommendationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
  },
  servicesContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emergencyServiceCard: {
    backgroundColor: '#EF4444',
    width: '100%',
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  emergencyServiceName: {
    color: '#FFFFFF',
  },
  serviceDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  emergencyServiceDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  emergencyBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  emergencyBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  recentServicesContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  historyDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  historyDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyWorkshop: {
    fontSize: 12,
    color: '#6B7280',
  },
  historyCost: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
    marginRight: 4,
  },
});
