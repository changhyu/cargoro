import React, { useState } from 'react';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
// expo-linear-gradient 패키지가 없는 경우 임시로 View로 대체
// import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList } from '../types/navigation';

// 네비게이션 타입 정의
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// 임시 차량 데이터
const VEHICLE_DATA = {
  id: 'v1',
  make: '현대',
  model: '아이오닉 5',
  year: 2024,
  licensePlate: '서울 가 1234',
  fuelType: 'EV',
  fuelLevel: 78, // 배터리 잔량 (%)
  mileage: 12580, // 주행 거리 (km)
  status: 'normal', // normal, warning, critical
  location: {
    latitude: 37.5665,
    longitude: 126.978,
    lastUpdated: '2025-05-21T10:30:00Z',
  },
  maintenanceStatus: {
    nextService: '2025-08-15',
    daysRemaining: 86,
    items: [
      { id: 'm1', name: '타이어 교체', dueDate: '2025-09-20', status: 'upcoming' },
      { id: 'm2', name: '브레이크 패드 점검', dueDate: '2025-07-05', status: 'soon' },
    ],
  },
  alerts: [
    {
      id: 'a1',
      severity: 'warning',
      message: '타이어 공기압 점검 필요',
      timestamp: '2025-05-20T18:45:00Z',
    },
  ],
  diagnostics: {
    engineStatus: 'good',
    batteryHealth: 92,
    lastDiagnostic: '2025-05-15T14:20:00Z',
  },
};

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { t: _translate } = useTranslation(); // 미사용 변수에 언더스코어 추가
  const [vehicle, _setVehicleData] = useState(VEHICLE_DATA); // 미사용 변수에 언더스코어 추가
  const [refreshing, setRefreshing] = useState(false);

  // 새로고침 처리
  const onRefresh = async () => {
    setRefreshing(true);

    // 실제로는 API 호출 등으로 데이터 갱신
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // 배터리/연료 상태에 따른 색상
  const getFuelLevelColor = (level: number) => {
    if (level > 50) return ['#4ade80', '#22c55e'];
    if (level > 20) return ['#fbbf24', '#f59e0b'];
    return ['#f87171', '#ef4444'];
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy년 MM월 dd일', { locale: ko });
  };

  // 시간 포맷팅
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: ko });
  };

  // 다음 정비까지 남은 일수 표시
  const getRemainingDaysText = (days: number) => {
    if (days < 0) return '정비 기한 초과';
    if (days === 0) return '오늘 정비 예정';
    return `${days}일 남음`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>안녕하세요!</Text>
            <Text style={styles.vehicleName}>
              {vehicle.make} {vehicle.model}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Icon name="account-circle" size={40} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* 차량 상태 카드 */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleInfo}>
            <View>
              <Text style={styles.licensePlate}>{vehicle.licensePlate}</Text>
              <Text style={styles.vehicleYear}>{vehicle.year}년식</Text>
            </View>
            <Image
              source={{ uri: '../../assets/car-icon.png' }}
              style={styles.carIcon}
              resizeMode="contain"
            />
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="map-marker" size={24} color="#fff" />
              <Text style={styles.statValue}>최근 위치</Text>
              <Text style={styles.statLabel}>{formatTime(vehicle.location.lastUpdated)}</Text>
            </View>

            <View style={styles.statItem}>
              <Icon name="road-variant" size={24} color="#fff" />
              <Text style={styles.statValue}>{vehicle.mileage.toLocaleString()}km</Text>
              <Text style={styles.statLabel}>주행 거리</Text>
            </View>

            <View style={styles.statItem}>
              <Icon
                name={vehicle.fuelType === 'EV' ? 'battery' : 'gas-station'}
                size={24}
                color="#fff"
              />
              <Text style={styles.statValue}>{vehicle.fuelLevel}%</Text>
              <Text style={styles.statLabel}>{vehicle.fuelType === 'EV' ? '배터리' : '연료'}</Text>
            </View>
          </View>
        </View>

        {/* 배터리/연료 상태 */}
        <View style={styles.fuelCard}>
          <View style={styles.fuelHeader}>
            <Icon
              name={vehicle.fuelType === 'EV' ? 'battery-high' : 'gas-station'}
              size={24}
              color="#374151"
            />
            <Text style={styles.fuelTitle}>
              {vehicle.fuelType === 'EV' ? '배터리 상태' : '연료 상태'}
            </Text>
          </View>

          <View style={styles.fuelGaugeContainer}>
            <View style={styles.fuelGaugeBackground}>
              <View style={[styles.fuelGaugeFill, { width: `${vehicle.fuelLevel}%` }]} />
            </View>
            <Text style={styles.fuelPercentage}>{vehicle.fuelLevel}%</Text>
          </View>

          <TouchableOpacity
            style={styles.findStationButton}
            onPress={() => navigation.navigate('Stations')}
          >
            <Text style={styles.findStationText}>
              {vehicle.fuelType === 'EV' ? '주변 충전소 찾기' : '주변 주유소 찾기'}
            </Text>
            <Icon name="chevron-right" size={16} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* 알림 */}
        {vehicle.alerts.length > 0 && (
          <View style={styles.alertsCard}>
            <Text style={styles.sectionTitle}>알림</Text>
            {vehicle.alerts.map(alert => (
              <TouchableOpacity
                key={alert.id}
                style={styles.alertItem}
                onPress={() => navigation.navigate('Diagnosis')}
              >
                <View
                  style={[
                    styles.alertIcon,
                    alert.severity === 'critical'
                      ? styles.alertIconCritical
                      : alert.severity === 'warning'
                        ? styles.alertIconWarning
                        : styles.alertIconInfo,
                  ]}
                >
                  <Icon
                    name={
                      alert.severity === 'critical'
                        ? 'alert-circle'
                        : alert.severity === 'warning'
                          ? 'alert'
                          : 'information'
                    }
                    size={20}
                    color="white"
                  />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  <Text style={styles.alertTime}>{formatDate(alert.timestamp)}</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 정비 일정 */}
        <View style={styles.maintenanceCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>정비 일정</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Maintenance')}>
              <Text style={styles.viewAllText}>전체 보기</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.nextServiceContainer}>
            <View style={styles.nextServiceInfo}>
              <Text style={styles.nextServiceLabel}>다음 정비</Text>
              <Text style={styles.nextServiceDate}>
                {formatDate(vehicle.maintenanceStatus.nextService)}
              </Text>
              <Text style={styles.remainingDays}>
                {getRemainingDaysText(vehicle.maintenanceStatus.daysRemaining)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.scheduleButton}
              onPress={() => navigation.navigate('Reservation')}
            >
              <Text style={styles.scheduleButtonText}>예약하기</Text>
            </TouchableOpacity>
          </View>

          {vehicle.maintenanceStatus.items.map(item => (
            <View key={item.id} style={styles.maintenanceItem}>
              <Icon
                name="wrench"
                size={18}
                color={item.status === 'soon' ? '#f59e0b' : '#6b7280'}
              />
              <View style={styles.maintenanceInfo}>
                <Text style={styles.maintenanceName}>{item.name}</Text>
                <Text style={styles.maintenanceDate}>{formatDate(item.dueDate)}</Text>
              </View>
              <View
                style={[
                  styles.maintenanceStatus,
                  item.status === 'soon'
                    ? styles.maintenanceStatusSoon
                    : item.status === 'overdue'
                      ? styles.maintenanceStatusOverdue
                      : styles.maintenanceStatusUpcoming,
                ]}
              >
                <Text style={styles.maintenanceStatusText}>
                  {item.status === 'soon'
                    ? '곧 예정'
                    : item.status === 'overdue'
                      ? '기한 초과'
                      : '예정됨'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* 바로가기 메뉴 */}
        <View style={styles.quickLinksContainer}>
          <TouchableOpacity style={styles.quickLinkItem} onPress={() => navigation.navigate('Map')}>
            <View style={[styles.quickLinkIcon, { backgroundColor: '#e0f2fe' }]}>
              <Icon name="map-marker" size={24} color="#0284c7" />
            </View>
            <Text style={styles.quickLinkText}>내 차 위치</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLinkItem}
            onPress={() => navigation.navigate('Diagnosis')}
          >
            <View style={[styles.quickLinkIcon, { backgroundColor: '#dcfce7' }]}>
              <Icon name="car-wrench" size={24} color="#16a34a" />
            </View>
            <Text style={styles.quickLinkText}>자가 진단</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLinkItem}
            onPress={() => navigation.navigate('DrivingHistory')}
          >
            <View style={[styles.quickLinkIcon, { backgroundColor: '#f0fdf4' }]}>
              <Icon name="history" size={24} color="#15803d" />
            </View>
            <Text style={styles.quickLinkText}>주행 기록</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLinkItem}
            onPress={() => navigation.navigate('Reservation')}
          >
            <View style={[styles.quickLinkIcon, { backgroundColor: '#f0f9ff' }]}>
              <Icon name="calendar-check" size={24} color="#0369a1" />
            </View>
            <Text style={styles.quickLinkText}>정비 예약</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
  },
  vehicleName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  profileButton: {
    padding: 4,
  },
  vehicleCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vehicleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  licensePlate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  vehicleYear: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  carIcon: {
    width: 80,
    height: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  fuelCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  fuelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fuelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  fuelGaugeContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  fuelGaugeBackground: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
  },
  fuelGaugeFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: '#22c55e',
  },
  fuelPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 8,
    textAlign: 'right',
  },
  findStationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  findStationText: {
    fontSize: 14,
    color: '#3b82f6',
    marginRight: 4,
  },
  alertsCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertIconCritical: {
    backgroundColor: '#ef4444',
  },
  alertIconWarning: {
    backgroundColor: '#f59e0b',
  },
  alertIconInfo: {
    backgroundColor: '#3b82f6',
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  alertTime: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  maintenanceCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3b82f6',
  },
  nextServiceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  nextServiceInfo: {
    flex: 1,
  },
  nextServiceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  nextServiceDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  remainingDays: {
    fontSize: 12,
    color: '#3b82f6',
    marginTop: 2,
  },
  scheduleButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scheduleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  maintenanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 12,
  },
  maintenanceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  maintenanceName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  maintenanceDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  maintenanceStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  maintenanceStatusUpcoming: {
    backgroundColor: '#f3f4f6',
  },
  maintenanceStatusSoon: {
    backgroundColor: '#fff7ed',
  },
  maintenanceStatusOverdue: {
    backgroundColor: '#fef2f2',
  },
  maintenanceStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  quickLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: 16,
    marginTop: 0,
  },
  quickLinkItem: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginHorizontal: '1%',
  },
  quickLinkIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
});

export default HomeScreen;
