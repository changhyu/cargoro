import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';

import { IntegratedRootStackParamList } from '../../types/integrated-navigation';
import integratedNavigationService from '../../services/integrated-navigation-service';
import {
  getDiagnosticData,
  getVehicleStatus,
  connectToOBD,
  analyzeMaintenanceNeeds,
  startVehicleDataStream,
} from '../../utils/obd-connector';
import NotificationPermissionBanner from '../../components/notification-permission-banner';

type SmartHomeScreenProps = StackNavigationProp<IntegratedRootStackParamList, 'Navigation'>;

interface VehicleData {
  rpm: number;
  speed: number;
  engineTemp: number;
  fuelLevel: number;
  batteryVoltage?: number;
  tirePressure?: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  diagnosticTroubleCodes: string[];
}

interface MaintenanceAlert {
  type: 'urgent' | 'recommended' | 'scheduled';
  message: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export default function SmartHomeScreen() {
  const navigation = useNavigation<SmartHomeScreenProps>();

  // 상태 관리
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [vehicleStatus, setVehicleStatus] = useState<any>(null);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<MaintenanceAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('위치 정보 로딩 중...');
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);

  // OBD 연결 및 초기 데이터 로드
  useEffect(() => {
    initializeConnection();
  }, []);

  // 실시간 데이터 스트리밍
  useEffect(() => {
    if (isConnected) {
      const stopStream = startVehicleDataStream(data => {
        setVehicleData(data);
        updateMaintenanceAlerts(data);
      });

      return stopStream;
    }
  }, [isConnected]);

  const initializeConnection = async () => {
    try {
      setIsLoading(true);

      // OBD 연결 시도
      let connected = false;
      try {
        connected = await connectToOBD();
      } catch (obdError) {
        console.log('OBD 연결 시도 중 오류 발생, 시뮬레이션 모드로 전환:', obdError);
        // 에러를 로그만 하고 계속 진행 (연결 실패로 간주)
      }

      setIsConnected(connected);

      // 연결 성공 또는 실패 상관없이 데이터 로드
      // 연결 실패 시에는 모의 데이터를 사용
      let diagnosticData;
      let status;

      if (connected) {
        // 실제 OBD 데이터 로드 시도
        try {
          [diagnosticData, status] = await Promise.all([getDiagnosticData(), getVehicleStatus()]);
        } catch (dataError) {
          console.log('OBD 데이터 로드 실패, 모의 데이터 사용:', dataError);
          // 실패 시 모의 데이터로 대체
          diagnosticData = getMockDiagnosticData();
          status = getMockVehicleStatus();
        }
      } else {
        // 모의 데이터 사용
        diagnosticData = getMockDiagnosticData();
        status = getMockVehicleStatus();
      }

      setVehicleData(diagnosticData);
      setVehicleStatus(status);
      updateMaintenanceAlerts(diagnosticData);

      // 현재 위치 가져오기
      loadCurrentLocation();
    } catch (error) {
      console.error('초기화 실패:', error);
      // 실패해도 사용자 경험을 위해 모의 데이터 설정
      setVehicleData(getMockDiagnosticData());
      setVehicleStatus(getMockVehicleStatus());
      updateMaintenanceAlerts(getMockDiagnosticData());
    } finally {
      setIsLoading(false);
    }
  };

  // 모의 진단 데이터 생성
  const getMockDiagnosticData = () => {
    return {
      rpm: 1200,
      speed: 0,
      engineTemp: 85,
      fuelLevel: 75,
      batteryVoltage: 12.8,
      tirePressure: {
        frontLeft: 32,
        frontRight: 32,
        rearLeft: 31,
        rearRight: 31,
      },
      diagnosticTroubleCodes: [],
    };
  };

  // 모의 차량 상태 생성
  const getMockVehicleStatus = () => {
    return {
      isEngineRunning: true,
      isMoving: false,
      isFuelLow: false,
      hasDiagnosticCodes: false,
      batteryHealth: 'good',
    };
  };

  const loadCurrentLocation = async () => {
    try {
      const location = await integratedNavigationService.getCurrentLocation();
      // 실제로는 역지오코딩으로 주소 변환
      setCurrentLocation('서울시 강남구 테헤란로');
    } catch (error) {
      setCurrentLocation('위치 정보 없음');
    }
  };

