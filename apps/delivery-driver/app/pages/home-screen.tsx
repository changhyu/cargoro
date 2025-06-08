import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useDeliveryStore } from '../state/delivery-store';
import useUserStore from '../state/user-store';
import { useLocationService } from '../hooks/useLocationService';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  onPress?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, onPress }) => {
  return (
    <TouchableOpacity style={styles.statsCard} onPress={onPress} disabled={!onPress}>
      <View style={[styles.statsIconContainer, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
    </TouchableOpacity>
  );
};

interface DeliveryItemProps {
  id: string;
  customerName: string;
  vehicleNumber: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  estimatedTime: string;
}

const DeliveryItem: React.FC<DeliveryItemProps> = ({
  id,
  customerName,
  vehicleNumber,
  pickupAddress,
  deliveryAddress,
  status,
  estimatedTime,
}) => {
  const navigation = useNavigation();

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'in_progress':
        return '#3B82F6';
      case 'completed':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return '대기중';
      case 'in_progress':
        return '진행중';
      case 'completed':
        return '완료';
      case 'cancelled':
        return '취소됨';
      default:
        return '알 수 없음';
    }
  };

  return (
    <TouchableOpacity
      style={styles.deliveryItem}
      onPress={() => navigation.navigate('DeliveryDetail', { deliveryId: id })}
    >
      <View style={styles.deliveryHeader}>
        <View>
          <Text style={styles.customerName}>{customerName}</Text>
          <Text style={styles.vehicleNumber}>{vehicleNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
        </View>
      </View>

      <View style={styles.locationContainer}>
        <View style={styles.locationRow}>
          <Icon name="map-pin" size={16} color="#10B981" />
          <Text style={styles.locationText} numberOfLines={1}>
            {pickupAddress}
          </Text>
        </View>
        <View style={styles.locationDivider} />
        <View style={styles.locationRow}>
          <Icon name="flag" size={16} color="#EF4444" />
          <Text style={styles.locationText} numberOfLines={1}>
            {deliveryAddress}
          </Text>
        </View>
      </View>

      <View style={styles.deliveryFooter}>
        <Icon name="clock" size={14} color="#6B7280" />
        <Text style={styles.estimatedTime}>예상 시간: {estimatedTime}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useUserStore();
  const { deliveries, todayStats, fetchDeliveries, fetchTodayStats } = useDeliveryStore();
  const { isLocationEnabled, requestLocationPermission } = useLocationService();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    checkLocationPermission();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchDeliveries(), fetchTodayStats()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const checkLocationPermission = async () => {
    if (!isLocationEnabled) {
      Alert.alert('위치 권한 필요', '배송 서비스를 위해 위치 권한이 필요합니다.', [
        { text: '취소', style: 'cancel' },
        { text: '허용', onPress: requestLocationPermission },
      ]);
    }
  };

  const activeDeliveries = deliveries.filter(d => d.status === 'in_progress');
  const pendingDeliveries = deliveries.filter(d => d.status === 'pending');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* 인사말 섹션 */}
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>안녕하세요, {user?.name || '기사'}님!</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </Text>
      </View>

      {/* 오늘의 통계 */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>오늘의 실적</Text>
        <View style={styles.statsGrid}>
          <StatsCard
            title="완료된 배송"
            value={todayStats.completed}
            icon="check-circle"
            color="#10B981"
          />
          <StatsCard
            title="진행중인 배송"
            value={todayStats.inProgress}
            icon="truck"
            color="#3B82F6"
            onPress={() => navigation.navigate('ActiveDelivery')}
          />
          <StatsCard
            title="대기중인 배송"
            value={todayStats.pending}
            icon="clock"
            color="#F59E0B"
          />
          <StatsCard
            title="총 수익"
            value={`${todayStats.totalEarnings.toLocaleString()}원`}
            icon="dollar-sign"
            color="#8B5CF6"
          />
        </View>
      </View>

      {/* 진행중인 배송 */}
      {activeDeliveries.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>진행중인 배송</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ActiveDelivery')}>
              <Text style={styles.seeAllText}>모두 보기</Text>
            </TouchableOpacity>
          </View>
          {activeDeliveries.slice(0, 2).map(delivery => (
            <DeliveryItem key={delivery.id} {...delivery} />
          ))}
        </View>
      )}

      {/* 대기중인 배송 */}
      {pendingDeliveries.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>대기중인 배송</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Main', { screen: '배송목록' } as any)}
            >
              <Text style={styles.seeAllText}>모두 보기</Text>
            </TouchableOpacity>
          </View>
          {pendingDeliveries.slice(0, 3).map(delivery => (
            <DeliveryItem key={delivery.id} {...delivery} />
          ))}
        </View>
      )}

      {/* 빠른 액션 */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Schedule')}
        >
          <Icon name="calendar" size={20} color="#3B82F6" />
          <Text style={styles.actionText}>일정 확인</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('PaymentHistory')}
        >
          <Icon name="credit-card" size={20} color="#10B981" />
          <Text style={styles.actionText}>수익 내역</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Support')}
        >
          <Icon name="help-circle" size={20} color="#F59E0B" />
          <Text style={styles.actionText}>고객 지원</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  greetingSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
  },
  deliveryItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  vehicleNumber: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationContainer: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
    flex: 1,
  },
  locationDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
    marginLeft: 8,
    marginBottom: 8,
  },
  deliveryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estimatedTime: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  quickActions: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
  },
  actionText: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 8,
  },
});
