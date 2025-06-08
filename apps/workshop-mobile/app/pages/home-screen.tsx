import React, { useState } from 'react';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { formatInTimeZone } from 'date-fns-tz';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Logo from '../components/logo';
import { RootStackParamList, TabParamList } from '../navigation';

// 타입 정의
type RepairStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled';

interface Repair {
  id: string;
  customerName: string;
  vehicleName: string;
  vehicleNumber: string;
  serviceType: string;
  status: RepairStatus;
  assignedTo: string;
  updatedAt: string;
}

interface DashboardData {
  todayAppointments: number;
  pendingRepairs: number;
  completedToday: number;
  recentRepairs: Repair[];
}

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList & TabParamList>;

// 임시 데이터
const DUMMY_DATA: DashboardData = {
  todayAppointments: 8,
  pendingRepairs: 5,
  completedToday: 3,
  recentRepairs: [
    {
      id: 'r1',
      customerName: '김철수',
      vehicleName: '현대 그랜저',
      vehicleNumber: '123가 4567',
      serviceType: '정기 점검',
      status: 'in_progress',
      assignedTo: '박정비',
      updatedAt: '2025-05-21T09:30:00Z',
    },
    {
      id: 'r2',
      customerName: '이영희',
      vehicleName: '기아 K5',
      vehicleNumber: '234나 5678',
      serviceType: '엔진 오일 교체',
      status: 'completed',
      assignedTo: '김기술',
      updatedAt: '2025-05-21T08:15:00Z',
    },
    {
      id: 'r3',
      customerName: '박지민',
      vehicleName: 'BMW 520d',
      vehicleNumber: '345다 6789',
      serviceType: '브레이크 패드 교체',
      status: 'waiting',
      assignedTo: '미배정',
      updatedAt: '2025-05-21T10:00:00Z',
    },
  ],
};

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  // const { t } = useTranslation(); // 나중에 사용 예정
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData] = useState<DashboardData>(DUMMY_DATA);

  // 현재 날짜 표시 (한국어 로케일 직접 설정)
  const today = formatInTimeZone(new Date(), 'Asia/Seoul', 'yyyy년 MM월 dd일 (EEEE)');

  // 새로고침 처리
  const onRefresh = async () => {
    setRefreshing(true);

    // 실제로는 API 호출 등으로 데이터 갱신
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // 상태별 색상 정의
  const getStatusColor = (status: RepairStatus): string => {
    switch (status) {
      case 'waiting':
        return '#3498db';
      case 'in_progress':
        return '#f39c12';
      case 'completed':
        return '#2ecc71';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  // 상태별 텍스트 정의
  const getStatusText = (status: RepairStatus): string => {
    switch (status) {
      case 'waiting':
        return '대기 중';
      case 'in_progress':
        return '정비 중';
      case 'completed':
        return '완료됨';
      case 'cancelled':
        return '취소됨';
      default:
        return '알 수 없음';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Logo width={120} height={40} />
          <Text style={styles.dateText}>{today}</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Icon name="cog" size={24} color="#2c3e50" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 요약 정보 카드 */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconContainer, { backgroundColor: '#e8f4fc' }]}>
              <Icon name="calendar-check" size={22} color="#3498db" />
            </View>
            <Text style={styles.summaryValue}>{dashboardData.todayAppointments}</Text>
            <Text style={styles.summaryLabel}>오늘 예약</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconContainer, { backgroundColor: '#fcf3e8' }]}>
              <Icon name="wrench" size={22} color="#f39c12" />
            </View>
            <Text style={styles.summaryValue}>{dashboardData.pendingRepairs}</Text>
            <Text style={styles.summaryLabel}>진행 중</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconContainer, { backgroundColor: '#e8f6ef' }]}>
              <Icon name="check-circle" size={22} color="#2ecc71" />
            </View>
            <Text style={styles.summaryValue}>{dashboardData.completedToday}</Text>
            <Text style={styles.summaryLabel}>완료</Text>
          </View>
        </View>

        {/* 빠른 작업 버튼 */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Repairs')}
          >
            <Icon name="car-wrench" size={24} color="#3498db" />
            <Text style={styles.actionText}>정비 작업</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Customers')}
          >
            <Icon name="account-multiple" size={24} color="#3498db" />
            <Text style={styles.actionText}>고객 관리</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Inventory')}
          >
            <Icon name="package-variant" size={24} color="#3498db" />
            <Text style={styles.actionText}>부품 조회</Text>
          </TouchableOpacity>
        </View>

        {/* 최근 정비 목록 */}
        <View style={styles.recentRepairsContainer}>
          <Text style={styles.sectionTitle}>최근 정비</Text>

          {dashboardData.recentRepairs.map(repair => (
            <TouchableOpacity
              key={repair.id}
              style={styles.repairCard}
              onPress={() => navigation.navigate('RepairDetail', { repairId: repair.id })}
            >
              <View style={styles.repairHeader}>
                <Text style={styles.customerName}>{repair.customerName}</Text>
                <View style={styles.statusContainer}>
                  <View
                    style={[styles.statusDot, { backgroundColor: getStatusColor(repair.status) }]}
                  />
                  <Text style={styles.statusText}>{getStatusText(repair.status)}</Text>
                </View>
              </View>

              <View style={styles.vehicleInfo}>
                <Icon name="car" size={16} color="#7f8c8d" style={styles.infoIcon} />
                <Text style={styles.vehicleText}>
                  {repair.vehicleName} ({repair.vehicleNumber})
                </Text>
              </View>

              <View style={styles.serviceInfo}>
                <Icon name="wrench" size={16} color="#7f8c8d" style={styles.infoIcon} />
                <Text style={styles.serviceText}>{repair.serviceType}</Text>
              </View>

              <View style={styles.repairFooter}>
                <View style={styles.assignedInfo}>
                  <Icon name="account" size={14} color="#7f8c8d" style={styles.infoIcon} />
                  <Text style={styles.assignedText}>담당: {repair.assignedTo}</Text>
                </View>

                <Text style={styles.timeText}>
                  {new Date(repair.updatedAt).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('Repairs')}
          >
            <Text style={styles.viewAllText}>모든 정비 보기</Text>
            <Icon name="chevron-right" size={18} color="#3498db" />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  dateText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  settingsButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2c3e50',
    marginTop: 8,
  },
  recentRepairsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  repairCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12,
  },
  repairHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoIcon: {
    marginRight: 6,
  },
  vehicleText: {
    fontSize: 13,
    color: '#2c3e50',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 13,
    color: '#2c3e50',
  },
  repairFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assignedText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  timeText: {
    fontSize: 12,
    color: '#95a5a6',
  },
  viewAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3498db',
    marginRight: 4,
  },
});

export default HomeScreen;