  const updateMaintenanceAlerts = (data: any) => {
    const analysis = analyzeMaintenanceNeeds(data);
    const alerts: MaintenanceAlert[] = [];

    // 긴급 알림
    analysis.urgent.forEach(message => {
      alerts.push({
        type: 'urgent',
        message,
        icon: 'warning',
        color: '#EF4444',
      });
    });

    // 권장 알림
    analysis.recommended.forEach(message => {
      alerts.push({
        type: 'recommended',
        message,
        icon: 'information-circle',
        color: '#F59E0B',
      });
    });

    // 정기 점검
    analysis.scheduled.slice(0, 2).forEach(message => {
      alerts.push({
        type: 'scheduled',
        message,
        icon: 'time',
        color: '#6366F1',
      });
    });

    setMaintenanceAlerts(alerts);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await initializeConnection();
    setRefreshing(false);
  }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'emergency':
        navigation.navigate('EmergencyService');
        break;
      case 'workshop':
        navigation.navigate('WorkshopSearch', {});
        break;
      case 'diagnosis':
        navigation.navigate('SmartDiagnosis', { vehicleId: 'vehicle_1' });
        break;
      case 'navigation':
        navigation.navigate('Navigation');
        break;
    }
  };

  const getEngineStatusColor = () => {
    if (!vehicleData) return '#6B7280';
    if (vehicleData.engineTemp > 105) return '#EF4444';
    if (vehicleData.engineTemp > 95) return '#F59E0B';
    return '#10B981';
  };

  const getFuelLevelColor = () => {
    if (!vehicleData) return '#6B7280';
    if (vehicleData.fuelLevel < 20) return '#EF4444';
    if (vehicleData.fuelLevel < 40) return '#F59E0B';
    return '#10B981';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="car-sport" size={48} color="#6366F1" />
          <Text style={styles.loadingText}>차량 시스템 연결 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 헤더 - 현재 위치 및 날씨 */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={20} color="#6366F1" />
            <Text style={styles.locationText}>{currentLocation}</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* 메인 차량 상태 카드 */}
        <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.mainStatusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>차량 상태</Text>
            <View
              style={[
                styles.connectionStatus,
                { backgroundColor: isConnected ? '#10B981' : '#EF4444' },
              ]}
            >
              <Text style={styles.connectionText}>
                {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
              </Text>
            </View>
          </View>

          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Ionicons name="speedometer" size={24} color="#FFFFFF" />
              <Text style={styles.statusLabel}>속도</Text>
              <Text style={styles.statusValue}>{vehicleData?.speed || 0} km/h</Text>
            </View>
            <View style={styles.statusItem}>
              <Ionicons name="thermometer" size={24} color="#FFFFFF" />
              <Text style={styles.statusLabel}>엔진온도</Text>
              <Text style={[styles.statusValue, { color: getEngineStatusColor() }]}>
                {vehicleData?.engineTemp || 0}°C
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Ionicons name="car-sport" size={24} color="#FFFFFF" />
              <Text style={styles.statusLabel}>연료</Text>
              <Text style={[styles.statusValue, { color: getFuelLevelColor() }]}>
                {vehicleData?.fuelLevel || 0}%
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Ionicons name="battery-charging" size={24} color="#FFFFFF" />
              <Text style={styles.statusLabel}>배터리</Text>
              <Text style={styles.statusValue}>{vehicleData?.batteryVoltage || 12.6}V</Text>
            </View>
          </View>
        </LinearGradient>

        {/* 빠른 액션 버튼 */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>빠른 액션</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
              onPress={() => handleQuickAction('emergency')}
            >
              <Ionicons name="warning" size={24} color="#FFFFFF" />
              <Text style={styles.actionText}>긴급출동</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#10B981' }]}
              onPress={() => handleQuickAction('workshop')}
            >
              <Ionicons name="location" size={24} color="#FFFFFF" />
              <Text style={styles.actionText}>정비소 찾기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#6366F1' }]}
              onPress={() => handleQuickAction('diagnosis')}
            >
              <Ionicons name="analytics" size={24} color="#FFFFFF" />
              <Text style={styles.actionText}>차량진단</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
              onPress={() => handleQuickAction('navigation')}
            >
              <Ionicons name="navigate" size={24} color="#FFFFFF" />
              <Text style={styles.actionText}>네비게이션</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 정비 알림 */}
        {maintenanceAlerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>정비 알림</Text>
            {maintenanceAlerts.map((alert, index) => (
              <TouchableOpacity key={index} style={styles.alertCard}>
                <Ionicons name={alert.icon} size={20} color={alert.color} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  <Text style={[styles.alertType, { color: alert.color }]}>
                    {alert.type === 'urgent'
                      ? '긴급'
                      : alert.type === 'recommended'
                        ? '권장'
                        : '정기점검'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 실시간 네비게이션 미리보기 */}
        <TouchableOpacity
          style={styles.navigationPreview}
          onPress={() => navigation.navigate('Navigation')}
        >
          <View style={styles.navHeader}>
            <Ionicons name="map" size={24} color="#6366F1" />
            <Text style={styles.navTitle}>스마트 네비게이션</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
          <Text style={styles.navDescription}>실시간 교통정보와 최적 경로를 제공합니다</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  settingsButton: {
    padding: 8,
  },
  mainStatusCard: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  connectionStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 12,
    color: '#E5E7EB',
    marginTop: 8,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  alertsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertMessage: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  alertType: {
    fontSize: 12,
    fontWeight: '600',
  },
  navigationPreview: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  navTitle: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  navDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
});
