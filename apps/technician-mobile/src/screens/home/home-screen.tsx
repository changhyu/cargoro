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
import { useSession } from '../../providers/auth-provider';
import { useWorkOrderStore } from '../../stores/work-order-store';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: number;
  onPress?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, trend, onPress }) => {
  return (
    <TouchableOpacity style={styles.statsCard} onPress={onPress} disabled={!onPress}>
      <View style={[styles.statsIconContainer, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
      {trend !== undefined && (
        <View style={styles.trendContainer}>
          <Icon
            name={trend >= 0 ? 'trending-up' : 'trending-down'}
            size={14}
            color={trend >= 0 ? '#10B981' : '#EF4444'}
          />
          <Text style={[styles.trendText, { color: trend >= 0 ? '#10B981' : '#EF4444' }]}>
            {Math.abs(trend)}%
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

interface WorkOrderItemProps {
  id: string;
  vehicleNumber: string;
  vehicleModel: string;
  serviceType: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  estimatedTime: number;
  customerName: string;
}

const WorkOrderItem: React.FC<WorkOrderItemProps> = ({
  id,
  vehicleNumber,
  vehicleModel,
  serviceType,
  priority,
  status,
  estimatedTime,
  customerName,
}) => {
  const navigation = useNavigation();

  const getPriorityColor = () => {
    switch (priority) {
      case 'urgent':
        return '#EF4444';
      case 'high':
        return '#F59E0B';
      case 'normal':
        return '#3B82F6';
      case 'low':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getPriorityText = () => {
    switch (priority) {
      case 'urgent':
        return '긴급';
      case 'high':
        return '높음';
      case 'normal':
        return '보통';
      case 'low':
        return '낮음';
      default:
        return '보통';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return 'clock';
      case 'in_progress':
        return 'tool';
      case 'completed':
        return 'check-circle';
      default:
        return 'circle';
    }
  };

  return (
    <TouchableOpacity
      style={styles.workOrderItem}
      onPress={() => navigation.navigate('WorkOrderDetail', { id })}
    >
      <View style={styles.workOrderHeader}>
        <View>
          <Text style={styles.vehicleNumber}>{vehicleNumber}</Text>
          <Text style={styles.vehicleModel}>{vehicleModel}</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() + '20' }]}>
          <Text style={[styles.priorityText, { color: getPriorityColor() }]}>
            {getPriorityText()}
          </Text>
        </View>
      </View>

      <View style={styles.serviceTypeContainer}>
        <Icon name={getStatusIcon()} size={16} color="#6B7280" />
        <Text style={styles.serviceType}>{serviceType}</Text>
      </View>

      <View style={styles.workOrderFooter}>
        <Text style={styles.customerName}>{customerName}</Text>
        <View style={styles.timeContainer}>
          <Icon name="clock" size={14} color="#6B7280" />
          <Text style={styles.estimatedTime}>{estimatedTime}분</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useSession();
  const { workOrders, todayStats, fetchWorkOrders, fetchTodayStats } = useWorkOrderStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchWorkOrders(), fetchTodayStats()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'scan':
        navigation.navigate('QRScanner', { type: 'vehicle' });
        break;
      case 'inspection':
        navigation.navigate('점검');
        break;
      case 'parts':
        Alert.alert('부품 요청', '작업 지시서에서 부품을 요청할 수 있습니다.');
        break;
      case 'report':
        Alert.alert('일일 보고서', '오늘의 작업 내역을 확인하시겠습니까?');
        break;
      default:
        break;
    }
  };

  const activeWorkOrders = workOrders.filter(wo => wo.status === 'in_progress');
  const pendingWorkOrders = workOrders.filter(wo => wo.status === 'pending');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* 인사말 섹션 */}
      <View style={styles.greetingSection}>
        <View>
          <Text style={styles.greeting}>안녕하세요, {user?.name || '기술자'}님!</Text>
          <Text style={styles.workshopName}>{user?.workshopName || 'CarGoro 정비소'}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="bell" size={24} color="#1F2937" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 오늘의 통계 */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>오늘의 작업 현황</Text>
        <View style={styles.statsGrid}>
          <StatsCard
            title="완료된 작업"
            value={todayStats.completed}
            icon="check-circle"
            color="#10B981"
            trend={12}
          />
          <StatsCard
            title="진행중"
            value={todayStats.inProgress}
            icon="tool"
            color="#3B82F6"
            onPress={() => navigation.navigate('작업목록')}
          />
          <StatsCard title="대기중" value={todayStats.pending} icon="clock" color="#F59E0B" />
          <StatsCard
            title="작업 시간"
            value={`${todayStats.totalHours}h`}
            icon="activity"
            color="#8B5CF6"
            trend={-5}
          />
        </View>
      </View>

      {/* 빠른 작업 */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>빠른 작업</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('scan')}
          >
            <Icon name="maximize" size={24} color="#10B981" />
            <Text style={styles.quickActionText}>QR 스캔</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('inspection')}
          >
            <Icon name="check-square" size={24} color="#3B82F6" />
            <Text style={styles.quickActionText}>차량 점검</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('parts')}
          >
            <Icon name="package" size={24} color="#F59E0B" />
            <Text style={styles.quickActionText}>부품 요청</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('report')}
          >
            <Icon name="file-text" size={24} color="#8B5CF6" />
            <Text style={styles.quickActionText}>일일 보고</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 진행중인 작업 */}
      {activeWorkOrders.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>진행중인 작업</Text>
            <TouchableOpacity onPress={() => navigation.navigate('작업목록')}>
              <Text style={styles.seeAllText}>모두 보기</Text>
            </TouchableOpacity>
          </View>
          {activeWorkOrders.slice(0, 2).map(workOrder => (
            <WorkOrderItem key={workOrder.id} {...workOrder} />
          ))}
        </View>
      )}

      {/* 대기중인 작업 */}
      {pendingWorkOrders.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>대기중인 작업</Text>
            <TouchableOpacity onPress={() => navigation.navigate('작업목록')}>
              <Text style={styles.seeAllText}>모두 보기</Text>
            </TouchableOpacity>
          </View>
          {pendingWorkOrders.slice(0, 3).map(workOrder => (
            <WorkOrderItem key={workOrder.id} {...workOrder} />
          ))}
        </View>
      )}

      <View style={styles.bottomSpacing} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  workshopName: {
    fontSize: 14,
    color: '#6B7280',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
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
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  quickActionsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 8,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    width: '23%',
  },
  quickActionText: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 8,
    textAlign: 'center',
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
    color: '#10B981',
  },
  workOrderItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  workOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vehicleNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  vehicleModel: {
    fontSize: 14,
    color: '#6B7280',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serviceTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceType: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  workOrderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 12,
    color: '#6B7280',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estimatedTime: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  bottomSpacing: {
    height: 20,
  },
});
